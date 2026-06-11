const products = [
  {
    id: "P-RACK",
    name: "北纬37度法式羊排",
    category: "溢价产品",
    origin: "甘肃古浪数字示范养殖区",
    scene: "家庭煎烤 / 礼赠",
    price: 460,
    unit: "盒",
    stock: 280,
    monthly_sales: 368,
    digital_premium_rate: 0.28,
    trace_label: "区块链溯源卡 + 无抗养殖记录",
    image: "/products/lamb-rack.jpg",
  },
  {
    id: "P-LEG",
    name: "古浪精修羊腿",
    category: "增长产品",
    origin: "西北羊都产地中心仓",
    scene: "火锅连锁 / 团餐集采",
    price: 780,
    unit: "箱",
    stock: 160,
    monthly_sales: 520,
    digital_premium_rate: 0.22,
    trace_label: "24道智慧加工工序记录",
    image: "/products/lamb-leg.jpg",
  },
  {
    id: "P-SOUP",
    name: "即食羊汤预制包",
    category: "增长产品",
    origin: "0-4℃排酸冷链加工线",
    scene: "一人食 / 社区团购",
    price: 69,
    unit: "份",
    stock: 1200,
    monthly_sales: 930,
    digital_premium_rate: 0.18,
    trace_label: "批次检疫合格证 + 温控轨迹",
    image: "/products/lamb-soup.jpg",
  },
  {
    id: "P-CARCASS",
    name: "标准化白条羊",
    category: "基石产品",
    origin: "古浪合作社直采",
    scene: "B端战略集采",
    price: 1280,
    unit: "只",
    stock: 90,
    monthly_sales: 210,
    digital_premium_rate: 0.12,
    trace_label: "电子耳标 + 屠宰检疫联单",
    image: "/products/lamb-carcass.jpg",
  },
];

const seedOrders = [
  {
    id: "ORD-202605-001",
    customer_name: "西北火锅北京旗舰店",
    channel: "B端集采",
    customer_type: "火锅连锁",
    status: "paid",
    created_at: "2026-05-25T09:30:00",
    total_amount: 128000,
    items: [
      { product_id: "P-LEG", name: "古浪精修羊腿", quantity: 80, unit_price: 780, unit: "箱" },
      { product_id: "P-CARCASS", name: "标准化白条羊", quantity: 50, unit_price: 1280, unit: "只" },
    ],
  },
  {
    id: "ORD-202605-002",
    customer_name: "上海陆家嘴家庭会员",
    channel: "C端小程序",
    customer_type: "家庭会员",
    status: "paid",
    created_at: "2026-05-25T14:10:00",
    total_amount: 3680,
    items: [{ product_id: "P-RACK", name: "北纬37度法式羊排", quantity: 8, unit_price: 460, unit: "盒" }],
  },
  {
    id: "ORD-202605-003",
    customer_name: "深圳高端社区团购",
    channel: "C端小程序",
    customer_type: "家庭会员",
    status: "pending",
    created_at: "2026-05-26T11:20:00",
    total_amount: 920,
    items: [{ product_id: "P-RACK", name: "北纬37度法式羊排", quantity: 2, unit_price: 460, unit: "盒" }],
  },
  {
    id: "ORD-202605-004",
    customer_name: "华东精品商超",
    channel: "B端集采",
    customer_type: "生鲜商超",
    status: "paid",
    created_at: "2026-05-27T16:45:00",
    total_amount: 62500,
    items: [
      { product_id: "P-SOUP", name: "即食羊汤预制包", quantity: 500, unit_price: 69, unit: "份" },
      { product_id: "P-LEG", name: "古浪精修羊腿", quantity: 36, unit_price: 780, unit: "箱" },
    ],
  },
];

const shipments = [
  { order_id: "ORD-202605-001", hours_to_delivery: 30, loss_rate: 0.025, temperature_ok: true },
  { order_id: "ORD-202605-002", hours_to_delivery: 20, loss_rate: 0.018, temperature_ok: true },
  { order_id: "ORD-202605-004", hours_to_delivery: 36, loss_rate: 0.028, temperature_ok: true },
];

const farmerBenefits = [
  { farmer_id: "F-001", premium_income: 6800, dividend: 1500 },
  { farmer_id: "F-002", premium_income: 4200, dividend: 900 },
  { farmer_id: "F-003", premium_income: 5300, dividend: 1200 },
];

