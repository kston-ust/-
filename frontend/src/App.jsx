import { useEffect, useMemo, useState } from "react";

import {
  fallbackOrders,
  fallbackProducts,
  fallbackSummary,
  fetchOrders,
  fetchProducts,
  fetchSummary,
  submitOrder,
} from "./api.js";
import {
  buildOrderItems,
  canSubmitCart,
  deriveCartTotals,
  formatCurrency,
  percent,
  pickFeaturedProducts,
} from "./summary.js";
import "./styles.css";

const categoryTabs = ["全部", "基石产品", "增长产品", "溢价产品"];
const channelOptions = ["C端小程序", "B端集采", "社区团购", "直播电商"];
const customerTypeOptions = ["家庭会员", "火锅连锁", "生鲜商超", "企业食堂"];

function ProductVisual({ type }) {
  return (
    <div className={`product-visual product-visual-${type}`}>
      <span />
      <strong>{type === "soup" ? "24h" : type === "carcass" ? "B2B" : "37°"}</strong>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState(fallbackProducts);
  const [summary, setSummary] = useState(fallbackSummary);
  const [orders, setOrders] = useState(fallbackOrders);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [cart, setCart] = useState({ "P-SOUP": 6, "P-RACK": 2 });
  const [customerName, setCustomerName] = useState("西域羊都体验客户");
  const [channel, setChannel] = useState("C端小程序");
  const [customerType, setCustomerType] = useState("家庭会员");
  const [status, setStatus] = useState({ type: "idle", text: "已连接交易中台，可提交样例订单。" });

  async function refreshBusinessData() {
    const [nextProducts, nextSummary, nextOrders] = await Promise.all([
      fetchProducts(),
      fetchSummary(),
      fetchOrders(),
    ]);
    setProducts(nextProducts);
    setSummary(nextSummary);
    setOrders(nextOrders);
  }

  useEffect(() => {
    refreshBusinessData().catch(() => {
      setStatus({ type: "warning", text: "后端未连接，当前显示内置演示数据。" });
    });
  }, []);

  const visibleProducts = useMemo(
    () =>
      activeCategory === "全部"
        ? products
        : products.filter((product) => product.category === activeCategory),
    [activeCategory, products],
  );
  const cartTotals = useMemo(() => deriveCartTotals(products, cart), [products, cart]);
  const featuredProducts = useMemo(() => pickFeaturedProducts(products, 3), [products]);
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const canSubmit = canSubmitCart(customerName, cart) && status.type !== "loading";

  function addToCart(productId) {
    setCart((current) => ({ ...current, [productId]: (current[productId] || 0) + 1 }));
  }

  function changeQuantity(productId, delta) {
    setCart((current) => {
      const quantity = Math.max(0, (current[productId] || 0) + delta);
      const next = { ...current, [productId]: quantity };
      if (quantity === 0) {
        delete next[productId];
      }
      return next;
    });
  }

  function clearCart() {
    setCart({});
  }

  async function handleSubmitOrder() {
    if (!canSubmitCart(customerName, cart)) {
      setStatus({ type: "error", text: "请填写客户名称，并至少选择一个商品。" });
      return;
    }

    setStatus({ type: "loading", text: "正在提交订单，牵引后端交易数据..." });
    try {
      const createdOrder = await submitOrder({
        customer_name: customerName.trim(),
        channel,
        customer_type: customerType,
        items: buildOrderItems(cart),
      });
      setCart({});
      await refreshBusinessData();
      setStatus({
        type: "success",
        text: `订单 ${createdOrder.id} 已成交，GMV、订单数和渠道收入已刷新。`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: `提交失败：${error.message || "请确认后端 http://127.0.0.1:8000 已启动。"}`,
      });
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-band">
        <nav className="topbar">
          <div className="brand-mark">西域羊都</div>
          <div className="nav-pills">
            <span>商城交易</span>
            <span>在线下单</span>
            <span>数据回流</span>
            <span>JIT冷链</span>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">西北羊产业数字化供应链平台</p>
            <h1>网上交易商城</h1>
            <p className="hero-text">
              从选品、加购、下单到经营数据刷新，模拟“消费者订单牵引后端中台”的真实交易场景。
            </p>
            <div className="hero-actions">
              <a href="#products">进入交易</a>
              <a href="#orders" className="secondary-action">
                查看订单流
              </a>
            </div>
          </div>

          <aside className="trade-console">
            <div>
              <span className="console-label">实时GMV</span>
              <strong>{formatCurrency(summary.trade.gmv)}</strong>
            </div>
            <div>
              <span className="console-label">成交订单</span>
              <strong>{summary.trade.paid_order_count}</strong>
            </div>
            <div>
              <span className="console-label">平均履约</span>
              <strong>{summary.fulfillment.average_delivery_hours}h</strong>
            </div>
            <div className="temperature-strip">
              <span>冷链温控合格率</span>
              <b>{percent(summary.fulfillment.temperature_pass_rate)}</b>
            </div>
          </aside>
        </div>
      </section>

      <section className="shop-layout" id="products">
        <div className="catalog-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Online Trade</p>
              <h2>数字溯源商品</h2>
            </div>
            <div className="tabs" aria-label="商品分类">
              {categoryTabs.map((category) => (
                <button
                  className={activeCategory === category ? "active" : ""}
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <ProductVisual type={product.image} />
                <div className="product-copy">
                  <div className="product-meta">
                    <span>{product.category}</span>
                    <span>{product.origin}</span>
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.scene}</p>
                  <div className="trace-row">{product.traceLabel}</div>
                  <div className="product-footer">
                    <strong>
                      {formatCurrency(product.price)}
                      <small>/{product.unit}</small>
                    </strong>
                    <button onClick={() => addToCart(product.id)} type="button">
                      加入交易单
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="cart-panel">
          <p className="eyebrow">Trade Sheet</p>
          <h2>在线交易单</h2>

          <label className="field-label">
            客户名称
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          </label>
          <div className="form-grid">
            <label className="field-label">
              渠道
              <select value={channel} onChange={(event) => setChannel(event.target.value)}>
                {channelOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="field-label">
              客户类型
              <select value={customerType} onChange={(event) => setCustomerType(event.target.value)}>
                {customerTypeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="cart-lines">
            {products.filter((product) => cart[product.id]).length === 0 ? (
              <div className="empty-cart">交易单为空，请从左侧商品加入。</div>
            ) : (
              products
                .filter((product) => cart[product.id])
                .map((product) => (
                  <div className="cart-line interactive" key={product.id}>
                    <span>{product.name}</span>
                    <div className="stepper">
                      <button onClick={() => changeQuantity(product.id, -1)} type="button">
                        -
                      </button>
                      <b>{cart[product.id]}</b>
                      <button onClick={() => changeQuantity(product.id, 1)} type="button">
                        +
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
          <div className="cart-total">
            <span>商品数量</span>
            <strong>{cartTotals.itemCount}</strong>
          </div>
          <div className="cart-total">
            <span>预计成交额</span>
            <strong>{formatCurrency(cartTotals.subtotal)}</strong>
          </div>
          <div className="premium-box">
            <span>数字溯源带来的估算溢价</span>
            <b>{formatCurrency(cartTotals.estimatedDigitalPremium)}</b>
          </div>
          <div className={`submit-status ${status.type}`}>{status.text}</div>
          <div className="cart-actions">
            <button className="checkout-button" disabled={!canSubmit} onClick={handleSubmitOrder} type="button">
              {status.type === "loading" ? "提交中..." : "提交订单并刷新数据"}
            </button>
            <button className="clear-button" onClick={clearCart} type="button">
              清空
            </button>
          </div>
        </aside>
      </section>

      <section className="dashboard-band" id="dashboard">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Business Summary</p>
            <h2>综合经营归纳模块</h2>
          </div>
          <p className="section-note">后端 `/api/summary` 汇总交易、履约、金融撮合与农户收益。</p>
        </div>

        <div className="kpi-grid">
          <Kpi title="平均客单价" value={formatCurrency(summary.trade.average_order_value)} tone="green" />
          <Kpi title="金融撮合额" value={formatCurrency(summary.finance.loan_volume)} tone="blue" />
          <Kpi title="平台服务费" value={formatCurrency(summary.finance.platform_service_fee)} tone="gold" />
          <Kpi
            title="农户增收"
            value={formatCurrency(summary.farmer_value.total_incremental_income)}
            tone="rose"
          />
        </div>

        <div className="dashboard-grid">
          <article className="analytics-card">
            <h3>热销商品</h3>
            <div className="leader-list">
              {featuredProducts.map((product, index) => (
                <div key={product.id}>
                  <span>{index + 1}</span>
                  <b>{product.name}</b>
                  <em>{product.monthlySales} 单/月</em>
                </div>
              ))}
            </div>
          </article>
          <article className="analytics-card">
            <h3>渠道收入</h3>
            {Object.entries(summary.trade.channel_revenue).map(([channelName, value]) => (
              <div className="bar-row" key={channelName}>
                <span>{channelName}</span>
                <div>
                  <i style={{ width: `${Math.min(100, (value / Math.max(1, summary.trade.gmv)) * 100)}%` }} />
                </div>
                <b>{formatCurrency(value)}</b>
              </div>
            ))}
          </article>
          <article className="analytics-card">
            <h3>履约质量</h3>
            <div className="quality-meter">
              <strong>{percent(summary.fulfillment.average_loss_rate)}</strong>
              <span>平均损耗率，目标低于 {percent(summary.fulfillment.loss_rate_target)}</span>
            </div>
            <div className="quality-meter">
              <strong>{summary.fulfillment.average_delivery_hours}h</strong>
              <span>平均送达，目标 {summary.fulfillment.jit_target_hours}h 内</span>
            </div>
          </article>
        </div>
      </section>

      <section className="orders-band" id="orders">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Order Stream</p>
            <h2>后端订单流</h2>
          </div>
          <button className="refresh-button" onClick={refreshBusinessData} type="button">
            手动刷新
          </button>
        </div>
        <div className="order-list">
          {recentOrders.map((order) => (
            <article className="order-card" key={order.id}>
              <div>
                <span>{order.id}</span>
                <strong>{order.customer_name}</strong>
              </div>
              <div>
                <span>{order.channel}</span>
                <strong>{formatCurrency(order.total_amount)}</strong>
              </div>
              <div>
                <span>{order.customer_type}</span>
                <strong>{order.status === "paid" ? "已成交" : "待处理"}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Kpi({ title, value, tone }) {
  return (
    <article className={`kpi-card ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default App;
