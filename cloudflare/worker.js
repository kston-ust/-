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
      { product_id: "P-LEG", name: "古浪精修羊腿", quantity: 80, unit_price: 780 },
      { product_id: "P-CARCASS", name: "标准化白条羊", quantity: 50, unit_price: 1280 },
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
    items: [{ product_id: "P-RACK", name: "北纬37度法式羊排", quantity: 8, unit_price: 460 }],
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
      { product_id: "P-SOUP", name: "即食羊汤预制包", quantity: 500, unit_price: 69 },
      { product_id: "P-LEG", name: "古浪精修羊腿", quantity: 36, unit_price: 780 },
    ],
  },
];

const shipments = [
  { order_id: "ORD-202605-001", hours_to_delivery: 30, loss_rate: 0.025, temperature_ok: 1 },
  { order_id: "ORD-202605-002", hours_to_delivery: 20, loss_rate: 0.018, temperature_ok: 1 },
  { order_id: "ORD-202605-004", hours_to_delivery: 36, loss_rate: 0.028, temperature_ok: 1 },
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

const merchants = [
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
let listings = structuredClone(seedListings);
let orderVersion = 3;

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type",
      ...(init.headers || {}),
    },
  });
}

function html(body) {
  return new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });
}

function totalAmount(items) {
  return items.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === item.product_id);
    return sum + (product?.price || 0) * Number(item.quantity || 0);
  }, 0);
}

