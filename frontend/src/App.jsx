import { useEffect, useMemo, useRef, useState } from "react";

import {
  fallbackChangeState,
  fallbackProducts,
  fallbackSummary,
  fetchChangeState,
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
  shouldRefreshData,
} from "./summary.js";
import "./styles.css";

const categoryTabs = ["全部", "基石产品", "增长产品", "溢价产品"];
const purchaseProfiles = [
  {
    id: "home",
    label: "家庭自用",
    description: "适合家庭火锅、煎烤和日常囤货",
    channel: "C端小程序",
    customerType: "家庭会员",
  },
  {
    id: "group",
    label: "社区团购",
    description: "适合邻里拼团、社区团长集中下单",
    channel: "社区团购",
    customerType: "家庭会员",
  },
  {
    id: "restaurant",
    label: "餐饮集采",
    description: "适合火锅店、酒店和企业食堂批量采购",
    channel: "B端集采",
    customerType: "火锅连锁",
  },
  {
    id: "live",
    label: "直播福利",
    description: "适合直播间活动、限时组合购买",
    channel: "直播电商",
    customerType: "家庭会员",
  },
];

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
  const [activeCategory, setActiveCategory] = useState("全部");
  const [cart, setCart] = useState({ "P-SOUP": 6, "P-RACK": 2 });
  const [customerName, setCustomerName] = useState("西域羊都体验客户");
  const [profileId, setProfileId] = useState("home");
  const [status, setStatus] = useState({ type: "idle", text: "请选择商品，确认后会生成一笔模拟交易订单。" });
  const [lastOrder, setLastOrder] = useState(null);
  const [submittedOrders, setSubmittedOrders] = useState([]);
  const [changeState, setChangeState] = useState(fallbackChangeState);
  const [lastCheckedAt, setLastCheckedAt] = useState("");
  const changeStateRef = useRef(fallbackChangeState);

  function rememberChangeState(nextState) {
    changeStateRef.current = nextState;
    setChangeState(nextState);
  }

  async function refreshCustomerData() {
    const [nextProducts, nextSummary, nextChangeState] = await Promise.all([
      fetchProducts(),
      fetchSummary(),
      fetchChangeState(),
    ]);
    setProducts(nextProducts);
    setSummary(nextSummary);
    rememberChangeState(nextChangeState);
  }

  useEffect(() => {
    refreshCustomerData().catch(() => {
      setStatus({ type: "warning", text: "暂时无法连接交易服务，页面正在使用演示商品数据。" });
    });
  }, []);

  useEffect(() => {
    let isActive = true;

    async function refreshIfChanged() {
      try {
        const nextChangeState = await fetchChangeState();
        if (!isActive) {
          return;
        }

        setLastCheckedAt(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
        if (shouldRefreshData(changeStateRef.current, nextChangeState)) {
          await refreshCustomerData();
          if (!isActive) {
            return;
          }
          setStatus((current) =>
            current.type === "loading" ? current : { type: "success", text: "订单状态已自动更新，页面信息已刷新。" },
          );
          return;
        }

        rememberChangeState(nextChangeState);
      } catch {
        if (isActive) {
          setLastCheckedAt("");
        }
      }
    }

    const timer = window.setInterval(refreshIfChanged, 5000);
    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, []);

  const activeProfile = purchaseProfiles.find((profile) => profile.id === profileId) || purchaseProfiles[0];
  const visibleProducts = useMemo(
    () =>
      activeCategory === "全部"
        ? products
        : products.filter((product) => product.category === activeCategory),
    [activeCategory, products],
  );
  const cartTotals = useMemo(() => deriveCartTotals(products, cart), [products, cart]);
  const featuredProducts = useMemo(() => pickFeaturedProducts(products, 3), [products]);
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
      setStatus({ type: "error", text: "请填写采购方名称，并至少选择一个商品。" });
      return;
    }

    setStatus({ type: "loading", text: "正在提交订单，请稍候..." });
    try {
      const createdOrder = await submitOrder({
        customer_name: customerName.trim(),
        channel: activeProfile.channel,
        customer_type: activeProfile.customerType,
        items: buildOrderItems(cart),
      });
      setLastOrder(createdOrder);
      setSubmittedOrders((current) => [createdOrder, ...current].slice(0, 3));
      setCart({});
      await refreshCustomerData();
      setStatus({
        type: "success",
        text: `订单 ${createdOrder.id} 已提交成功，商品明细和金额已由交易服务确认。`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: `订单提交失败：${error.message || "请确认后端服务已启动。"}`,
      });
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-band">
        <nav className="topbar">
          <div className="brand-mark">西域羊都</div>
          <div className="nav-pills">
            <span>产地直供</span>
            <span>冷链到家</span>
            <span>扫码溯源</span>
            <span>放心下单</span>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">西北羊产业数字化供应链平台</p>
            <h1>安心买西北好羊肉</h1>
            <p className="hero-text">
              从古浪产地直采到冷链配送，页面只呈现顾客需要判断购买的信息：品质、价格、溯源、履约和订单确认。
            </p>
            <div className="hero-actions">
              <a href="#products">选购商品</a>
              <a href="#assurance" className="secondary-action">
                查看保障
              </a>
            </div>
          </div>

          <aside className="trade-console">
            <div>
              <span className="console-label">可选商品</span>
              <strong>{products.length} 款</strong>
            </div>
            <div>
              <span className="console-label">已验证订单</span>
              <strong>{summary.trade.paid_order_count}</strong>
            </div>
            <div>
              <span className="console-label">平均送达</span>
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
              <p className="eyebrow">Shop</p>
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
                      加入购物车
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="cart-panel">
          <p className="eyebrow">Checkout</p>
          <h2>确认订单</h2>

          <label className="field-label">
            采购方名称
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          </label>
          <label className="field-label">
            采购场景
            <select value={profileId} onChange={(event) => setProfileId(event.target.value)}>
              {purchaseProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.label}
                </option>
              ))}
            </select>
            <span className="profile-help">{activeProfile.description}</span>
          </label>

          <div className="cart-lines">
            {products.filter((product) => cart[product.id]).length === 0 ? (
              <div className="empty-cart">购物车为空，请从左侧选择商品。</div>
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
            <span>预计金额</span>
            <strong>{formatCurrency(cartTotals.subtotal)}</strong>
          </div>
          <div className="premium-box">
            <span>品质溯源带来的参考价值</span>
            <b>{formatCurrency(cartTotals.estimatedDigitalPremium)}</b>
          </div>
          <div className={`submit-status ${status.type}`}>{status.text}</div>
          <div className="auto-refresh-note">
            <span>订单状态自动更新</span>
            <b>{lastCheckedAt ? `上次检查 ${lastCheckedAt}` : "准备同步"}</b>
            <small>{changeState.latest_order_id ? `最近确认 ${changeState.latest_order_id}` : "暂无新订单"}</small>
          </div>
          <div className="cart-actions">
            <button className="checkout-button" disabled={!canSubmit} onClick={handleSubmitOrder} type="button">
              {status.type === "loading" ? "提交中..." : "提交订单"}
            </button>
            <button className="clear-button" onClick={clearCart} type="button">
              清空
            </button>
          </div>
        </aside>
      </section>

      <section className="dashboard-band" id="assurance">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Assurance</p>
            <h2>购买前可以确认的保障</h2>
          </div>
          <p className="section-note">这些数据来自交易服务汇总，但页面只展示顾客能理解并用于判断是否购买的信息。</p>
        </div>

        <div className="kpi-grid">
          <Kpi title="已完成订单" value={`${summary.trade.paid_order_count} 笔`} tone="green" />
          <Kpi title="平均送达" value={`${summary.fulfillment.average_delivery_hours}h`} tone="blue" />
          <Kpi title="冷链合格率" value={percent(summary.fulfillment.temperature_pass_rate)} tone="gold" />
          <Kpi title="平均损耗率" value={percent(summary.fulfillment.average_loss_rate)} tone="rose" />
        </div>

        <div className="dashboard-grid">
          <article className="analytics-card">
            <h3>热销推荐</h3>
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
            <h3>每单可查的品质信息</h3>
            <div className="assurance-list">
              <div>电子耳标与批次编号</div>
              <div>无抗养殖与检疫记录</div>
              <div>0-4℃冷链温控轨迹</div>
              <div>产地、加工、配送节点</div>
            </div>
          </article>
          <article className="analytics-card">
            <h3>配送承诺</h3>
            <div className="quality-meter">
              <strong>{summary.fulfillment.jit_target_hours}h</strong>
              <span>目标时效内完成冷链配送</span>
            </div>
            <div className="quality-meter">
              <strong>{percent(summary.fulfillment.loss_rate_target)}</strong>
              <span>目标损耗率上限</span>
            </div>
          </article>
        </div>
      </section>

      <section className="orders-band" id="orders">
        <div className="section-heading">
          <div>
            <p className="eyebrow">My Orders</p>
            <h2>我的订单确认</h2>
          </div>
        </div>
        {lastOrder ? (
          <article className="confirmation-panel">
            <div>
              <span>最近提交</span>
              <strong>{lastOrder.id}</strong>
            </div>
            <div>
              <span>确认金额</span>
              <strong>{formatCurrency(lastOrder.total_amount)}</strong>
            </div>
            <div>
              <span>订单状态</span>
              <strong>{lastOrder.status === "paid" ? "已确认" : "处理中"}</strong>
            </div>
          </article>
        ) : (
          <div className="empty-cart">提交订单后，这里会显示订单号、金额和状态。</div>
        )}
        {submittedOrders.length > 0 && (
          <div className="order-list">
            {submittedOrders.map((order) => (
              <article className="order-card" key={order.id}>
                <div>
                  <span>订单号</span>
                  <strong>{order.id}</strong>
                </div>
                <div>
                  <span>采购场景</span>
                  <strong>{order.customer_type}</strong>
                </div>
                <div>
                  <span>金额</span>
                  <strong>{formatCurrency(order.total_amount)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
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
