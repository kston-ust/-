import unittest

from app.supply_chain import build_supply_matches


class SupplyChainMatchingTest(unittest.TestCase):
    def test_build_supply_matches_links_paid_orders_to_farmer_listings(self):
        matches = build_supply_matches(
            orders=[
                {
                    "id": "ORD-JIT-001",
                    "customer_name": "北京火锅连锁",
                    "channel": "B端集采",
                    "status": "paid",
                    "items": [{"product_id": "P-LEG", "name": "古浪精修羊腿", "quantity": 12, "unit_price": 780}],
                }
            ],
            listings=[
                {
                    "id": "LIST-001",
                    "farmer_name": "古浪黄花滩合作社",
                    "origin_base": "古浪黄花滩数字养殖基地",
                    "product_id": "P-LEG",
                    "available_quantity": 30,
                    "floor_price": 700,
                    "quality_score": 94,
                    "status": "listed",
                }
            ],
            products=[{"id": "P-LEG", "name": "古浪精修羊腿", "price": 780}],
        )

        self.assertEqual(len(matches), 1)
        match = matches[0]
        self.assertEqual(match["order_id"], "ORD-JIT-001")
        self.assertEqual(match["listing_id"], "LIST-001")
        self.assertEqual(match["farmer_name"], "古浪黄花滩合作社")
        self.assertEqual(match["matched_quantity"], 12)
        self.assertEqual(match["jit"]["status"], "订单即排产")
        self.assertEqual(match["jit"]["cold_chain_target_hours"], 48)
        self.assertGreater(match["pricing"]["settlement_price"], match["pricing"]["floor_price"])
        self.assertEqual(match["pricing"]["terminal_reference_price"], 780)

    def test_build_supply_matches_skips_pending_orders_and_unlisted_supply(self):
        matches = build_supply_matches(
            orders=[
                {
                    "id": "ORD-PENDING",
                    "customer_name": "社区团购",
                    "channel": "C端小程序",
                    "status": "pending",
                    "items": [{"product_id": "P-SOUP", "name": "即食羊汤预制包", "quantity": 5, "unit_price": 69}],
                }
            ],
            listings=[
                {
                    "id": "LIST-OFF",
                    "farmer_name": "古浪合作社",
                    "origin_base": "古浪合作社",
                    "product_id": "P-SOUP",
                    "available_quantity": 100,
                    "floor_price": 55,
                    "quality_score": 91,
                    "status": "draft",
                }
            ],
            products=[{"id": "P-SOUP", "name": "即食羊汤预制包", "price": 69}],
        )

        self.assertEqual(matches, [])


if __name__ == "__main__":
    unittest.main()
