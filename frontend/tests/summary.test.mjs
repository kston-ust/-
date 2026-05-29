import test from "node:test";
import assert from "node:assert/strict";

import { formatCurrency, deriveCartTotals, pickFeaturedProducts } from "../src/summary.js";

test("deriveCartTotals totals selected quantities and digital premium", () => {
  const products = [
    { id: "rack", price: 460, digitalPremiumRate: 0.28 },
    { id: "leg", price: 780, digitalPremiumRate: 0.22 },
  ];
  const cart = { rack: 2, leg: 1 };

  assert.deepEqual(deriveCartTotals(products, cart), {
    itemCount: 3,
    subtotal: 1700,
    estimatedDigitalPremium: 430,
  });
});

test("pickFeaturedProducts sorts by sales volume and keeps requested count", () => {
  const products = [
    { id: "a", monthlySales: 42 },
    { id: "b", monthlySales: 300 },
    { id: "c", monthlySales: 95 },
  ];

  assert.deepEqual(
    pickFeaturedProducts(products, 2).map((product) => product.id),
    ["b", "c"],
  );
});

test("formatCurrency renders RMB without decimal noise", () => {
  assert.equal(formatCurrency(131680), "¥131,680");
});
