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

export function pickFeaturedProducts(products, count = 3) {
  return [...products].sort((left, right) => right.monthlySales - left.monthlySales).slice(0, count);
}

export function shouldRefreshData(previousState, nextState) {
  return Boolean(previousState?.version && nextState?.version && previousState.version !== nextState.version);
}

export function percent(value) {
  return `${(value * 100).toFixed(value < 0.1 ? 1 : 0)}%`;
}