const financeRecords = [
  { farmer_id: "F-001", loan_amount: 200000, service_fee_rate: 0.018 },
  { farmer_id: "F-002", loan_amount: 120000, service_fee_rate: 0.015 },
  { farmer_id: "F-003", loan_amount: 180000, service_fee_rate: 0.017 },
];

const seedMerchants = [
  {
    id: "MER-HHT",
    name: "古浪黄花滩合作社",
    account: "hht",
    password: "123456",
    contact: "13800000001",
    origin_base: "古浪黄花滩数字养殖基地",
    product_focus: "P-LEG",
    status: "active",
  },
  {
    id: "MER-XJ",
    name: "西靖镇标准化养殖户",
    account: "xijing",
    password: "123456",
    contact: "13800000002",
    origin_base: "西靖镇无抗养殖示范区",
    product_focus: "P-RACK",
    status: "active",
  },
  {
    id: "MER-TM",
    name: "土门镇联营牧场",
    account: "tumen",
    password: "123456",
    contact: "13800000003",
    origin_base: "土门镇冷链前置仓",
    product_focus: "P-SOUP",
    status: "active",
  },
];

const seedListings = [
  {
    id: "LIST-001",
    farmer_name: "古浪黄花滩合作社",
    origin_base: "古浪黄花滩数字养殖基地",
    product_id: "P-LEG",
    available_quantity: 120,
    floor_price: 700,
    quality_score: 94,
    available_at: "2026-05-30T09:00:00",
    status: "listed",
    merchant_id: "MER-HHT",
  },
  {
    id: "LIST-002",
    farmer_name: "西靖镇标准化养殖户",
    origin_base: "西靖镇无抗养殖示范区",
    product_id: "P-RACK",
    available_quantity: 80,
    floor_price: 410,
    quality_score: 97,
    available_at: "2026-05-30T11:00:00",
    status: "listed",
    merchant_id: "MER-XJ",
  },
  {
    id: "LIST-003",
    farmer_name: "土门镇联营牧场",
    origin_base: "土门镇冷链前置仓",
    product_id: "P-SOUP",
    available_quantity: 600,
    floor_price: 56,
    quality_score: 91,
    available_at: "2026-05-30T14:00:00",
    status: "listed",
    merchant_id: "MER-TM",
  },
];

let orders = structuredClone(seedOrders);
let merchants = structuredClone(seedMerchants);
let listings = structuredClone(seedListings);
let assignments = new Map();

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type",
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

function noContent() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

function badRequest(detail, status = 400) {
  return json({ detail }, { status });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function roundMoney(value) {
  return Math.round(Number(value || 0));
}

function average(values) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length).toFixed(4));
}

function sortedOrders() {
  return [...orders].sort((left, right) => {
    const dateCompare = right.created_at.localeCompare(left.created_at);
    return dateCompare || right.id.localeCompare(left.id);
  });
}

function publicMerchant(merchant) {
  if (!merchant) return null;
  const { password, ...publicData } = merchant;
  return publicData;
}

function activeMerchants() {
  return merchants
    .filter((merchant) => merchant.status === "active")
    .sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));
}

function defaultDueAt(createdAt) {
  const timestamp = Date.parse(createdAt);
  const base = Number.isNaN(timestamp) ? Date.now() : timestamp;
  return new Date(base + 48 * 60 * 60 * 1000).toISOString().slice(0, 19);
}

function demandSummary(items) {
  return items.map((item) => `${item.name} ${item.quantity} ${item.unit || "件"}`).join("，");
}

function ordersWithAssignments() {
  return sortedOrders().map((order) => {
    const assignment = assignments.get(order.id);
    const merchant = assignment ? merchants.find((item) => item.id === assignment.merchant_id) : null;
    return {
      ...structuredClone(order),
      assigned_merchant_id: assignment?.merchant_id || "",
      assigned_merchant_name: merchant?.name || "",
      assignment_due_at: assignment?.due_at || "",
      assignment_status: assignment ? "已分配" : "未分配",
    };
  });
}

function totalAmount(items) {
  return items.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === item.product_id);
    return sum + (product?.price || 0) * Number(item.quantity || 0);
  }, 0);
}

