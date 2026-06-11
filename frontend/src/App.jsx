import { useEffect, useMemo, useRef, useState } from "react";

import {
  fallbackChangeState,
  fallbackProducts,
  fallbackSummary,
  createMerchantListing,
  fetchChangeState,
  fetchCustomerOrders,
  fetchMerchantListings,
  fetchMerchantTasks,
  fetchProducts,
  fetchSummary,
  merchantLogin,
  submitOrder,
} from "./api.js";
import {
  buildOrderItems,
  canLoginMerchant,
  canSubmitCart,
  deriveCartTotals,
  filterMerchantTasks,
  findCustomerOrders,
  formatCurrency,
  percent,
  pickFeaturedProducts,
  shouldRefreshData,
  summarizeMerchantTask,
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

function ProductPhoto({ product }) {
  return (
    <div className="product-photo">
      <img src={product.image} alt={`${product.name} product photo`} loading="lazy" />
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState("customer");
  const [products, setProducts] = useState(fallbackProducts);
  const [summary, setSummary] = useState(fallbackSummary);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [cart, setCart] = useState({ "P-SOUP": 6, "P-RACK": 2 });
  const [customerName, setCustomerName] = useState("西域羊都体验客户");
  const [profileId, setProfileId] = useState("home");
  const [status, setStatus] = useState({ type: "idle", text: "请选择商品，确认后会生成一笔模拟交易订单。" });
  const [lastOrder, setLastOrder] = useState(null);
  const [submittedOrders, setSubmittedOrders] = useState([]);
  const [orderQuery, setOrderQuery] = useState("");
  const [queriedOrders, setQueriedOrders] = useState([]);
  const [orderQueryStatus, setOrderQueryStatus] = useState("输入订单号、客户名或商品名查询。");
  const [changeState, setChangeState] = useState(fallbackChangeState);
  const [lastCheckedAt, setLastCheckedAt] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [merchantAccount, setMerchantAccount] = useState("");
  const [merchantPassword, setMerchantPassword] = useState("");
  const [merchantStatus, setMerchantStatus] = useState("请输入商户账号和密码。");
  const [merchant, setMerchant] = useState(null);
  const [merchantTasks, setMerchantTasks] = useState([]);
  const [merchantTaskQuery, setMerchantTaskQuery] = useState("");
  const [merchantListings, setMerchantListings] = useState([]);
  const [listingProductId, setListingProductId] = useState("P-LEG");
  const [listingQuantity, setListingQuantity] = useState(20);
  const [listingFloorPrice, setListingFloorPrice] = useState(700);
  const [listingStatus, setListingStatus] = useState("填写数量和底价后可提交挂单。");
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

  async function handleOrderQuery() {
    if (!orderQuery.trim()) {
      setQueriedOrders([]);
      setOrderQueryStatus("请输入订单号、客户名或商品名后查询。");
      return;
    }
    setOrderQueryStatus("正在查询订单...");
    try {
      const orders = await fetchCustomerOrders(orderQuery);
      setQueriedOrders(orders);
      setOrderQueryStatus(orders.length ? `找到 ${orders.length} 笔相关订单。` : "没有找到匹配订单。");
    } catch {
      const fallbackMatches = findCustomerOrders(submittedOrders, orderQuery);
      setQueriedOrders(fallbackMatches);
      setOrderQueryStatus(fallbackMatches.length ? "已在本次提交记录中找到订单。" : "暂时无法连接订单查询服务。");
    }
  }

  async function refreshMerchantWorkspace(nextMerchant = merchant) {
    if (!nextMerchant) {
      return;
    }
    const [tasks, listings] = await Promise.all([fetchMerchantTasks(nextMerchant.id), fetchMerchantListings(nextMerchant.id)]);
    setMerchantTasks(tasks);
    setMerchantListings(listings);
  }

  async function handleMerchantLogin() {
    if (!canLoginMerchant(merchantAccount, merchantPassword)) {
      setMerchantStatus("请填写至少 2 位账号和 4 位密码。");
      return;
    }
    setMerchantStatus("正在验证商户身份...");
    try {
      const nextMerchant = await merchantLogin({
        account: merchantAccount.trim(),
        password: merchantPassword,
      });
      setMerchant(nextMerchant);
      setActiveView("merchant");
      setLoginOpen(false);
      setMerchantStatus("登录成功。");
      await refreshMerchantWorkspace(nextMerchant);
    } catch {
      setMerchantStatus("账号或密码不正确，请联系平台后台确认商户信息。");
    }
  }

  function logoutMerchant() {
    setMerchant(null);
    setMerchantTasks([]);
    setMerchantListings([]);
    setMerchantTaskQuery("");
    setActiveView("customer");
  }

  async function handleCreateListing() {
    if (!merchant) {
      return;
    }
    if (Number(listingQuantity) <= 0 || Number(listingFloorPrice) <= 0) {
      setListingStatus("请填写大于 0 的可供数量和底价。");
      return;
    }
    setListingStatus("正在提交挂单...");
    try {
      await createMerchantListing(merchant.id, {
        product_id: listingProductId,
        available_quantity: Number(listingQuantity),
        floor_price: Number(listingFloorPrice),
        quality_score: 92,
      });
      setListingStatus("挂单已提交，平台后台可用于撮合与分配。");
      await refreshMerchantWorkspace();
    } catch {
      setListingStatus("挂单提交失败，请确认后端服务和商户信息。");
    }
  }

  const visibleMerchantTasks = filterMerchantTasks(merchantTasks, merchantTaskQuery);

  if (activeView === "merchant" && merchant) {
    return (
      <main className="app-shell merchant-shell">
        <section className="merchant-hero">
          <nav className="topbar merchant-topbar">
            <div className="brand-mark">西域羊都商户端</div>
            <div className="merchant-actions">
              <button className="secondary-button" onClick={() => setActiveView("customer")} type="button">
                返回消费者页面
              </button>
              <button className="secondary-button" onClick={logoutMerchant} type="button">
                退出登录
              </button>
            </div>
          </nav>
          <div className="merchant-title">
            <p className="eyebrow">Merchant Workspace</p>
            <h1>{merchant.name}</h1>
            <p>{merchant.origin_base} · 主供品类 {merchant.product_focus}</p>
          </div>
        </section>

        <section className="merchant-grid">
          <div className="merchant-main">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Tasks</p>
                <h2>后端分配需求</h2>
              </div>
              <button onClick={() => refreshMerchantWorkspace()} type="button">
                刷新任务
              </button>
            </div>
            <div className="merchant-query">
              <input
                value={merchantTaskQuery}
                onChange={(event) => setMerchantTaskQuery(event.target.value)}
                placeholder="查询订单号、客户或商品"
              />
            </div>
            <div className="task-list">
              {visibleMerchantTasks.length > 0 ? (
                visibleMerchantTasks.map((task) => (
                  <article className="task-card" key={task.order_id}>
                    <div className="task-topline">
                      <span>{task.order_id}</span>
                      <b>{task.status === "assigned" ? "待处理" : task.status}</b>
                    </div>
                    <h3>{summarizeMerchantTask(task)}</h3>
                    <p>{task.customer_name} · {task.channel}</p>
                    <div className="task-items">
                      {task.items.map((item) => (
                        <span key={`${task.order_id}-${item.product_id}`}>
                          {item.name} {item.quantity} {item.unit || "件"}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-cart">暂无匹配任务，等待平台后台分配。</div>
              )}
            </div>
          </div>

          <aside className="merchant-side">
            <section className="merchant-panel">
              <h2>保障信息上传通道</h2>
              <div className="upload-buttons">
                <button type="button">上传检疫证明</button>
                <button type="button">上传冷链照片</button>
                <button type="button">上传履约回执</button>
              </div>
            </section>

            <section className="merchant-panel">
              <h2>我的产品提供信息</h2>
              <div className="listing-form">
                <select value={listingProductId} onChange={(event) => setListingProductId(event.target.value)}>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  min="1"
                  type="number"
                  value={listingQuantity}
                  onChange={(event) => setListingQuantity(event.target.value)}
                  placeholder="可供数量"
                />
                <input
                  min="1"
                  type="number"
                  value={listingFloorPrice}
                  onChange={(event) => setListingFloorPrice(event.target.value)}
                  placeholder="底价"
                />
                <button onClick={handleCreateListing} type="button">
                  新增挂单
                </button>
                <span>{listingStatus}</span>
              </div>
              <div className="listing-list">
                {merchantListings.length > 0 ? (
                  merchantListings.map((listing) => (
                    <article className="listing-card" key={listing.id}>
                      <div>
                        <strong>{listing.product_id}</strong>
                        <span>{listing.origin_base}</span>
                      </div>
                      <p>可供 {listing.available_quantity} 件 · 底价 {formatCurrency(listing.floor_price)}</p>
                      <small>质量评分 {listing.quality_score}</small>
                    </article>
                  ))
                ) : (
                  <div className="empty-cart">后台暂未登记供货信息。</div>
                )}
              </div>
            </section>
          </aside>
        </section>
      </main>
    );
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
            <button className="merchant-entry" onClick={() => setLoginOpen(true)} type="button">
              商户入口
            </button>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">西北羊产业数字化供应链平台</p>
            <h1>
              <span>安心买</span>
              <span>西北好羊肉</span>
            </h1>
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

      {loginOpen && (
        <section className="login-overlay" aria-label="商户身份验证">
          <div className="login-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Merchant Login</p>
                <h2>商户身份验证</h2>
              </div>
              <button className="close-button" onClick={() => setLoginOpen(false)} type="button">
                ×
              </button>
            </div>
            <label className="field-label">
              账号
              <input value={merchantAccount} onChange={(event) => setMerchantAccount(event.target.value)} />
            </label>
            <label className="field-label">
              密码
              <input
                type="password"
                value={merchantPassword}
                onChange={(event) => setMerchantPassword(event.target.value)}
              />
            </label>
            <div className="submit-status idle">{merchantStatus}</div>
            <button className="checkout-button" onClick={handleMerchantLogin} type="button">
              验证并进入
            </button>
          </div>
        </section>
      )}

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
                <ProductPhoto product={product} />
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
        <div className="order-query-panel">
          <input
            value={orderQuery}
            onChange={(event) => setOrderQuery(event.target.value)}
            placeholder="输入订单号、客户名或商品名"
          />
          <button onClick={handleOrderQuery} type="button">
            查询订单
          </button>
          <span>{orderQueryStatus}</span>
        </div>
        {queriedOrders.length > 0 && (
          <div className="order-list">
            {queriedOrders.map((order) => (
              <article className="order-card" key={`query-${order.id}`}>
                <div>
                  <span>订单号</span>
                  <strong>{order.id}</strong>
                </div>
                <div>
                  <span>客户</span>
                  <strong>{order.customer_name}</strong>
                </div>
                <div>
                  <span>状态</span>
                  <strong>{order.status === "paid" ? "已确认" : "处理中"}</strong>
                </div>
                <div>
                  <span>金额</span>
                  <strong>{formatCurrency(order.total_amount || 0)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
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
