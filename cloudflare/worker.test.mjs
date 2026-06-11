import assert from "node:assert/strict";
import { test } from "node:test";

import worker from "./worker.js";

function makeEnv() {
  return {
    ASSETS: {
      fetch(request) {
        const url = new URL(request.url);
        return new Response(`asset:${url.pathname}`, {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      },
    },
  };
}

async function request(path, options = {}) {
  return worker.fetch(new Request(`https://example.test${path}`, options), makeEnv());
}

async function json(path, options = {}) {
  const response = await request(path, options);
  assert.notEqual(response.status, 404, `${path} should be implemented`);
  assert.ok(response.ok, `${path} returned ${response.status}`);
  return response.json();
}

test("serves the full admin console from static assets", async () => {
  const response = await request("/admin");

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "asset:/admin/index.html");
});

test("exposes the admin backend routes used by the dashboard", async () => {
  const merchants = await json("/api/merchants");
  assert.ok(merchants.length > 0);
  assert.ok(merchants[0].password, "merchant management displays demo passwords");

  const analysis = await json("/api/order-analysis");
  assert.ok(Number.isInteger(analysis.assigned_order_count));
  assert.ok(Array.isArray(analysis.daily_trend));
  assert.ok(Array.isArray(analysis.product_sales));

  const assignment = await json("/api/orders/ORD-202605-001/assign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ merchant_id: merchants[0].id, note: "smoke test" }),
  });
  assert.equal(assignment.order_id, "ORD-202605-001");
  assert.equal(assignment.merchant_id, merchants[0].id);

  const batch = await json("/api/orders/assign-batch", { method: "POST" });
  assert.ok(Number.isInteger(batch.assigned_count));

  const trace = await json("/api/trace/P-LEG");
  assert.equal(trace.product_id, "P-LEG");
  assert.ok(trace.nodes.includes("0-4℃冷链轨迹"));
});