function summary() {
  const paidOrders = ordersWithAssignments().filter((order) => order.status === "paid");
  const gmv = roundMoney(paidOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0));
  const productTotals = new Map();
  const channelRevenue = new Map();
  const customerMix = new Map();

  for (const order of paidOrders) {
    channelRevenue.set(order.channel, (channelRevenue.get(order.channel) || 0) + Number(order.total_amount || 0));
    customerMix.set(order.customer_type, (customerMix.get(order.customer_type) || 0) + 1);
    for (const item of order.items || []) {
      const current = productTotals.get(item.product_id) || { name: item.name, quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity || 0);
      current.revenue += Number(item.quantity || 0) * Number(item.unit_price || 0);
      productTotals.set(item.product_id, current);
    }
  }

  const topProduct = [...productTotals.values()].sort((left, right) => right.revenue - left.revenue)[0] || null;
  const loanVolume = roundMoney(financeRecords.reduce((sum, record) => sum + Number(record.loan_amount || 0), 0));
  const platformServiceFee = roundMoney(
    financeRecords.reduce(
      (sum, record) => sum + Number(record.loan_amount || 0) * Number(record.service_fee_rate || 0),
      0,
    ),
  );
  const totalIncrementalIncome = roundMoney(
    farmerBenefits.reduce(
      (sum, benefit) => sum + Number(benefit.premium_income || 0) + Number(benefit.dividend || 0),
      0,
    ),
  );
  const farmerCount = new Set(farmerBenefits.map((benefit) => benefit.farmer_id).filter(Boolean)).size;
  const temperaturePassRate = shipments.length
    ? Number((shipments.filter((shipment) => shipment.temperature_ok).length / shipments.length).toFixed(4))
    : 0;

  return {
    trade: {
      gmv,
      paid_order_count: paidOrders.length,
      average_order_value: paidOrders.length ? roundMoney(gmv / paidOrders.length) : 0,
      top_product: topProduct
        ? {
            name: topProduct.name,
            quantity: topProduct.quantity,
            revenue: roundMoney(topProduct.revenue),
          }
        : null,
      channel_revenue: Object.fromEntries(
        [...channelRevenue.entries()]
          .sort(([left], [right]) => left.localeCompare(right, "zh-CN"))
          .map(([key, value]) => [key, roundMoney(value)]),
      ),
      customer_mix: Object.fromEntries([...customerMix.entries()].sort(([left], [right]) => left.localeCompare(right))),
    },
    fulfillment: {
      average_delivery_hours: average(shipments.map((shipment) => shipment.hours_to_delivery)),
      average_loss_rate: average(shipments.map((shipment) => shipment.loss_rate)),
      temperature_pass_rate: temperaturePassRate,
      jit_target_hours: 48,
      loss_rate_target: 0.03,
    },
    finance: {
      loan_volume: loanVolume,
      platform_service_fee: platformServiceFee,
      average_service_fee_rate: average(financeRecords.map((record) => record.service_fee_rate)),
    },
    farmer_value: {
      farmer_count: farmerCount,
      total_incremental_income: totalIncrementalIncome,
      average_incremental_income: farmerCount ? roundMoney(totalIncrementalIncome / farmerCount) : 0,
    },
  };
}

function changeState() {
  const paidOrders = sortedOrders().filter((order) => order.status === "paid");
  const totalGmv = roundMoney(paidOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0));
  const latest = paidOrders[0];
  return {
    version: `${paidOrders.length}:${latest?.id || "none"}:${totalGmv}`,
    order_count: paidOrders.length,
    latest_order_id: latest?.id || null,
    latest_order_at: latest?.created_at || null,
    total_gmv: totalGmv,
  };
}

function premiumRate(qualityScore) {
  return Number(Math.min(0.18, Math.max(0.05, (Number(qualityScore || 0) - 85) / 100)).toFixed(4));
}

