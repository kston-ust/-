from __future__ import annotations

from datetime import datetime
from typing import Annotated

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .database import (
    create_order,
    fetch_farmer_benefits,
    fetch_finance_records,
    fetch_orders,
    fetch_products,
    fetch_shipments,
    init_db,
)
from .summary import build_business_summary


app = FastAPI(title="西域羊都网上交易程序 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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


@app.on_event("startup")
def startup() -> None:
    init_db()


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


@app.post("/api/orders", status_code=201)
def submit_order(payload: OrderIn) -> dict:
    init_db()
    product_ids = {product["id"] for product in fetch_products()}
    missing = [item.product_id for item in payload.items if item.product_id not in product_ids]
    if missing:
        raise HTTPException(status_code=400, detail=f"Unknown product id: {', '.join(missing)}")

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
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
