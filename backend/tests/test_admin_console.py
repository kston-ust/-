import unittest

from app.admin_console import build_admin_console_html


class AdminConsoleTest(unittest.TestCase):
    def test_admin_console_is_data_view_for_operations(self):
        html = build_admin_console_html()

        self.assertIn("运营数据中心", html)
        self.assertIn("订单监控", html)
        self.assertIn("商品库存", html)
        self.assertIn("履约监控", html)
        self.assertIn("/api/change-state", html)
        self.assertIn("/api/orders", html)
        self.assertIn("setInterval(refreshState", html)
        self.assertIn("filterOrders", html)

    def test_admin_console_does_not_create_frontend_orders(self):
        html = build_admin_console_html()

        self.assertNotIn("提交模拟订单", html)
        self.assertNotIn("提交到后端", html)
        self.assertNotIn("function submitOrder", html)
        self.assertNotIn('method: "POST"', html)
        self.assertNotIn("<form", html)


if __name__ == "__main__":
    unittest.main()
