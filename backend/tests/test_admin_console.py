import unittest

from app.admin_console import build_admin_console_html


class AdminConsoleTest(unittest.TestCase):
    def test_admin_console_is_data_view_for_operations(self):
        html = build_admin_console_html()

        self.assertIn("运营数据中心", html)
        self.assertIn("订单监控", html)
        self.assertIn("分配状态", html)
        self.assertIn("商户管理", html)
        self.assertIn("merchant.password", html)
        self.assertIn("密码", html)
        self.assertIn("批量分配", html)
        self.assertIn("趋势分析", html)
        self.assertIn("商品库存", html)
        self.assertIn("履约监控", html)
        self.assertIn("/api/change-state", html)
        self.assertIn("/api/orders", html)
        self.assertIn("/api/merchants", html)
        self.assertIn("/api/orders/assign-batch", html)
        self.assertIn("/api/order-analysis", html)
        self.assertIn("setInterval(refreshState", html)
        self.assertIn("filterOrders", html)
        self.assertIn("function displayChannel", html)
        self.assertIn("其他来源", html)

    def test_admin_console_does_not_create_frontend_orders(self):
        html = build_admin_console_html()

        self.assertNotIn("提交模拟订单", html)
        self.assertNotIn("提交到后端", html)
        self.assertNotIn("function submitOrder", html)
        self.assertNotIn("<form", html)


if __name__ == "__main__":
    unittest.main()
