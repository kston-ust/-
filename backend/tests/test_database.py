import tempfile
import unittest
from pathlib import Path

from app.database import fetch_order_change_state, init_db


class OrderChangeStateTest(unittest.TestCase):
    def test_fetch_order_change_state_exposes_paid_order_version(self):
        with tempfile.TemporaryDirectory() as directory:
            db_path = Path(directory) / "trade.db"
            init_db(db_path)

            state = fetch_order_change_state(db_path)

        self.assertEqual(state["order_count"], 3)
        self.assertEqual(state["latest_order_id"], "ORD-202605-004")
        self.assertEqual(state["latest_order_at"], "2026-05-27T16:45:00")
        self.assertEqual(state["total_gmv"], 194180)
        self.assertEqual(state["version"], "3:ORD-202605-004:194180")


if __name__ == "__main__":
    unittest.main()