function supplyMatches() {
  const productLookup = new Map(products.map((product) => [product.id, product]));
  const available = listings
    .filter((listing) => listing.status === "listed" && Number(listing.available_quantity || 0) > 0)
    .map((listing) => ({ ...listing, remaining: Number(listing.available_quantity || 0) }));
  const matches = [];

  for (const order of ordersWithAssignments().filter((item) => item.status === "paid")) {
    for (const item of order.items || []) {
      const listing = available.find(
        (candidate) => candidate.product_id === item.product_id && Number(candidate.remaining || 0) > 0,
      );
      if (!listing) continue;

      const matchedQuantity = Math.min(Number(item.quantity || 0), listing.remaining);
      listing.remaining -= matchedQuantity;
      const rate = premiumRate(listing.quality_score);
      const product = productLookup.get(item.product_id) || {};
      matches.push({
        order_id: order.id,
        customer_name: order.customer_name,
        channel: order.channel,
        product_id: item.product_id,
        product_name: item.name || product.name || item.product_id,
        listing_id: listing.id,
        farmer_name: listing.farmer_name,
        origin_base: listing.origin_base,
        matched_quantity: matchedQuantity,
        pricing: {
          floor_price: roundMoney(listing.floor_price),
          settlement_price: roundMoney(Number(listing.floor_price || 0) * (1 + rate)),
          terminal_reference_price: roundMoney(product.price || item.unit_price),
          premium_rate: rate,
        },
        jit: {
          status: "订单即排产",
          slaughter_window: "T+0.5天",
          cold_chain_target_hours: 48,
          loss_rate_target: 0.03,
        },
      });
    }
  }

  return matches;
}

