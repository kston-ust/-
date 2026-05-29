import { useEffect, useMemo, useState } from "react";

import { fallbackProducts, fallbackSummary, fetchProducts, fetchSummary } from "./api.js";
import { deriveCartTotals, formatCurrency, percent, pickFeaturedProducts } from "./summary.js";
import "./styles.css";

const categoryTabs = ["全部", "基石产品", "增长产品", "溢价产品"];

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

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchSummary().then(setSummary);
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

  function addToCart(productId) {
    setCart((current) => ({ ...current, [productId]: (current[productId] || 0) + 1 }));
  }

  return (
    <main className="app-shell">
      <section className="hero-band">
        <nav className="topbar">
          <div className="brand-mark">西域羊都</div>
          <div className="nav-pills">
            <span>商城交易</span>
            <span>区块链溯源</span>
            <span>JIT冷链</span>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">西北羊产业数字化供应链平台</p>
            <h1>网上交易商城</h1>
            <p className="hero-text">
              把古浪产地直采、无抗养殖、24道智慧加工和冷链履约放进同一个交易界面。
            </p>
            <div className="hero-actions">
              <a href="#products">选购数字溯源羊肉</a>
              <a href="#dashboard" className="secondary-action">
                查看经营总览
              </a>
            </div>
          </div>

          <aside className="trade-console">
            <div>
              <span className="console-label">实时GMV</span>
              <strong>{formatCurrency(summary.trade.gmv)}</strong>
            </div>
            <div>
              <span className="console-label">订单数</span>
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
          <h2>交易单</h2>
          <div className="cart-lines">
            {products
              .filter((product) => cart[product.id])
              .map((product) => (
                <div className="cart-line" key={product.id}>
                  <span>{product.name}</span>
                  <b>x{cart[product.id]}</b>
                </div>
              ))}
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
          <button className="checkout-button" type="button">
            提交样例订单
          </button>
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
            {Object.entries(summary.trade.channel_revenue).map(([channel, value]) => (
              <div className="bar-row" key={channel}>
                <span>{channel}</span>
                <div>
                  <i style={{ width: `${Math.min(100, (value / summary.trade.gmv) * 100)}%` }} />
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
