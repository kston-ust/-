import unittest

from app.summary import build_business_summary


class BusinessSummaryTest(unittest.TestCase):
    def test_builds_integrated_business_summary(self):
        summary = build_business_summary(
            orders=[
                {
                    "id": "ORD-001",
                    "channel": "B端集采",
                    "customer_type": "火锅连锁",
                    "status": "paid",
                    "total_amount": 128000,
                    "items": [
                        {"product_id": "P-LEG", "name": "古浪精修羊腿", "quantity": 80, "unit_price": 780}
                    ],
                },
                {
                    "id": "ORD-002",
                    "channel": "C端小程序",
                    "customer_type": "家庭会员",
                    "status": "paid",
                    "total_amount": 3680,
                    "items": [
                        {"product_id": "P-RACK", "name": "北纬37度法式羊排", "quantity": 8, "unit_price": 460}
                    ],
                },
                {
                    "id": "ORD-003",
                    "channel": "C端小程序",
                    "customer_type": "家庭会员",
                    "status": "pending",
                    "total_amount": 920,
                    "items": [
                        {"product_id": "P-RACK", "name": "北纬37度法式羊排", "quantity": 2, "unit_price": 460}
                    ],
                },
            ],
            shipments=[
                {"order_id": "ORD-001", "hours_to_delivery": 30, "loss_rate": 0.025, "temperature_ok": True},
                {"order_id": "ORD-002", "hours_to_delivery": 20, "loss_rate": 0.018, "temperature_ok": True},
            ],
            finance=[
                {"farmer_id": "F-001", "loan_amount": 200000, "service_fee_rate": 0.018},
                {"farmer_id": "F-002", "loan_amount": 120000, "service_fee_rate": 0.015},
            ],
            farmer_benefits=[
                {"farmer_id": "F-001", "premium_income": 6800, "dividend": 1500},
                {"farmer_id": "F-002", "premium_income": 4200, "dividend": 900},
            ],
        )

        self.assertEqual(summary["trade"]["paid_order_count"], 2)
        self.assertEqual(summary["trade"]["gmv"], 131680)
        self.assertEqual(summary["trade"]["average_order_value"], 65840)
        self.assertEqual(summary["trade"]["top_product"]["name"], "古浪精修羊腿")
        self.assertEqual(summary["fulfillment"]["average_delivery_hours"], 25)
        self.assertAlmostEqual(summary["fulfillment"]["average_loss_rate"], 0.0215)
        self.assertEqual(summary["finance"]["loan_volume"], 320000)
        self.assertEqual(summary["finance"]["platform_service_fee"], 5400)
        self.assertEqual(summary["farmer_value"]["farmer_count"], 2)
        self.assertEqual(summary["farmer_value"]["total_incremental_income"], 13400)

    def test_handles_empty_inputs(self):
        summary = build_business_summary([], [], [], [])

        self.assertEqual(summary["trade"]["gmv"], 0)
        self.assertEqual(summary["trade"]["paid_order_count"], 0)
        self.assertEqual(summary["trade"]["top_product"], None)
        self.assertEqual(summary["fulfillment"]["average_delivery_hours"], 0)
        self.assertEqual(summary["finance"]["platform_service_fee"], 0)
        self.assertEqual(summary["farmer_value"]["total_incremental_income"], 0)


if __name__ == "__main__":
    unittest.main()