function orderAnalysis() {
  const enrichedOrders = ordersWithAssignments();
  const daily = new Map();
  const productSales = new Map();

  for (const order of enrichedOrders) {
    const day = String(order.created_at || "").slice(0, 10);
    const currentDay = daily.get(day) || { date: day, order_count: 0, gmv: 0 };
    currentDay.order_count += 1;
    currentDay.gmv += Number(order.total_amount || 0);
    daily.set(day, currentDay);

    for (const item of order.items || []) {
      const currentProduct = productSales.get(item.product_id) || {
        product_id: item.product_id,
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      currentProduct.quantity += Number(item.quantity || 0);
      currentProduct.revenue += Number(item.quantity || 0) * Number(item.unit_price || 0);
      productSales.set(item.product_id, currentProduct);
    }
  }

  const assignedOrderCount = enrichedOrders.filter((order) => order.assignment_status === "已分配").length;
  return {
    total_order_count: enrichedOrders.length,
    assigned_order_count: assignedOrderCount,
    unassigned_order_count: enrichedOrders.length - assignedOrderCount,
    paid_order_count: enrichedOrders.filter((order) => order.status === "paid").length,
    daily_trend: [...daily.values()]
      .map((item) => ({ ...item, gmv: roundMoney(item.gmv) }))
      .sort((left, right) => left.date.localeCompare(right.date)),
    product_sales: [...productSales.values()]
      .map((item) => ({ ...item, revenue: roundMoney(item.revenue) }))
      .sort((left, right) => right.quantity - left.quantity || String(left.product_id).localeCompare(right.product_id)),
  };
}

function chooseMerchantForOrder(order, availableMerchants) {
  const productIds = new Set((order.items || []).map((item) => item.product_id));
  return availableMerchants.find((merchant) => productIds.has(merchant.product_focus)) || availableMerchants[0] || null;
}

function assignOrder(orderId, merchantId, payload = {}) {
  const order = orders.find((item) => item.id === orderId);
  const merchant = merchants.find((item) => item.id === merchantId && item.status === "active");
  if (!order) return { error: `Unknown order id: ${orderId}`, status: 404 };
  if (!merchant) return { error: `Unknown merchant id: ${merchantId}`, status: 404 };

  const assignment = {
    order_id: orderId,
    merchant_id: merchantId,
    assigned_at: new Date().toISOString().slice(0, 19),
    due_at: payload.due_at || defaultDueAt(order.created_at),
    status: payload.status || "assigned",
    note: payload.note || "",
  };
  assignments.set(orderId, assignment);
  return assignment;
}

function batchAssignOrders() {
  const availableMerchants = activeMerchants();
  const newAssignments = [];
  for (const order of sortedOrders()) {
    if (order.status !== "paid" || assignments.has(order.id)) continue;
    const merchant = chooseMerchantForOrder(order, availableMerchants);
    if (!merchant) continue;
    newAssignments.push(
      assignOrder(order.id, merchant.id, { note: "批量分配：按订单商品与商户主供品类匹配" }),
    );
  }
  return { assigned_count: newAssignments.length, assignments: newAssignments };
}

function merchantTasks(merchantId) {
  return [...assignments.values()]
    .filter((assignment) => assignment.merchant_id === merchantId)
    .map((assignment) => {
      const order = orders.find((item) => item.id === assignment.order_id);
      if (!order) return null;
      const items = structuredClone(order.items || []);
      return {
        ...assignment,
        customer_name: order.customer_name,
        channel: order.channel,
        customer_type: order.customer_type,
        order_status: order.status,
        created_at: order.created_at,
        total_amount: order.total_amount,
        items,
        demand_summary: demandSummary(items),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.due_at.localeCompare(right.due_at) || right.created_at.localeCompare(left.created_at));
}

function customerOrders(keyword) {
  const normalized = String(keyword || "").trim().toLowerCase();
  if (!normalized) return [];
  return ordersWithAssignments().filter((order) => {
    const itemNames = (order.items || []).map((item) => item.name).join(" ");
    const haystack = `${order.id} ${order.customer_name} ${order.channel} ${itemNames}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

function productTrace(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return null;
  return {
    product_id: product.id,
    product_name: product.name,
    trace_label: product.trace_label,
    nodes: ["电子耳标确权", "无抗养殖台账", "屠宰检疫合格", "0-4℃冷链轨迹", "终端扫码验真"],
  };
}

async function handleApi(request, pathname) {
  if (request.method === "OPTIONS") return noContent();
  const method = request.method.toUpperCase();
  const url = new URL(request.url);

  try {
    if (pathname === "/api/health") return json({ status: "ok", service: "xiyu-yangdu-cloudflare-worker" });
    if (pathname === "/api/products" && method === "GET") return json(products);
    if (pathname === "/api/orders" && method === "GET") return json(ordersWithAssignments());
    if (pathname === "/api/customer/orders" && method === "GET") {
      return json(customerOrders(url.searchParams.get("keyword")));
    }
    if (pathname === "/api/summary" && method === "GET") return json(summary());
    if (pathname === "/api/change-state" && method === "GET") return json(changeState());
    if (pathname === "/api/supply-listings" && method === "GET") return json(listings);
    if (pathname === "/api/supply-matches" && method === "GET") return json(supplyMatches());
    if (pathname === "/api/merchants" && method === "GET") return json(activeMerchants());
    if (pathname === "/api/order-analysis" && method === "GET") return json(orderAnalysis());

    if (pathname === "/api/orders/assign-batch" && method === "POST") {
      return json(batchAssignOrders());
    }

    if (pathname === "/api/merchant/login" && method === "POST") {
      const payload = await readJson(request);
      const merchant = merchants.find(
        (item) =>
          item.status === "active" &&
          item.account === String(payload.account || "").trim() &&
          item.password === String(payload.password || ""),
      );
      return merchant ? json(publicMerchant(merchant)) : badRequest("商户账号或密码不正确", 401);
    }

    if (pathname === "/api/merchants" && method === "POST") {
      const payload = await readJson(request);
      const account = String(payload.account || "").trim();
      const name = String(payload.name || "").trim();
      const password = String(payload.password || "");
      if (name.length < 2 || account.length < 2 || password.length < 4) {
        return badRequest("商户名称、账号或密码不完整");
      }
      if (merchants.some((item) => item.account === account)) return badRequest("商户账号已存在");
      const merchant = {
        id: payload.id || `MER-${account.toUpperCase().replace(/[^A-Z0-9]/g, "") || Date.now()}`,
        name,
        account,
        password,
        contact: String(payload.contact || "").trim(),
        origin_base: String(payload.origin_base || "").trim(),
        product_focus: String(payload.product_focus || "P-LEG"),
        status: "active",
      };
      if (merchants.some((item) => item.id === merchant.id)) merchant.id = `MER-CF-${Date.now()}`;
      merchants = [merchant, ...merchants];
      return json(publicMerchant(merchant), { status: 201 });
    }

    if (pathname === "/api/orders" && method === "POST") {
      const payload = await readJson(request);
      const items = (payload.items || []).map((item) => {
        const product = products.find((candidate) => candidate.id === item.product_id);
        if (!product) throw new Error(`Unknown product id: ${item.product_id}`);
        return {
          product_id: product.id,
          name: product.name,
          quantity: Number(item.quantity),
          unit_price: product.price,
          unit: product.unit,
        };
      });
      if (!String(payload.customer_name || "").trim() || !items.length) {
        return badRequest("客户名称和商品明细不能为空");
      }
      const order = {
        id: payload.id || `ORD-CF-${Date.now()}`,
        customer_name: String(payload.customer_name).trim(),
        channel: payload.channel || "C端小程序",
        customer_type: payload.customer_type || "家庭会员",
        status: "paid",
        created_at: payload.created_at || new Date().toISOString().slice(0, 19),
        total_amount: totalAmount(items),
        items,
      };
      orders = [order, ...orders].slice(0, 12);
      return json({ ...order, assignment_status: "未分配", assigned_merchant_id: "", assigned_merchant_name: "" }, { status: 201 });
    }

    const merchantDeleteMatch = pathname.match(/^\/api\/merchants\/([^/]+)$/);
    if (merchantDeleteMatch && method === "DELETE") {
      const merchantId = decodeURIComponent(merchantDeleteMatch[1]);
      merchants = merchants.filter((merchant) => merchant.id !== merchantId);
      listings = listings.filter((listing) => listing.merchant_id !== merchantId);
      assignments = new Map([...assignments.entries()].filter(([, assignment]) => assignment.merchant_id !== merchantId));
      return noContent();
    }

    const assignmentMatch = pathname.match(/^\/api\/orders\/([^/]+)\/assign$/);
    if (assignmentMatch && method === "POST") {
      const orderId = decodeURIComponent(assignmentMatch[1]);
      const payload = await readJson(request);
      const assignment = assignOrder(orderId, payload.merchant_id, payload);
      if (assignment.error) return badRequest(assignment.error, assignment.status);
      return json(assignment);
    }

    const taskMatch = pathname.match(/^\/api\/merchant\/([^/]+)\/tasks$/);
    if (taskMatch && method === "GET") {
      return json(merchantTasks(decodeURIComponent(taskMatch[1])));
    }

    const listingMatch = pathname.match(/^\/api\/merchant\/([^/]+)\/listings$/);
    if (listingMatch && method === "GET") {
      const merchantId = decodeURIComponent(listingMatch[1]);
      return json(listings.filter((listing) => listing.merchant_id === merchantId));
    }
    if (listingMatch && method === "POST") {
      const merchantId = decodeURIComponent(listingMatch[1]);
      const merchant = merchants.find((item) => item.id === merchantId && item.status === "active");
      if (!merchant) return badRequest(`Unknown merchant id: ${merchantId}`, 404);
      const payload = await readJson(request);
      const product = products.find((item) => item.id === payload.product_id);
      if (!product) return badRequest(`Unknown product id: ${payload.product_id}`, 404);
      const listing = {
        id: payload.id || `LIST-${merchantId.replace("MER-", "")}-${Date.now()}`,
        farmer_name: merchant.name,
        origin_base: merchant.origin_base,
        product_id: product.id,
        available_quantity: Number(payload.available_quantity),
        floor_price: Number(payload.floor_price),
        quality_score: Number(payload.quality_score || 90),
        available_at: payload.available_at || new Date().toISOString().slice(0, 19),
        status: "listed",
        merchant_id: merchantId,
      };
      if (listing.available_quantity < 1 || listing.floor_price <= 0) return badRequest("挂单数量和底价必须大于 0");
      listings = [listing, ...listings];
      return json(listing, { status: 201 });
    }

    const traceMatch = pathname.match(/^\/api\/trace\/([^/]+)$/);
    if (traceMatch && method === "GET") {
      const trace = productTrace(decodeURIComponent(traceMatch[1]));
      return trace ? json(trace) : badRequest("Product not found", 404);
    }

    return badRequest("Not found", 404);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Request failed", 400);
  }
}

function serveAdmin(request, env) {
  const adminUrl = new URL("/admin/index.html", request.url);
  return env.ASSETS.fetch(new Request(adminUrl, request));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, url.pathname);
    if (url.pathname === "/admin" || url.pathname === "/admin/") return serveAdmin(request, env);
    return env.ASSETS.fetch(request);
  },
};
