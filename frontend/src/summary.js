export function formatCurrency(value) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function deriveCartTotals(products, cart) {
  return products.reduce(
    (totals, product) => {
      const quantity = cart[product.id] || 0;
      const lineTotal = quantity * product.price;
      return {
        itemCount: totals.itemCount + quantity,
        subtotal: totals.subtotal + lineTotal,
        estimatedDigitalPremium:
          totals.estimatedDigitalPremium + Math.round(lineTotal * product.digitalPremiumRate),
      };
    },
    { itemCount: 0, subtotal: 0, estimatedDigitalPremium: 0 },
  );
}

export function buildOrderItems(cart) {
  return Object.entries(cart)
    .filter(([, quantity]) => Number(quantity) > 0)
    .map(([productId, quantity]) => ({
      product_id: productId,
      quantity: Number(quantity),
    }));
}

export function canSubmitCart(customerName, cart) {
  return customerName.trim().length >= 2 && buildOrderItems(cart).length > 0;
}

export function canLoginMerchant(account, password) {
  return account.trim().length >= 2 && password.trim().length >= 4;
}

export function pickFeaturedProducts(products, count = 3) {
  return [...products].sort((left, right) => right.monthlySales - left.monthlySales).slice(0, count);
}

export function shouldRefreshData(previousState, nextState) {
  return Boolean(previousState?.version && nextState?.version && previousState.version !== nextState.version);
}

export function formatSupplyMatch(match) {
  return `${match.farmer_name}匹配 ${match.matched_quantity} 件${match.product_name}，${match.jit.cold_chain_target_hours}h 冷链，溢价 ${percent(match.pricing.premium_rate)}`;
}

export function filterMerchantTasks(tasks, keyword) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return tasks;
  }
  return tasks.filter((task) => {
    const itemNames = (task.items || []).map((item) => item.name).join(" ");
    const text = `${task.order_id} ${task.customer_name} ${task.demand_summary} ${itemNames}`.toLowerCase();
    return text.includes(normalized);
  });
}

export function summarizeMerchantTask(task) {
  const dueAt = String(task.due_at || "").replace("T", " ").slice(0, 16);
  return `${dueAt || "待确认时间"} 需要 ${task.demand_summary || "待确认需求"}`;
}

export function findCustomerOrders(orders, keyword) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return [];
  }
  return orders.filter((order) => {
    const itemNames = (order.items || []).map((item) => item.name).join(" ");
    const text = `${order.id} ${order.customer_name} ${order.channel || ""} ${itemNames}`.toLowerCase();
    return text.includes(normalized);
  });
}

export function percent(value) {
  return `${(value * 100).toFixed(value < 0.1 ? 1 : 0)}%`;
}
