from __future__ import annotations

from typing import Any


def _premium_rate(quality_score: float) -> float:
    return round(min(0.18, max(0.05, (quality_score - 85) / 100)), 4)


def _settlement_price(floor_price: float, quality_score: float) -> int:
    return int(round(floor_price * (1 + _premium_rate(quality_score))))


def build_supply_matches(
    orders: list[dict[str, Any]],
    listings: list[dict[str, Any]],
    products: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    product_lookup = {product["id"]: product for product in products}
    available_listings = [
        {**listing, "_remaining": int(listing.get("available_quantity", 0))}
        for listing in listings
        if listing.get("status") == "listed" and int(listing.get("available_quantity", 0)) > 0
    ]

    matches: list[dict[str, Any]] = []
    for order in orders:
        if order.get("status") != "paid":
            continue
        for item in order.get("items", []):
            product_id = item.get("product_id")
            quantity = int(item.get("quantity", 0))
            listing = next(
                (
                    candidate
                    for candidate in available_listings
                    if candidate.get("product_id") == product_id and candidate["_remaining"] > 0
                ),
                None,
            )
            if not listing or quantity <= 0:
                continue

            matched_quantity = min(quantity, listing["_remaining"])
            listing["_remaining"] -= matched_quantity
            quality_score = float(listing.get("quality_score", 0))
            floor_price = float(listing.get("floor_price", 0))
            product = product_lookup.get(str(product_id), {})
            matches.append(
                {
                    "order_id": order["id"],
                    "customer_name": order.get("customer_name", ""),
                    "channel": order.get("channel", ""),
                    "product_id": product_id,
                    "product_name": item.get("name") or product.get("name", product_id),
                    "listing_id": listing["id"],
                    "farmer_name": listing["farmer_name"],
                    "origin_base": listing["origin_base"],
                    "matched_quantity": matched_quantity,
                    "pricing": {
                        "floor_price": int(round(floor_price)),
                        "settlement_price": _settlement_price(floor_price, quality_score),
                        "terminal_reference_price": int(round(float(product.get("price", item.get("unit_price", 0))))),
                        "premium_rate": _premium_rate(quality_score),
                    },
                    "jit": {
                        "status": "订单即排产",
                        "slaughter_window": "T+0.5天",
                        "cold_chain_target_hours": 48,
                        "loss_rate_target": 0.03,
                    },
                }
            )

    return matches
