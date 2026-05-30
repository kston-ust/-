from __future__ import annotations

from collections import defaultdict
from typing import Any


def _round_money(value: float) -> int:
    return int(round(value))


def _average(values: list[float]) -> float:
    if not values:
        return 0
    return round(sum(values) / len(values), 4)


def build_change_version(order_count: int, latest_order_id: str | None, total_gmv: float) -> str:
    return f"{order_count}:{latest_order_id or 'none'}:{_round_money(total_gmv)}"


def _looks_garbled(value: str) -> bool:
    return "?" in value or "\ufffd" in value or "锟" in value


def normalize_channel_label(value: Any) -> str:
    label = str(value or "").strip()
    if not label:
        return "其他来源"
    if _looks_garbled(label):
        if label.upper().startswith("B"):
            return "B端集采"
        if label.upper().startswith("C"):
            return "C端小程序"
        return "其他来源"
    return label


def normalize_customer_type_label(value: Any) -> str:
    label = str(value or "").strip()
    if not label or _looks_garbled(label):
        return "其他客户"
    return label


def build_business_summary(
    orders: list[dict[str, Any]],
    shipments: list[dict[str, Any]],
    finance: list[dict[str, Any]],
    farmer_benefits: list[dict[str, Any]],
) -> dict[str, Any]:
    paid_orders = [order for order in orders if order.get("status") == "paid"]
    gmv = _round_money(sum(float(order.get("total_amount", 0)) for order in paid_orders))
    paid_order_count = len(paid_orders)
    average_order_value = _round_money(gmv / paid_order_count) if paid_order_count else 0

    product_sales: dict[str, dict[str, Any]] = defaultdict(lambda: {"name": "", "quantity": 0, "revenue": 0})
    channel_revenue: dict[str, float] = defaultdict(float)
    customer_mix: dict[str, int] = defaultdict(int)
    for order in paid_orders:
        channel_revenue[normalize_channel_label(order.get("channel"))] += float(order.get("total_amount", 0))
        customer_mix[normalize_customer_type_label(order.get("customer_type"))] += 1
        for item in order.get("items", []):
            product_id = str(item.get("product_id"))
            record = product_sales[product_id]
            record["name"] = item.get("name", product_id)
            record["quantity"] += int(item.get("quantity", 0))
            record["revenue"] += float(item.get("quantity", 0)) * float(item.get("unit_price", 0))

    top_product = None
    if product_sales:
        top_product = max(product_sales.values(), key=lambda item: item["revenue"])
        top_product = {
            "name": top_product["name"],
            "quantity": top_product["quantity"],
            "revenue": _round_money(top_product["revenue"]),
        }

    shipment_hours = [float(item.get("hours_to_delivery", 0)) for item in shipments]
    loss_rates = [float(item.get("loss_rate", 0)) for item in shipments]
    temperature_pass_count = sum(1 for item in shipments if item.get("temperature_ok"))
    temperature_pass_rate = round(temperature_pass_count / len(shipments), 4) if shipments else 0

    loan_volume = _round_money(sum(float(item.get("loan_amount", 0)) for item in finance))
    platform_service_fee = _round_money(
        sum(float(item.get("loan_amount", 0)) * float(item.get("service_fee_rate", 0)) for item in finance)
    )

    farmer_ids = {str(item.get("farmer_id")) for item in farmer_benefits if item.get("farmer_id")}
    total_incremental_income = _round_money(
        sum(float(item.get("premium_income", 0)) + float(item.get("dividend", 0)) for item in farmer_benefits)
    )

    return {
        "trade": {
            "gmv": gmv,
            "paid_order_count": paid_order_count,
            "average_order_value": average_order_value,
            "top_product": top_product,
            "channel_revenue": {key: _round_money(value) for key, value in sorted(channel_revenue.items())},
            "customer_mix": dict(sorted(customer_mix.items())),
        },
        "fulfillment": {
            "average_delivery_hours": _average(shipment_hours),
            "average_loss_rate": _average(loss_rates),
            "temperature_pass_rate": temperature_pass_rate,
            "jit_target_hours": 48,
            "loss_rate_target": 0.03,
        },
        "finance": {
            "loan_volume": loan_volume,
            "platform_service_fee": platform_service_fee,
            "average_service_fee_rate": _average([float(item.get("service_fee_rate", 0)) for item in finance]),
        },
        "farmer_value": {
            "farmer_count": len(farmer_ids),
            "total_incremental_income": total_incremental_income,
            "average_incremental_income": _round_money(total_incremental_income / len(farmer_ids))
            if farmer_ids
            else 0,
        },
    }
