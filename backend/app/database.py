from __future__ import annotations

from contextlib import closing
import sqlite3
from pathlib import Path
from typing import Any

from .summary import build_change_version


DB_PATH = Path(__file__).resolve().parents[1] / "online_trade.db"


PRODUCTS = [
    {
        "id": "P-RACK",
        "name": "北纬37度法式羊排",
        "category": "溢价产品",
        "origin": "甘肃古浪数字示范养殖区",
        "scene": "家庭煎烤 / 礼赠",
        "price": 460,
        "unit": "盒",
        "stock": 280,
        "monthly_sales": 368,
        "digital_premium_rate": 0.28,
        "trace_label": "区块链溯源卡 + 无抗养殖记录",
        "image": "rack",
    },
    {
        "id": "P-LEG",
        "name": "古浪精修羊腿",
        "category": "增长产品",
        "origin": "西北羊都产地中心仓",
        "scene": "火锅连锁 / 团餐集采",
        "price": 780,
        "unit": "箱",
        "stock": 160,
        "monthly_sales": 520,
        "digital_premium_rate": 0.22,
        "trace_label": "24道智慧加工工序记录",
        "image": "leg",
    },
    {
        "id": "P-SOUP",
        "name": "即食羊汤预制包",
        "category": "增长产品",
        "origin": "0-4℃排酸冷链加工线",
        "scene": "一人食 / 社区团购",
        "price": 69,
        "unit": "份",
        "stock": 1200,
        "monthly_sales": 930,
        "digital_premium_rate": 0.18,
        "trace_label": "批次检疫合格证 + 温控轨迹",
        "image": "soup",
    },
    {
        "id": "P-CARCASS",
        "name": "标准化白条羊",
        "category": "基石产品",
        "origin": "古浪合作社直采",
        "scene": "B端战略集采",
        "price": 1280,
        "unit": "只",
        "stock": 90,
        "monthly_sales": 210,
        "digital_premium_rate": 0.12,
        "trace_label": "电子耳标 + 屠宰检疫联单",
        "image": "carcass",
    },
]

ORDERS = [
    ("ORD-202605-001", "西北火锅北京旗舰店", "B端集采", "火锅连锁", "paid", "2026-05-25T09:30:00", 128000),
    ("ORD-202605-002", "上海陆家嘴家庭会员", "C端小程序", "家庭会员", "paid", "2026-05-25T14:10:00", 3680),
    ("ORD-202605-003", "深圳高端社区团购", "C端小程序", "家庭会员", "pending", "2026-05-26T11:20:00", 920),
    ("ORD-202605-004", "华东精品商超", "B端集采", "生鲜商超", "paid", "2026-05-27T16:45:00", 62500),
]

ORDER_ITEMS = [
    ("ORD-202605-001", "P-LEG", "古浪精修羊腿", 80, 780),
    ("ORD-202605-001", "P-CARCASS", "标准化白条羊", 50, 1280),
    ("ORD-202605-002", "P-RACK", "北纬37度法式羊排", 8, 460),
    ("ORD-202605-003", "P-RACK", "北纬37度法式羊排", 2, 460),
    ("ORD-202605-004", "P-SOUP", "即食羊汤预制包", 500, 69),
    ("ORD-202605-004", "P-LEG", "古浪精修羊腿", 36, 780),
]

SHIPMENTS = [
    ("ORD-202605-001", 30, 0.025, 1),
    ("ORD-202605-002", 20, 0.018, 1),
    ("ORD-202605-004", 36, 0.028, 1),
]

FINANCE_RECORDS = [
    ("F-001", 200000, 0.018),
    ("F-002", 120000, 0.015),
    ("F-003", 180000, 0.017),
]

FARMER_BENEFITS = [
    ("F-001", 6800, 1500),
    ("F-002", 4200, 900),
    ("F-003", 5300, 1200),
]


def connect(db_path: Path = DB_PATH) -> sqlite3.Connection:
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


