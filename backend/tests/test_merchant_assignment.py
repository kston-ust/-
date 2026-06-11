import tempfile
import unittest
from pathlib import Path

from app.database import (
    assign_order_to_merchant,
    authenticate_merchant,
    batch_assign_orders,
    create_supply_listing_for_merchant,
    create_merchant,
    delete_merchant,
    fetch_customer_orders,
    fetch_merchant_listings,
    fetch_merchant_tasks,
    fetch_merchants,
    fetch_order_analysis,
    fetch_orders,
    init_db,
)


class MerchantAssignmentTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp_dir.name) / "trade.db"
        init_db(self.db_path)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_seeded_merchant_login_uses_account_and_password(self):
        merchant = authenticate_merchant("hht", "123456", self.db_path)

        self.assertIsNotNone(merchant)
        self.assertEqual(merchant["id"], "MER-HHT")
        self.assertEqual(merchant["name"], "古浪黄花滩合作社")
        self.assertNotIn("password", merchant)
        self.assertIsNone(authenticate_merchant("hht", "wrong", self.db_path))

    def test_platform_can_create_and_delete_merchants_for_login_management(self):
        created = create_merchant(
            {
                "name": "海子滩新农户",
                "account": "haizitan",
                "password": "abc12345",
                "contact": "13900000000",
                "origin_base": "海子滩补饲基地",
                "product_focus": "P-RACK",
            },
            self.db_path,
        )

        self.assertEqual(created["account"], "haizitan")
        self.assertIn(created["id"], {merchant["id"] for merchant in fetch_merchants(self.db_path)})

        delete_merchant(created["id"], self.db_path)

        self.assertNotIn(created["id"], {merchant["id"] for merchant in fetch_merchants(self.db_path)})

    def test_backend_merchant_management_list_includes_login_password(self):
        merchant = next(item for item in fetch_merchants(self.db_path) if item["id"] == "MER-HHT")

        self.assertEqual(merchant["account"], "hht")
        self.assertEqual(merchant["password"], "123456")

    def test_single_assignment_marks_order_and_creates_merchant_task(self):
        assignment = assign_order_to_merchant(
            "ORD-202605-004",
            "MER-TM",
            {"due_at": "2026-05-30T18:00:00", "note": "优先羊汤预制包"},
            self.db_path,
        )

        self.assertEqual(assignment["order_id"], "ORD-202605-004")
        self.assertEqual(assignment["merchant_id"], "MER-TM")

        order = next(order for order in fetch_orders(self.db_path) if order["id"] == "ORD-202605-004")
        self.assertEqual(order["assignment_status"], "已分配")
        self.assertEqual(order["assigned_merchant_name"], "土门镇联营牧场")

        tasks = fetch_merchant_tasks("MER-TM", self.db_path)
        self.assertEqual(tasks[0]["order_id"], "ORD-202605-004")
        self.assertEqual(tasks[0]["customer_name"], "华东精品商超")
        self.assertEqual(tasks[0]["due_at"], "2026-05-30T18:00:00")
        self.assertIn("即食羊汤预制包", tasks[0]["demand_summary"])

    def test_batch_assignment_allocates_paid_unassigned_orders_to_matching_merchants(self):
        result = batch_assign_orders(self.db_path)

        self.assertGreaterEqual(result["assigned_count"], 3)
        paid_orders = [order for order in fetch_orders(self.db_path) if order["status"] == "paid"]
        self.assertTrue(all(order["assignment_status"] == "已分配" for order in paid_orders))

    def test_merchant_can_create_supply_listing_for_farmer_posting(self):
        listing = create_supply_listing_for_merchant(
            "MER-HHT",
            {
                "product_id": "P-CARCASS",
                "available_quantity": 20,
                "floor_price": 1180,
                "quality_score": 93,
                "available_at": "2026-05-31T08:00:00",
            },
            self.db_path,
        )

        self.assertEqual(listing["farmer_name"], "古浪黄花滩合作社")
        self.assertEqual(listing["origin_base"], "古浪黄花滩数字养殖基地")
        self.assertEqual(listing["product_id"], "P-CARCASS")

        merchant_listings = fetch_merchant_listings("MER-HHT", self.db_path)
        self.assertIn(listing["id"], {item["id"] for item in merchant_listings})

    def test_customer_order_query_and_analysis_support_frontend_and_backend_dashboards(self):
        matches = fetch_customer_orders("华东", self.db_path)

        self.assertEqual([order["id"] for order in matches], ["ORD-202605-004"])

        assign_order_to_merchant("ORD-202605-004", "MER-TM", {}, self.db_path)
        analysis = fetch_order_analysis(self.db_path)

        self.assertEqual(analysis["total_order_count"], 4)
        self.assertEqual(analysis["assigned_order_count"], 1)
        self.assertGreaterEqual(analysis["unassigned_order_count"], 3)
        self.assertEqual(analysis["daily_trend"][-1]["date"], "2026-05-27")
        self.assertIn("P-SOUP", {item["product_id"] for item in analysis["product_sales"]})


class MerchantApiSurfaceTest(unittest.TestCase):
    def test_backend_exposes_merchant_assignment_and_analysis_routes(self):
        from app.main import app

        paths = {route.path for route in app.routes}

        self.assertIn("/api/merchant/login", paths)
        self.assertIn("/api/merchant/{merchant_id}/tasks", paths)
        self.assertIn("/api/merchant/{merchant_id}/listings", paths)
        self.assertIn("/api/customer/orders", paths)
        self.assertIn("/api/merchants", paths)
        self.assertIn("/api/orders/{order_id}/assign", paths)
        self.assertIn("/api/orders/assign-batch", paths)
        self.assertIn("/api/order-analysis", paths)
