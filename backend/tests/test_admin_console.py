import unittest

from app.admin_console import build_admin_console_html


class AdminConsoleTest(unittest.TestCase):
    def test_admin_console_is_interactive(self):
        html = build_admin_console_html()

        self.assertIn("后端交互控制台", html)
        self.assertIn("/api/change-state", html)
        self.assertIn("/api/orders", html)
        self.assertIn("function submitOrder", html)
        self.assertIn("setInterval(refreshState", html)
        self.assertIn("<form", html)


if __name__ == "__main__":
    unittest.main()
