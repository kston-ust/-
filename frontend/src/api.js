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
    image: "soup",
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
    image: "leg",
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
    image: "rack",
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
    image: "carcass",
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

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function normalizeProduct(product) {
  return {
    ...product,
    monthlySales: product.monthly_sales ?? product.monthlySales,
    digitalPremiumRate: product.digital_premium_rate ?? product.digitalPremiumRate,
    traceLabel: product.trace_label ?? product.traceLabel,
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
