export const fallbackProducts = [
  {
    id: "P-SOUP",
    name: "即食羊汤预制包",
    category: "增长产品",
    origin: "0-4℃排酸冷链加工线",
    scene: "一人食 / 社区团购",
    price: 69,
    unit: "份",
    stock: 1200,
    monthlySales: 930,
    digitalPremiumRate: 0.18,
    traceLabel: "批次检疫合格证 + 温控轨迹",
    image: "/products/lamb-soup.jpg",
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
    monthlySales: 520,
    digitalPremiumRate: 0.22,
    traceLabel: "24道智慧加工工序记录",
    image: "/products/lamb-leg.jpg",
  },
  {
    id: "P-RACK",
    name: "北纬37度法式羊排",
    category: "溢价产品",
    origin: "甘肃古浪数字示范养殖区",
    scene: "家庭煎烤 / 礼赠",
    price: 460,
    unit: "盒",
    stock: 280,
    monthlySales: 368,
    digitalPremiumRate: 0.28,
    traceLabel: "区块链溯源卡 + 无抗养殖记录",
    image: "/products/lamb-rack.jpg",
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
    monthlySales: 210,
    digitalPremiumRate: 0.12,
    traceLabel: "电子耳标 + 屠宰检疫联单",
    image: "/products/lamb-carcass.jpg",
  },
];

export const fallbackSummary = {
  trade: {
    gmv: 194180,
    paid_order_count: 3,
    average_order_value: 64727,
    top_product: { name: "古浪精修羊腿", quantity: 116, revenue: 90480 },
    channel_revenue: { "B端集采": 190500, "C端小程序": 3680 },
    customer_mix: { 火锅连锁: 1, 生鲜商超: 1, 家庭会员: 1 },
  },
  fulfillment: {
    average_delivery_hours: 28.7,
    average_loss_rate: 0.0237,
    temperature_pass_rate: 1,
    jit_target_hours: 48,
    loss_rate_target: 0.03,
  },
  finance: {
    loan_volume: 500000,
    platform_service_fee: 8460,
    average_service_fee_rate: 0.0167,
  },
  farmer_value: {
    farmer_count: 3,
    total_incremental_income: 19900,
    average_incremental_income: 6633,
  },
};

export const fallbackChangeState = {
  version: "3:ORD-202605-004:194180",
  order_count: 3,
  latest_order_id: "ORD-202605-004",
  latest_order_at: "2026-05-27T16:45:00",
  total_gmv: 194180,
};

export const fallbackOrders = [
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
];

export const fallbackSupplyMatches = [
  {
    order_id: "ORD-202605-004",
    customer_name: "华东精品商超",
    channel: "B端集采",
    product_id: "P-SOUP",
    product_name: "即食羊汤预制包",
    listing_id: "LIST-003",
    farmer_name: "土门镇联营牧场",
    origin_base: "土门镇冷链前置仓",
    matched_quantity: 500,
    pricing: {
      floor_price: 56,
      settlement_price: 59,
      terminal_reference_price: 69,
      premium_rate: 0.06,
    },
    jit: {
      status: "订单即排产",
      slaughter_window: "T+0.5天",
      cold_chain_target_hours: 48,
      loss_rate_target: 0.03,
    },
  },
  {
    order_id: "ORD-202605-002",
    customer_name: "上海陆家嘴家庭会员",
    channel: "C端小程序",
    product_id: "P-RACK",
    product_name: "北纬37度法式羊排",
    listing_id: "LIST-002",
    farmer_name: "西靖镇标准化养殖户",
    origin_base: "西靖镇无抗养殖示范区",
    matched_quantity: 8,
    pricing: {
      floor_price: 410,
      settlement_price: 459,
      terminal_reference_price: 460,
      premium_rate: 0.12,
    },
    jit: {
      status: "订单即排产",
      slaughter_window: "T+0.5天",
      cold_chain_target_hours: 48,
      loss_rate_target: 0.03,
    },
  },
];

export const fallbackSupplyListings = [
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
  },
];

export const fallbackMerchantTasks = [];

const productImageMap = {
  soup: "/products/lamb-soup.jpg",
  leg: "/products/lamb-leg.jpg",
  rack: "/products/lamb-rack.jpg",
  carcass: "/products/lamb-carcass.jpg",
};

const viteEnv = import.meta.env;
const configuredApiBase = viteEnv?.VITE_API_BASE;
const API_BASE =
  configuredApiBase !== undefined ? configuredApiBase.replace(/\/$/, "") : viteEnv?.PROD ? "" : "http://localhost:8000";

function normalizeProductImage(image) {
  return productImageMap[image] || image || "/products/lamb-rack.jpg";
}

function normalizeProduct(product) {
  return {
    ...product,
    monthlySales: product.monthly_sales ?? product.monthlySales,
    digitalPremiumRate: product.digital_premium_rate ?? product.digitalPremiumRate,
    traceLabel: product.trace_label ?? product.traceLabel,
    image: normalizeProductImage(product.image),
  };
}

async function requestJson(path, fallback) {
  try {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return await response.json();
  } catch {
    return fallback;
  }
}

export async function fetchProducts() {
  const products = await requestJson("/api/products", fallbackProducts);
  return products.map(normalizeProduct);
}

export async function fetchSummary() {
  return requestJson("/api/summary", fallbackSummary);
}

export async function fetchChangeState() {
  return requestJson("/api/change-state", fallbackChangeState);
}

export async function fetchOrders() {
  return requestJson("/api/orders", fallbackOrders);
}

export async function fetchCustomerOrders(keyword) {
  if (!keyword.trim()) {
    return [];
  }
  return requestJson(`/api/customer/orders?keyword=${encodeURIComponent(keyword.trim())}`, []);
}

export async function fetchSupplyMatches() {
  return requestJson("/api/supply-matches", fallbackSupplyMatches);
}

export async function fetchSupplyListings() {
  return requestJson("/api/supply-listings", fallbackSupplyListings);
}

export async function fetchMerchantTasks(merchantId) {
  return requestJson(`/api/merchant/${encodeURIComponent(merchantId)}/tasks`, fallbackMerchantTasks);
}

export async function fetchMerchantListings(merchantId) {
  return requestJson(`/api/merchant/${encodeURIComponent(merchantId)}/listings`, []);
}

export async function createMerchantListing(merchantId, payload) {
  const response = await fetch(`${API_BASE}/api/merchant/${encodeURIComponent(merchantId)}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Listing failed: ${response.status}`);
  }
  return response.json();
}

export async function merchantLogin(payload) {
  const response = await fetch(`${API_BASE}/api/merchant/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Login failed: ${response.status}`);
  }
  return response.json();
}

export async function submitOrder(payload) {
  const response = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Order failed: ${response.status}`);
  }
  return response.json();
}