function summary() {
  const paidOrders = orders.filter((order) => order.status === "paid");
  const gmv = paidOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const productTotals = new Map();
  for (const order of paidOrders) {
    for (const item of order.items || []) {
      const current = productTotals.get(item.product_id) || { name: item.name, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.quantity * item.unit_price;
      productTotals.set(item.product_id, current);
    }
  }
  const topProduct = [...productTotals.values()].sort((a, b) => b.revenue - a.revenue)[0] || null;
  const channelRevenue = Object.fromEntries(
    [...paidOrders.reduce((map, order) => map.set(order.channel, (map.get(order.channel) || 0) + order.total_amount), new Map())],
  );
  const customerMix = Object.fromEntries(
    [...paidOrders.reduce((map, order) => map.set(order.customer_type, (map.get(order.customer_type) || 0) + 1), new Map())],
  );
  const averageDeliveryHours =
    shipments.reduce((sum, shipment) => sum + shipment.hours_to_delivery, 0) / Math.max(shipments.length, 1);
  const averageLossRate = shipments.reduce((sum, shipment) => sum + shipment.loss_rate, 0) / Math.max(shipments.length, 1);
  const temperaturePassRate =
    shipments.filter((shipment) => shipment.temperature_ok).length / Math.max(shipments.length, 1);
  const loanVolume = financeRecords.reduce((sum, record) => sum + record.loan_amount, 0);
  const platformServiceFee = financeRecords.reduce(
    (sum, record) => sum + record.loan_amount * record.service_fee_rate,
    0,
  );
  const totalIncrementalIncome = farmerBenefits.reduce(
    (sum, benefit) => sum + benefit.premium_income + benefit.dividend,
    0,
  );
  return {
    trade: {
      gmv,
      paid_order_count: paidOrders.length,
      average_order_value: Math.round(gmv / Math.max(paidOrders.length, 1)),
      top_product: topProduct,
      channel_revenue: channelRevenue,
      customer_mix: customerMix,
    },
    fulfillment: {
      average_delivery_hours: Number(averageDeliveryHours.toFixed(1)),
      average_loss_rate: Number(averageLossRate.toFixed(4)),
      temperature_pass_rate: Number(temperaturePassRate.toFixed(4)),
      jit_target_hours: 48,
      loss_rate_target: 0.03,
    },
    finance: {
      loan_volume: loanVolume,
      platform_service_fee: Math.round(platformServiceFee),
      average_service_fee_rate: Number((platformServiceFee / Math.max(loanVolume, 1)).toFixed(4)),
    },
    farmer_value: {
      farmer_count: farmerBenefits.length,
      total_incremental_income: totalIncrementalIncome,
      average_incremental_income: Math.round(totalIncrementalIncome / Math.max(farmerBenefits.length, 1)),
    },
  };
}

function supplyMatches() {
  const productLookup = new Map(products.map((product) => [product.id, product]));
  const available = listings.map((listing) => ({ ...listing, remaining: listing.available_quantity }));
  const matches = [];
  for (const order of orders.filter((item) => item.status === "paid")) {
    for (const item of order.items || []) {
      const listing = available.find((candidate) => candidate.product_id === item.product_id && candidate.remaining > 0);
      if (!listing) continue;
      const matchedQuantity = Math.min(item.quantity, listing.remaining);
      listing.remaining -= matchedQuantity;
      const premiumRate = Math.min(0.18, Math.max(0.05, (listing.quality_score - 85) / 100));
      matches.push({
        order_id: order.id,
        customer_name: order.customer_name,
        channel: order.channel,
        product_id: item.product_id,
        product_name: item.name,
        listing_id: listing.id,
        farmer_name: listing.farmer_name,
        origin_base: listing.origin_base,
        matched_quantity: matchedQuantity,
        pricing: {
          floor_price: Math.round(listing.floor_price),
          settlement_price: Math.round(listing.floor_price * (1 + premiumRate)),
          terminal_reference_price: Math.round(productLookup.get(item.product_id)?.price || item.unit_price),
          premium_rate: Number(premiumRate.toFixed(4)),
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

function adminPage() {
  const overview = summary();
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>西域羊都运营数据中心</title>
  <style>
    body { margin: 0; background: #f5f7f0; color: #203227; font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
    main { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 48px; }
    h1 { margin: 0 0 8px; font-size: clamp(28px, 5vw, 48px); }
    p { color: #66756a; line-height: 1.7; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 24px 0; }
    .card { border: 1px solid #dbe4d5; border-radius: 8px; padding: 18px; background: #fff; box-shadow: 0 14px 34px rgba(43,58,45,.08); }
    .card span { color: #66756a; font-weight: 800; font-size: 13px; }
    .card strong { display: block; margin-top: 10px; font-size: 26px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; }
    th, td { border-bottom: 1px solid #e6ece0; padding: 12px; text-align: left; }
    th { color: #66756a; font-size: 13px; }
    a { color: #28644f; font-weight: 900; }
    @media (max-width: 760px) { .grid { grid-template-columns: 1fr 1fr; } }
  </style>
</head>
<body>
  <main>
    <h1>西域羊都运营数据中心</h1>
    <p>Cloudflare Workers 线上演示后台，聚合交易、履约、商品和供应链撮合数据。客户下单入口在 <a href="/">前端商城</a>。</p>
    <section class="grid">
      <div class="card"><span>已确认订单</span><strong>${overview.trade.paid_order_count}</strong></div>
      <div class="card"><span>累计交易额</span><strong>¥${overview.trade.gmv.toLocaleString("zh-CN")}</strong></div>
      <div class="card"><span>平均送达</span><strong>${overview.fulfillment.average_delivery_hours}h</strong></div>
      <div class="card"><span>冷链合格率</span><strong>${Math.round(overview.fulfillment.temperature_pass_rate * 100)}%</strong></div>
    </section>
    <table>
      <thead><tr><th>订单号</th><th>客户</th><th>来源</th><th>金额</th><th>状态</th></tr></thead>
      <tbody>${orders
        .map(
          (order) =>
            `<tr><td>${order.id}</td><td>${order.customer_name}</td><td>${order.channel}</td><td>¥${order.total_amount.toLocaleString("zh-CN")}</td><td>${order.status}</td></tr>`,
        )
        .join("")}</tbody>
    </table>
  </main>
</body>
</html>`;
}

async function handleApi(request, pathname) {
  if (request.method === "OPTIONS") return json({});
  if (pathname === "/api/health") return json({ status: "ok", service: "xiyu-yangdu-cloudflare-worker" });
  if (pathname === "/api/products") return json(products);
  if (pathname === "/api/orders" && request.method === "GET") return json(orders);
  if (pathname === "/api/customer/orders") {
    const keyword = new URL(request.url).searchParams.get("keyword")?.toLowerCase() || "";
    if (!keyword) return json([]);
    return json(
      orders.filter(
        (order) =>
          order.id.toLowerCase().includes(keyword) ||
          order.customer_name.toLowerCase().includes(keyword) ||
          order.items.some((item) => item.name.toLowerCase().includes(keyword)),
      ),
    );
  }
  if (pathname === "/api/summary") return json(summary());
  if (pathname === "/api/change-state") {
    const overview = summary();
    return json({
      version: `${orderVersion}:${orders[0]?.id || "none"}:${overview.trade.gmv}`,
      order_count: orders.length,
      latest_order_id: orders[0]?.id || "",
      latest_order_at: orders[0]?.created_at || "",
      total_gmv: overview.trade.gmv,
    });
  }
  if (pathname === "/api/supply-listings") return json(listings);
  if (pathname === "/api/supply-matches") return json(supplyMatches());
  if (pathname === "/api/merchant/login" && request.method === "POST") {
    const payload = await request.json();
    const merchant = merchants.find((item) => item.account === payload.account && item.password === payload.password);
    return merchant ? json(merchant) : json({ detail: "商户账号或密码不正确" }, { status: 401 });
  }
  const taskMatch = pathname.match(/^\/api\/merchant\/([^/]+)\/tasks$/);
  if (taskMatch) {
    const merchantId = decodeURIComponent(taskMatch[1]);
    return json(
      supplyMatches()
        .filter((match) => listings.find((listing) => listing.id === match.listing_id)?.merchant_id === merchantId)
        .map((match) => ({
          order_id: match.order_id,
          customer_name: match.customer_name,
          due_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          demand_summary: `${match.product_name} ${match.matched_quantity} 件`,
          items: [{ name: match.product_name, quantity: match.matched_quantity }],
        })),
    );
  }
  const listingMatch = pathname.match(/^\/api\/merchant\/([^/]+)\/listings$/);
  if (listingMatch && request.method === "GET") {
    const merchantId = decodeURIComponent(listingMatch[1]);
    return json(listings.filter((listing) => listing.merchant_id === merchantId));
  }
  if (listingMatch && request.method === "POST") {
    const merchantId = decodeURIComponent(listingMatch[1]);
    const merchant = merchants.find((item) => item.id === merchantId);
    if (!merchant) return json({ detail: "Merchant not found" }, { status: 404 });
    const payload = await request.json();
    const listing = {
      id: `LIST-CF-${Date.now()}`,
      farmer_name: merchant.name,
      origin_base: merchant.origin_base,
      product_id: payload.product_id,
      available_quantity: Number(payload.available_quantity),
      floor_price: Number(payload.floor_price),
      quality_score: Number(payload.quality_score || 90),
      available_at: payload.available_at || new Date().toISOString(),
      status: "listed",
      merchant_id: merchantId,
    };
    listings = [listing, ...listings];
    return json(listing, { status: 201 });
  }
  if (pathname === "/api/orders" && request.method === "POST") {
    const payload = await request.json();
    const items = payload.items.map((item) => {
      const product = products.find((candidate) => candidate.id === item.product_id);
      if (!product) throw new Error(`Unknown product id: ${item.product_id}`);
      return {
        product_id: product.id,
        name: product.name,
        quantity: Number(item.quantity),
        unit_price: product.price,
      };
    });
    const order = {
      id: `ORD-CF-${Date.now()}`,
      customer_name: payload.customer_name,
      channel: payload.channel || "C端小程序",
      customer_type: payload.customer_type || "家庭会员",
      status: "paid",
      created_at: new Date().toISOString(),
      total_amount: totalAmount(items),
      items,
    };
    orders = [order, ...orders].slice(0, 12);
    orderVersion += 1;
    return json(order, { status: 201 });
  }
  return json({ detail: "Not found" }, { status: 404 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, url.pathname);
    if (url.pathname === "/admin") return html(adminPage());
    return env.ASSETS.fetch(request);
  },
};
