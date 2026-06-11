import test from "node:test";
import assert from "node:assert/strict";

import { fallbackProducts } from "../src/api.js";
import {
  buildOrderItems,
  canSubmitCart,
  canLoginMerchant,
  filterMerchantTasks,
  findCustomerOrders,
  formatCurrency,
  deriveCartTotals,
  formatSupplyMatch,
  summarizeMerchantTask,
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

test("fallback product images point to real product photo assets", () => {
  assert.deepEqual(
    fallbackProducts.map((product) => product.image),
    [
      "/products/lamb-soup.jpg",
      "/products/lamb-leg.jpg",
      "/products/lamb-rack.jpg",
      "/products/lamb-carcass.jpg",
    ],
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

test("canLoginMerchant requires an account and password", () => {
  assert.equal(canLoginMerchant("hht", "123456"), true);
  assert.equal(canLoginMerchant("hht", ""), false);
  assert.equal(canLoginMerchant("", "123456"), false);
});

test("shouldRefreshData refreshes only when the server version changes", () => {
  assert.equal(shouldRefreshData({ version: "3:ORD-1:1000" }, { version: "4:ORD-2:1460" }), true);
  assert.equal(shouldRefreshData({ version: "3:ORD-1:1000" }, { version: "3:ORD-1:1000" }), false);
  assert.equal(shouldRefreshData(null, { version: "3:ORD-1:1000" }), false);
});

test("formatSupplyMatch summarizes farmer listing and JIT fulfillment", () => {
  assert.equal(
    formatSupplyMatch({
      farmer_name: "古浪黄花滩合作社",
      matched_quantity: 12,
      product_name: "古浪精修羊腿",
      jit: { cold_chain_target_hours: 48 },
      pricing: { premium_rate: 0.09 },
    }),
    "古浪黄花滩合作社匹配 12 件古浪精修羊腿，48h 冷链，溢价 9.0%",
  );
});

test("merchant task helpers filter and summarize backend assigned demand", () => {
  const tasks = [
    {
      order_id: "ORD-1",
      customer_name: "华东精品商超",
      due_at: "2026-05-30T18:00:00",
      demand_summary: "即食羊汤预制包 500 份",
      items: [{ name: "即食羊汤预制包", quantity: 500 }],
    },
    {
      order_id: "ORD-2",
      customer_name: "北京火锅店",
      due_at: "2026-05-31T10:00:00",
      demand_summary: "古浪精修羊腿 80 箱",
      items: [{ name: "古浪精修羊腿", quantity: 80 }],
    },
  ];

  assert.deepEqual(filterMerchantTasks(tasks, "羊腿").map((task) => task.order_id), ["ORD-2"]);
  assert.equal(summarizeMerchantTask(tasks[0]), "2026-05-30 18:00 需要 即食羊汤预制包 500 份");
});

test("customer order query matches order id, customer name, and product names", () => {
  const orders = [
    {
      id: "ORD-202605-004",
      customer_name: "华东精品商超",
      items: [{ name: "即食羊汤预制包" }],
    },
  ];

  assert.equal(findCustomerOrders(orders, "").length, 0);
  assert.equal(findCustomerOrders(orders, "华东").length, 1);
  assert.equal(findCustomerOrders(orders, "羊汤").length, 1);
  assert.equal(findCustomerOrders(orders, "ORD-202605-004").length, 1);
});
