import test from "node:test";
import assert from "node:assert/strict";

import {
  buildOrderItems,
  canSubmitCart,
  formatCurrency,
  deriveCartTotals,
  pickFeaturedProducts,
  shouldRefreshData,
} from "../src/summary.js";

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
  assert.equal(formatCurrency(131680), "\u00a5131,680");
});

test("buildOrderItems converts positive cart quantities into backend payload items", () => {
  assert.deepEqual(buildOrderItems({ "P-SOUP": 2, "P-RACK": 0, "P-LEG": 3 }), [
    { product_id: "P-SOUP", quantity: 2 },
    { product_id: "P-LEG", quantity: 3 },
  ]);
});

test("canSubmitCart only allows a named customer and selected products", () => {
  assert.equal(canSubmitCart("Test Customer", { "P-SOUP": 1 }), true);
  assert.equal(canSubmitCart("", { "P-SOUP": 1 }), false);
  assert.equal(canSubmitCart("Test Customer", {}), false);
});

test("shouldRefreshData refreshes only when the server version changes", () => {
  assert.equal(shouldRefreshData({ version: "3:ORD-1:1000" }, { version: "4:ORD-2:1460" }), true);
  assert.equal(shouldRefreshData({ version: "3:ORD-1:1000" }, { version: "3:ORD-1:1000" }), false);
  assert.equal(shouldRefreshData(null, { version: "3:ORD-1:1000" }), false);
});
