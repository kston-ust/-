from __future__ import annotations

from contextlib import closing
from datetime import datetime, timedelta
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
        "image": "/products/lamb-rack.jpg",
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
        "image": "/products/lamb-leg.jpg",
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
        "image": "/products/lamb-soup.jpg",
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
        "image": "/products/lamb-carcass.jpg",
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

SUPPLY_LISTINGS = [
    (
        "LIST-001",
        "古浪黄花滩合作社",
        "古浪黄花滩数字养殖基地",
        "P-LEG",
        120,
        700,
        94,
        "2026-05-30T09:00:00",
        "listed",
    ),
    (
        "LIST-002",
        "西靖镇标准化养殖户",
        "西靖镇无抗养殖示范区",
        "P-RACK",
        80,
        410,
        97,
        "2026-05-30T11:00:00",
        "listed",
    ),
    (
        "LIST-003",
        "土门镇联营牧场",
        "土门镇冷链前置仓",
        "P-SOUP",
        600,
        56,
        91,
        "2026-05-30T14:00:00",
        "listed",
    ),
]

MERCHANTS = [
    (
        "MER-HHT",
        "古浪黄花滩合作社",
        "hht",
        "123456",
        "13800000001",
        "古浪黄花滩数字养殖基地",
        "P-LEG",
        "active",
    ),
    (
        "MER-XJ",
        "西靖镇标准化养殖户",
        "xijing",
        "123456",
        "13800000002",
        "西靖镇无抗养殖示范区",
        "P-RACK",
        "active",
    ),
    (
        "MER-TM",
        "土门镇联营牧场",
        "tumen",
        "123456",
        "13800000003",
        "土门镇冷链前置仓",
        "P-SOUP",
        "active",
    ),
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
                CREATE TABLE IF NOT EXISTS supply_listings (
                    id TEXT PRIMARY KEY,
                    farmer_name TEXT NOT NULL,
                    origin_base TEXT NOT NULL,
                    product_id TEXT NOT NULL,
                    available_quantity INTEGER NOT NULL,
                    floor_price REAL NOT NULL,
                    quality_score REAL NOT NULL,
                    available_at TEXT NOT NULL,
                    status TEXT NOT NULL,
                    FOREIGN KEY(product_id) REFERENCES products(id)
                );
                CREATE TABLE IF NOT EXISTS merchants (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    account TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    contact TEXT NOT NULL,
                    origin_base TEXT NOT NULL,
                    product_focus TEXT NOT NULL,
                    status TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS order_assignments (
                    order_id TEXT PRIMARY KEY,
                    merchant_id TEXT NOT NULL,
                    assigned_at TEXT NOT NULL,
                    due_at TEXT NOT NULL,
                    status TEXT NOT NULL,
                    note TEXT NOT NULL,
                    FOREIGN KEY(order_id) REFERENCES orders(id),
                    FOREIGN KEY(merchant_id) REFERENCES merchants(id)
                );
                """
            )
            seed_db(connection)


def seed_db(connection: sqlite3.Connection) -> None:
    if connection.execute("SELECT COUNT(*) FROM products").fetchone()[0] == 0:
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

    if connection.execute("SELECT COUNT(*) FROM supply_listings").fetchone()[0] == 0:
        connection.executemany("INSERT INTO supply_listings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", SUPPLY_LISTINGS)

    if connection.execute("SELECT COUNT(*) FROM merchants").fetchone()[0] == 0:
        connection.executemany("INSERT INTO merchants VALUES (?, ?, ?, ?, ?, ?, ?, ?)", MERCHANTS)


def _public_merchant(row: sqlite3.Row | dict[str, Any]) -> dict[str, Any]:
    merchant = dict(row)
    merchant.pop("password", None)
    return merchant


def _build_demand_summary(items: list[dict[str, Any]]) -> str:
    return "，".join(
        f"{item['name']} {item['quantity']} {item.get('unit') or '件'}" for item in items
    )


def _default_due_at(created_at: str) -> str:
    try:
        base = datetime.fromisoformat(created_at)
    except ValueError:
        base = datetime.now()
    return (base + timedelta(hours=48)).isoformat(timespec="seconds")


def fetch_products(db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    with closing(connect(db_path)) as connection:
        rows = connection.execute("SELECT * FROM products ORDER BY monthly_sales DESC").fetchall()
    return [dict(row) for row in rows]


def fetch_orders(db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    with closing(connect(db_path)) as connection:
        orders = [
            dict(row)
            for row in connection.execute(
                """
                SELECT
                    orders.*,
                    order_assignments.merchant_id AS assigned_merchant_id,
                    merchants.name AS assigned_merchant_name,
                    order_assignments.due_at AS assignment_due_at,
                    order_assignments.status AS raw_assignment_status
                FROM orders
                LEFT JOIN order_assignments ON order_assignments.order_id = orders.id
                LEFT JOIN merchants ON merchants.id = order_assignments.merchant_id
                ORDER BY orders.created_at DESC
                """
            ).fetchall()
        ]
        for order in orders:
            items = connection.execute(
                """
                SELECT order_items.product_id, order_items.name, order_items.quantity, order_items.unit_price, products.unit
                FROM order_items
                LEFT JOIN products ON products.id = order_items.product_id
                WHERE order_items.order_id = ?
                """,
                (order["id"],),
            ).fetchall()
            order["items"] = [dict(item) for item in items]
            order["assignment_status"] = "已分配" if order.get("assigned_merchant_id") else "未分配"
            order.pop("raw_assignment_status", None)
    return orders


def fetch_shipments(db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    with closing(connect(db_path)) as connection:
        rows = connection.execute("SELECT * FROM shipments").fetchall()
    return [{**dict(row), "temperature_ok": bool(row["temperature_ok"])} for row in rows]


def fetch_finance_records(db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    with closing(connect(db_path)) as connection:
        rows = connection.execute("SELECT * FROM finance_records").fetchall()
    return [dict(row) for row in rows]


def fetch_farmer_benefits(db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    with closing(connect(db_path)) as connection:
        rows = connection.execute("SELECT * FROM farmer_benefits").fetchall()
    return [dict(row) for row in rows]


def fetch_supply_listings(db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    with closing(connect(db_path)) as connection:
        rows = connection.execute(
            """
            SELECT *
            FROM supply_listings
            ORDER BY quality_score DESC, available_at ASC
            """
        ).fetchall()
    return [dict(row) for row in rows]


def fetch_merchants(db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    init_db(db_path)
    with closing(connect(db_path)) as connection:
        rows = connection.execute(
            """
            SELECT *
            FROM merchants
            WHERE status = 'active'
            ORDER BY name
            """
        ).fetchall()
    return [dict(row) for row in rows]


def authenticate_merchant(account: str, password: str, db_path: Path = DB_PATH) -> dict[str, Any] | None:
    init_db(db_path)
    with closing(connect(db_path)) as connection:
        row = connection.execute(
            """
            SELECT *
            FROM merchants
            WHERE account = ? AND password = ? AND status = 'active'
            """,
            (account.strip(), password),
        ).fetchone()
    return _public_merchant(row) if row else None


def create_merchant(payload: dict[str, Any], db_path: Path = DB_PATH) -> dict[str, Any]:
    init_db(db_path)
    account = payload["account"].strip()
    merchant_id = payload.get("id") or f"MER-{''.join(ch for ch in account.upper() if ch.isalnum())}"
    merchant = {
        "id": merchant_id,
        "name": payload["name"].strip(),
        "account": account,
        "password": payload["password"],
        "contact": payload.get("contact", "").strip(),
        "origin_base": payload.get("origin_base", "").strip(),
        "product_focus": payload.get("product_focus", "").strip() or "P-LEG",
        "status": "active",
    }
    with closing(connect(db_path)) as connection:
        with connection:
            connection.execute(
                """
                INSERT INTO merchants (id, name, account, password, contact, origin_base, product_focus, status)
                VALUES (:id, :name, :account, :password, :contact, :origin_base, :product_focus, :status)
                """,
                merchant,
            )
    return _public_merchant(merchant)


def delete_merchant(merchant_id: str, db_path: Path = DB_PATH) -> None:
    init_db(db_path)
    with closing(connect(db_path)) as connection:
        with connection:
            connection.execute("DELETE FROM merchants WHERE id = ?", (merchant_id,))


def assign_order_to_merchant(
    order_id: str,
    merchant_id: str,
    payload: dict[str, Any] | None = None,
    db_path: Path = DB_PATH,
) -> dict[str, Any]:
    init_db(db_path)
    payload = payload or {}
    with closing(connect(db_path)) as connection:
        order = connection.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        merchant = connection.execute(
            "SELECT * FROM merchants WHERE id = ? AND status = 'active'",
            (merchant_id,),
        ).fetchone()
        if not order:
            raise ValueError(f"Unknown order id: {order_id}")
        if not merchant:
            raise ValueError(f"Unknown merchant id: {merchant_id}")

        assignment = {
            "order_id": order_id,
            "merchant_id": merchant_id,
            "assigned_at": datetime.now().isoformat(timespec="seconds"),
            "due_at": payload.get("due_at") or _default_due_at(order["created_at"]),
            "status": payload.get("status") or "assigned",
            "note": payload.get("note") or "",
        }
        with connection:
            connection.execute(
                """
                INSERT INTO order_assignments (order_id, merchant_id, assigned_at, due_at, status, note)
                VALUES (:order_id, :merchant_id, :assigned_at, :due_at, :status, :note)
                ON CONFLICT(order_id) DO UPDATE SET
                    merchant_id = excluded.merchant_id,
                    assigned_at = excluded.assigned_at,
                    due_at = excluded.due_at,
                    status = excluded.status,
                    note = excluded.note
                """,
                assignment,
            )
    return assignment


def _choose_merchant_for_order(order: dict[str, Any], merchants: list[dict[str, Any]]) -> dict[str, Any] | None:
    product_ids = {item["product_id"] for item in order.get("items", [])}
    for merchant in merchants:
        if merchant["product_focus"] in product_ids:
            return merchant
    return merchants[0] if merchants else None


def batch_assign_orders(db_path: Path = DB_PATH) -> dict[str, Any]:
    init_db(db_path)
    merchants = fetch_merchants(db_path)
    assigned = []
    for order in fetch_orders(db_path):
        if order["status"] != "paid" or order["assignment_status"] == "已分配":
            continue
        merchant = _choose_merchant_for_order(order, merchants)
        if not merchant:
            continue
        assigned.append(
            assign_order_to_merchant(
                order["id"],
                merchant["id"],
                {"note": "批量分配：按订单商品与商户主供品类匹配"},
                db_path,
            )
        )
    return {"assigned_count": len(assigned), "assignments": assigned}


def fetch_merchant_tasks(merchant_id: str, db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    init_db(db_path)
    with closing(connect(db_path)) as connection:
        assignments = connection.execute(
            """
            SELECT
                order_assignments.*,
                orders.customer_name,
                orders.channel,
                orders.customer_type,
                orders.status AS order_status,
                orders.created_at,
                orders.total_amount
            FROM order_assignments
            JOIN orders ON orders.id = order_assignments.order_id
            WHERE order_assignments.merchant_id = ?
            ORDER BY order_assignments.due_at ASC, orders.created_at DESC
            """,
            (merchant_id,),
        ).fetchall()
        tasks = []
        for assignment in assignments:
            items = [
                dict(item)
                for item in connection.execute(
                    """
                    SELECT order_items.product_id, order_items.name, order_items.quantity, order_items.unit_price, products.unit
                    FROM order_items
                    LEFT JOIN products ON products.id = order_items.product_id
                    WHERE order_items.order_id = ?
                    """,
                    (assignment["order_id"],),
                ).fetchall()
            ]
            task = dict(assignment)
            task["items"] = items
            task["demand_summary"] = _build_demand_summary(items)
            tasks.append(task)
    return tasks


def fetch_merchant_listings(merchant_id: str, db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    init_db(db_path)
    with closing(connect(db_path)) as connection:
        merchant = connection.execute(
            "SELECT * FROM merchants WHERE id = ? AND status = 'active'",
            (merchant_id,),
        ).fetchone()
        if not merchant:
            return []
        rows = connection.execute(
            """
            SELECT *
            FROM supply_listings
            WHERE farmer_name = ? OR origin_base = ?
            ORDER BY available_at DESC, quality_score DESC
            """,
            (merchant["name"], merchant["origin_base"]),
        ).fetchall()
    return [dict(row) for row in rows]


def create_supply_listing_for_merchant(
    merchant_id: str,
    payload: dict[str, Any],
    db_path: Path = DB_PATH,
) -> dict[str, Any]:
    init_db(db_path)
    with closing(connect(db_path)) as connection:
        merchant = connection.execute(
            "SELECT * FROM merchants WHERE id = ? AND status = 'active'",
            (merchant_id,),
        ).fetchone()
        product = connection.execute("SELECT * FROM products WHERE id = ?", (payload["product_id"],)).fetchone()
        if not merchant:
            raise ValueError(f"Unknown merchant id: {merchant_id}")
        if not product:
            raise ValueError(f"Unknown product id: {payload['product_id']}")

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
        listing = {
            "id": payload.get("id") or f"LIST-{merchant_id.replace('MER-', '')}-{timestamp}",
            "farmer_name": merchant["name"],
            "origin_base": merchant["origin_base"],
            "product_id": payload["product_id"],
            "available_quantity": int(payload["available_quantity"]),
            "floor_price": float(payload["floor_price"]),
            "quality_score": float(payload.get("quality_score", 90)),
            "available_at": payload.get("available_at") or datetime.now().isoformat(timespec="seconds"),
            "status": "listed",
        }
        with connection:
            connection.execute(
                """
                INSERT INTO supply_listings (
                    id, farmer_name, origin_base, product_id, available_quantity,
                    floor_price, quality_score, available_at, status
                )
                VALUES (
                    :id, :farmer_name, :origin_base, :product_id, :available_quantity,
                    :floor_price, :quality_score, :available_at, :status
                )
                """,
                listing,
            )
    return listing


def fetch_customer_orders(keyword: str, db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    normalized = keyword.strip().lower()
    if not normalized:
        return []
    matched = []
    for order in fetch_orders(db_path):
        item_names = " ".join(item["name"] for item in order.get("items", []))
        haystack = f"{order['id']} {order['customer_name']} {order['channel']} {item_names}".lower()
        if normalized in haystack:
            matched.append(order)
    return matched


def fetch_order_analysis(db_path: Path = DB_PATH) -> dict[str, Any]:
    init_db(db_path)
    orders = fetch_orders(db_path)
    assigned_order_count = sum(1 for order in orders if order["assignment_status"] == "已分配")
    daily: dict[str, dict[str, Any]] = {}
    product_sales: dict[str, dict[str, Any]] = {}

    for order in orders:
        day = order["created_at"][:10]
        daily.setdefault(day, {"date": day, "order_count": 0, "gmv": 0})
        daily[day]["order_count"] += 1
        daily[day]["gmv"] += float(order["total_amount"])
        for item in order.get("items", []):
            bucket = product_sales.setdefault(
                item["product_id"],
                {
                    "product_id": item["product_id"],
                    "name": item["name"],
                    "quantity": 0,
                    "revenue": 0,
                },
            )
            bucket["quantity"] += int(item["quantity"])
            bucket["revenue"] += float(item["quantity"]) * float(item["unit_price"])

    return {
        "total_order_count": len(orders),
        "assigned_order_count": assigned_order_count,
        "unassigned_order_count": len(orders) - assigned_order_count,
        "paid_order_count": sum(1 for order in orders if order["status"] == "paid"),
        "daily_trend": list(sorted(daily.values(), key=lambda item: item["date"])),
        "product_sales": list(
            sorted(product_sales.values(), key=lambda item: (-item["quantity"], item["product_id"]))
        ),
    }


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


def create_order(payload: dict[str, Any], db_path: Path = DB_PATH) -> dict[str, Any]:
    products = {product["id"]: product for product in fetch_products(db_path)}
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

    with closing(connect(db_path)) as connection:
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
