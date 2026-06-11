from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime
from typing import Annotated

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

from .admin_console import build_admin_console_html
from .database import (
    assign_order_to_merchant,
    authenticate_merchant,
    batch_assign_orders,
    create_supply_listing_for_merchant,
    create_order,
    create_merchant,
    delete_merchant,
    fetch_customer_orders,
    fetch_farmer_benefits,
    fetch_finance_records,
    fetch_merchant_listings,
    fetch_merchant_tasks,
    fetch_merchants,
    fetch_order_change_state,
    fetch_order_analysis,
    fetch_orders,
    fetch_products,
    fetch_shipments,
    fetch_supply_listings,
    init_db,
)
from .summary import build_business_summary
from .supply_chain import build_supply_matches


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="西域羊都网上交易程序 API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5179",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OrderItemIn(BaseModel):
    product_id: str
    quantity: Annotated[int, Field(ge=1, le=999)]


class OrderIn(BaseModel):
    customer_name: Annotated[str, Field(min_length=2)]
    channel: str = "C端小程序"
    customer_type: str = "家庭会员"
    items: list[OrderItemIn]


class MerchantLoginIn(BaseModel):
    account: Annotated[str, Field(min_length=2)]
    password: Annotated[str, Field(min_length=4)]


class MerchantIn(BaseModel):
    name: Annotated[str, Field(min_length=2)]
    account: Annotated[str, Field(min_length=2)]
    password: Annotated[str, Field(min_length=4)]
    contact: str = ""
    origin_base: str = ""
    product_focus: str = "P-LEG"


class AssignmentIn(BaseModel):
    merchant_id: str
    due_at: str | None = None
    note: str = ""


class SupplyListingIn(BaseModel):
    product_id: str
    available_quantity: Annotated[int, Field(ge=1, le=999999)]
    floor_price: Annotated[float, Field(gt=0)]
    quality_score: Annotated[float, Field(ge=0, le=100)] = 90
    available_at: str | None = None


@app.get("/", response_class=HTMLResponse)
@app.get("/admin", response_class=HTMLResponse)
def admin_console() -> str:
    init_db()
    return build_admin_console_html()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "xiyu-yangdu-online-trade"}


@app.get("/api/products")
def products() -> list[dict]:
    init_db()
    return fetch_products()


@app.get("/api/orders")
def orders() -> list[dict]:
    init_db()
    return fetch_orders()


@app.get("/api/customer/orders")
def customer_orders(keyword: str = "") -> list[dict]:
    init_db()
    return fetch_customer_orders(keyword)


@app.post("/api/merchant/login")
def merchant_login(payload: MerchantLoginIn) -> dict:
    init_db()
    merchant = authenticate_merchant(payload.account, payload.password)
    if not merchant:
        raise HTTPException(status_code=401, detail="商户账号或密码不正确")
    return merchant


@app.get("/api/merchant/{merchant_id}/tasks")
def merchant_tasks(merchant_id: str) -> list[dict]:
    init_db()
    return fetch_merchant_tasks(merchant_id)


@app.get("/api/merchant/{merchant_id}/listings")
def merchant_listings(merchant_id: str) -> list[dict]:
    init_db()
    return fetch_merchant_listings(merchant_id)


@app.post("/api/merchant/{merchant_id}/listings", status_code=201)
def add_merchant_listing(merchant_id: str, payload: SupplyListingIn) -> dict:
    try:
        return create_supply_listing_for_merchant(merchant_id, payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/api/merchants")
def merchants() -> list[dict]:
    init_db()
    return fetch_merchants()


@app.post("/api/merchants", status_code=201)
def add_merchant(payload: MerchantIn) -> dict:
    try:
        return create_merchant(payload.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.delete("/api/merchants/{merchant_id}")
def remove_merchant(merchant_id: str) -> None:
    init_db()
    delete_merchant(merchant_id)


@app.post("/api/orders/{order_id}/assign")
def assign_order(order_id: str, payload: AssignmentIn) -> dict:
    try:
        return assign_order_to_merchant(order_id, payload.merchant_id, payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/api/orders/assign-batch")
def assign_orders_batch() -> dict:
    init_db()
    return batch_assign_orders()


@app.get("/api/order-analysis")
def order_analysis() -> dict:
    init_db()
    return fetch_order_analysis()


@app.get("/api/change-state")
def change_state() -> dict:
    init_db()
    return fetch_order_change_state()


@app.get("/api/supply-listings")
def supply_listings() -> list[dict]:
    init_db()
    return fetch_supply_listings()


@app.get("/api/supply-matches")
def supply_matches() -> list[dict]:
    init_db()
    return build_supply_matches(fetch_orders(), fetch_supply_listings(), fetch_products())


@app.post("/api/orders", status_code=201)
def submit_order(payload: OrderIn) -> dict:
    init_db()
    product_ids = {product["id"] for product in fetch_products()}
    missing = [item.product_id for item in payload.items if item.product_id not in product_ids]
    if missing:
        raise HTTPException(status_code=400, detail=f"Unknown product id: {', '.join(missing)}")

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
    return create_order(
        {
            "id": f"ORD-DEMO-{timestamp}",
            "customer_name": payload.customer_name,
            "channel": payload.channel,
            "customer_type": payload.customer_type,
            "created_at": datetime.now().isoformat(timespec="seconds"),
            "items": [item.model_dump() for item in payload.items],
        }
    )


@app.get("/api/summary")
def summary() -> dict:
    init_db()
    return build_business_summary(
        fetch_orders(),
        fetch_shipments(),
        fetch_finance_records(),
        fetch_farmer_benefits(),
    )


@app.get("/api/trace/{product_id}")
def trace(product_id: str) -> dict:
    init_db()
    product = next((item for item in fetch_products() if item["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {
        "product_id": product["id"],
        "product_name": product["name"],
        "trace_label": product["trace_label"],
        "nodes": [
            "电子耳标确权",
            "无抗养殖台账",
            "屠宰检疫合格",
            "0-4℃冷链轨迹",
            "终端扫码验真",
        ],
    }