def init_db(db_path: Path = DB_PATH) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with closing(connect(db_path)) as connection:
        with connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    origin TEXT NOT NULL,
                    scene TEXT NOT NULL,
                    price REAL NOT NULL,
                    unit TEXT NOT NULL,
                    stock INTEGER NOT NULL,
                    monthly_sales INTEGER NOT NULL,
                    digital_premium_rate REAL NOT NULL,
                    trace_label TEXT NOT NULL,
                    image TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS orders (
                    id TEXT PRIMARY KEY,
                    customer_name TEXT NOT NULL,
                    channel TEXT NOT NULL,
                    customer_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    total_amount REAL NOT NULL
                );
                CREATE TABLE IF NOT EXISTS order_items (
                    order_id TEXT NOT NULL,
                    product_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    quantity INTEGER NOT NULL,
                    unit_price REAL NOT NULL,
                    FOREIGN KEY(order_id) REFERENCES orders(id)
                );
                CREATE TABLE IF NOT EXISTS shipments (
                    order_id TEXT PRIMARY KEY,
                    hours_to_delivery REAL NOT NULL,
                    loss_rate REAL NOT NULL,
                    temperature_ok INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS finance_records (
                    farmer_id TEXT NOT NULL,
                    loan_amount REAL NOT NULL,
                    service_fee_rate REAL NOT NULL
                );
                CREATE TABLE IF NOT EXISTS farmer_benefits (
                    farmer_id TEXT NOT NULL,
                    premium_income REAL NOT NULL,
                    dividend REAL NOT NULL
                );
                """
            )
            seed_db(connection)


def seed_db(connection: sqlite3.Connection) -> None:
    product_count = connection.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    if product_count:
        return

    connection.executemany(
        """
        INSERT INTO products (
            id, name, category, origin, scene, price, unit, stock, monthly_sales,
            digital_premium_rate, trace_label, image
        )
        VALUES (
            :id, :name, :category, :origin, :scene, :price, :unit, :stock, :monthly_sales,
            :digital_premium_rate, :trace_label, :image
        )
        """,
        PRODUCTS,
    )
    connection.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?)", ORDERS)
    connection.executemany("INSERT INTO order_items VALUES (?, ?, ?, ?, ?)", ORDER_ITEMS)
    connection.executemany("INSERT INTO shipments VALUES (?, ?, ?, ?)", SHIPMENTS)
    connection.executemany("INSERT INTO finance_records VALUES (?, ?, ?)", FINANCE_RECORDS)
    connection.executemany("INSERT INTO farmer_benefits VALUES (?, ?, ?)", FARMER_BENEFITS)


def fetch_products() -> list[dict[str, Any]]:
    with closing(connect()) as connection:
        rows = connection.execute("SELECT * FROM products ORDER BY monthly_sales DESC").fetchall()
    return [dict(row) for row in rows]


def fetch_orders() -> list[dict[str, Any]]:
    with closing(connect()) as connection:
        orders = [dict(row) for row in connection.execute("SELECT * FROM orders ORDER BY created_at DESC").fetchall()]
        for order in orders:
            items = connection.execute(
                "SELECT product_id, name, quantity, unit_price FROM order_items WHERE order_id = ?",
                (order["id"],),
            ).fetchall()
            order["items"] = [dict(item) for item in items]
    return orders


def fetch_shipments() -> list[dict[str, Any]]:
    with closing(connect()) as connection:
        rows = connection.execute("SELECT * FROM shipments").fetchall()
    return [{**dict(row), "temperature_ok": bool(row["temperature_ok"])} for row in rows]


def fetch_finance_records() -> list[dict[str, Any]]:
    with closing(connect()) as connection:
        rows = connection.execute("SELECT * FROM finance_records").fetchall()
    return [dict(row) for row in rows]


def fetch_farmer_benefits() -> list[dict[str, Any]]:
    with closing(connect()) as connection:
        rows = connection.execute("SELECT * FROM farmer_benefits").fetchall()
    return [dict(row) for row in rows]


def fetch_order_change_state(db_path: Path = DB_PATH) -> dict[str, Any]:
    with closing(connect(db_path)) as connection:
        totals = connection.execute(
            """
            SELECT COUNT(*) AS order_count, COALESCE(SUM(total_amount), 0) AS total_gmv
            FROM orders
            WHERE status = 'paid'
            """
        ).fetchone()
        latest = connection.execute(
            """
            SELECT id, created_at
            FROM orders
            WHERE status = 'paid'
            ORDER BY created_at DESC, id DESC
            LIMIT 1
            """
        ).fetchone()

    order_count = int(totals["order_count"])
    total_gmv = int(round(float(totals["total_gmv"])))
    latest_order_id = latest["id"] if latest else None
    latest_order_at = latest["created_at"] if latest else None
    return {
        "version": build_change_version(order_count, latest_order_id, total_gmv),
        "order_count": order_count,
        "latest_order_id": latest_order_id,
        "latest_order_at": latest_order_at,
        "total_gmv": total_gmv,
    }


def create_order(payload: dict[str, Any]) -> dict[str, Any]:
    products = {product["id"]: product for product in fetch_products()}
    items = []
    total_amount = 0
    for item in payload["items"]:
        product = products[item["product_id"]]
        quantity = int(item["quantity"])
        unit_price = float(product["price"])
        total_amount += quantity * unit_price
        items.append(
            {
                "product_id": product["id"],
                "name": product["name"],
                "quantity": quantity,
                "unit_price": unit_price,
            }
        )

    order_id = payload["id"]
    order = {
        "id": order_id,
        "customer_name": payload["customer_name"],
        "channel": payload["channel"],
        "customer_type": payload["customer_type"],
        "status": "paid",
        "created_at": payload["created_at"],
        "total_amount": total_amount,
        "items": items,
    }

    with closing(connect()) as connection:
        with connection:
            connection.execute(
                "INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    order["id"],
                    order["customer_name"],
                    order["channel"],
                    order["customer_type"],
                    order["status"],
                    order["created_at"],
                    order["total_amount"],
                ),
            )
            connection.executemany(
                "INSERT INTO order_items VALUES (?, ?, ?, ?, ?)",
                [
                    (order_id, item["product_id"], item["name"], item["quantity"], item["unit_price"])
                    for item in items
                ],
            )
    return order
