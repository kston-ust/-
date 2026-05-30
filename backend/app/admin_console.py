from __future__ import annotations


def build_admin_console_html() -> str:
    return """
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>西域羊都运营数据中心</title>
    <style>
      :root {
        color: #213329;
        background: #f5f7f0;
        font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
      }
      button,
      input,
      select {
        font: inherit;
      }
      .shell {
        width: min(1240px, calc(100% - 32px));
        margin: 0 auto;
        padding: 26px 0 42px;
      }
      .topbar {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 18px;
      }
      h1,
      h2,
      h3,
      p {
        margin: 0;
      }
      h1 {
        color: #12271d;
        font-size: clamp(26px, 4vw, 40px);
        letter-spacing: 0;
      }
      .subtitle {
        max-width: 760px;
        margin-top: 8px;
        color: #66756a;
        line-height: 1.6;
      }
      .toolbar {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .service-pill,
      button {
        border-radius: 8px;
        padding: 11px 14px;
        font-weight: 900;
      }
      .service-pill {
        border: 1px solid #bdd6c7;
        color: #1c674b;
        background: #e8f6ed;
        white-space: nowrap;
      }
      button {
        cursor: pointer;
        border: 0;
        color: #fff;
        background: #28644f;
      }
      button.secondary {
        border: 1px solid #cfdac9;
        color: #385247;
        background: #fff;
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }
      .metric,
      .panel {
        border: 1px solid #dbe4d5;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 12px 30px rgba(43, 58, 45, 0.08);
      }
      .metric {
        padding: 16px;
      }
      .metric span,
      .label {
        display: block;
        color: #66756a;
        font-size: 12px;
        font-weight: 900;
      }
      .metric strong {
        display: block;
        margin-top: 8px;
        color: #173024;
        font-size: 26px;
      }
      .main-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(340px, 0.75fr);
        gap: 14px;
        margin-top: 14px;
      }
      .panel {
        padding: 18px;
      }
      .panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }
      .panel h2 {
        font-size: 20px;
      }
      .filters {
        display: grid;
        grid-template-columns: 1fr 150px;
        gap: 10px;
        margin-bottom: 12px;
      }
      input,
      select {
        width: 100%;
        border: 1px solid #ced9c8;
        border-radius: 8px;
        padding: 10px 12px;
        color: #203227;
        background: #fbfdf8;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        border-bottom: 1px solid #e5eadf;
        padding: 10px 8px;
        text-align: left;
        vertical-align: top;
      }
      th {
        color: #66756a;
        font-size: 12px;
      }
      .status-paid {
        color: #176446;
        font-weight: 900;
      }
      .side-stack {
        display: grid;
        gap: 14px;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .summary-item,
      .attention-item {
        border-radius: 8px;
        padding: 13px;
        background: #f4f8ef;
      }
      .summary-item strong,
      .attention-item strong {
        display: block;
        margin-top: 6px;
        color: #193126;
        font-size: 21px;
      }
      .attention-list {
        display: grid;
        gap: 10px;
      }
      .product-list {
        display: grid;
        gap: 10px;
      }
      .product-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: center;
        border-radius: 8px;
        padding: 12px;
        background: #f8fbf5;
      }
      .product-row b {
        display: block;
        color: #193126;
      }
      .product-row span {
        color: #66756a;
        font-size: 12px;
      }
      .mix-row {
        display: grid;
        grid-template-columns: 92px 1fr 58px;
        gap: 8px;
        align-items: center;
        margin-top: 10px;
      }
      .bar {
        height: 9px;
        overflow: hidden;
        border-radius: 999px;
        background: #e5eadf;
      }
      .bar i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: #2f735a;
      }
      .log {
        margin-top: 14px;
        border-radius: 8px;
        padding: 11px 12px;
        color: #5a684f;
        background: #f4f8ef;
        line-height: 1.45;
      }
      @media (max-width: 940px) {
        .metrics-grid,
        .main-grid,
        .summary-grid,
        .filters {
          grid-template-columns: 1fr;
        }
        .topbar,
        .panel-head {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <header class="topbar">
        <div>
          <h1>运营数据中心</h1>
          <p class="subtitle">后台用于查看真实订单流、履约质量、商品库存和数据同步状态；下单入口保留在前端商城。</p>
        </div>
        <div class="toolbar">
          <div class="service-pill" id="service-status">服务检查中</div>
          <button class="secondary" id="refresh-button" type="button">刷新数据</button>
        </div>
      </header>

      <section class="metrics-grid" aria-label="运营总览">
        <div class="metric">
          <span>已确认订单</span>
          <strong id="metric-orders">--</strong>
        </div>
        <div class="metric">
          <span>累计交易额</span>
          <strong id="metric-gmv">--</strong>
        </div>
        <div class="metric">
          <span>平均客单价</span>
          <strong id="metric-aov">--</strong>
        </div>
        <div class="metric">
          <span>上次同步</span>
          <strong id="metric-checked">--</strong>
        </div>
      </section>

      <section class="main-grid">
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>订单监控</h2>
              <p class="subtitle">按客户、订单号或来源筛选，观察前端订单是否被后端接收并归档。</p>
            </div>
          </div>
          <div class="filters">
            <input id="order-keyword" placeholder="筛选订单号、客户或渠道" />
            <select id="status-filter">
              <option value="all">全部状态</option>
              <option value="paid">已确认</option>
              <option value="pending">处理中</option>
            </select>
          </div>
          <table>
            <thead>
              <tr>
                <th>订单号</th>
                <th>客户</th>
                <th>来源</th>
                <th>金额</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody id="orders-body"></tbody>
          </table>
          <div class="log" id="activity-log">正在读取后端数据。</div>
        </section>

        <div class="side-stack">
          <section class="panel">
            <div class="panel-head">
              <h2>履约监控</h2>
            </div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">平均送达</span>
                <strong id="delivery-hours">--</strong>
              </div>
              <div class="summary-item">
                <span class="label">冷链合格率</span>
                <strong id="temperature-rate">--</strong>
              </div>
              <div class="summary-item">
                <span class="label">平均损耗率</span>
                <strong id="loss-rate">--</strong>
              </div>
              <div class="summary-item">
                <span class="label">数据版本</span>
                <strong id="data-version">--</strong>
              </div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2>商品库存</h2>
            </div>
            <div class="product-list" id="product-list"></div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2>渠道与客户结构</h2>
            </div>
            <div id="channel-mix"></div>
            <div id="customer-mix" style="margin-top: 14px;"></div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2>运营关注</h2>
            </div>
            <div class="attention-list">
              <div class="attention-item">
                <span class="label">热销商品</span>
                <strong id="top-product">--</strong>
              </div>
              <div class="attention-item">
                <span class="label">最新订单</span>
                <strong id="latest-order">--</strong>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>

    <script>
      const state = {
        products: [],
        orders: [],
        summary: null,
        changeState: null,
      };
      const money = new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "CNY",
        maximumFractionDigits: 0,
      });

      async function requestJson(path) {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return response.json();
      }

      function writeLog(message) {
        document.getElementById("activity-log").textContent = message;
      }

      function percent(value) {
        return `${(Number(value) * 100).toFixed(Number(value) < 0.1 ? 1 : 0)}%`;
      }

      function normalizeText(value) {
        return String(value || "").toLowerCase();
      }

      function filterOrders() {
        const keyword = normalizeText(document.getElementById("order-keyword").value);
        const status = document.getElementById("status-filter").value;
        return state.orders.filter((order) => {
          const text = normalizeText(`${order.id} ${order.customer_name} ${order.channel}`);
          const matchesKeyword = !keyword || text.includes(keyword);
          const matchesStatus = status === "all" || order.status === status;
          return matchesKeyword && matchesStatus;
        });
      }

      function renderOrders() {
        const rows = filterOrders()
          .slice(0, 12)
          .map(
            (order) => `<tr>
              <td>${order.id}</td>
              <td>${order.customer_name}</td>
              <td>${order.channel}</td>
              <td>${money.format(order.total_amount)}</td>
              <td class="${order.status === "paid" ? "status-paid" : ""}">${order.status === "paid" ? "已确认" : "处理中"}</td>
            </tr>`,
          )
          .join("");
        document.getElementById("orders-body").innerHTML = rows || `<tr><td colspan="5">暂无匹配订单</td></tr>`;
      }

      function renderProducts() {
        const items = [...state.products]
          .sort((left, right) => right.monthly_sales - left.monthly_sales)
          .map(
            (product) => `<div class="product-row">
              <div>
                <b>${product.name}</b>
                <span>${product.category} / 库存 ${product.stock} / 月销 ${product.monthly_sales}</span>
              </div>
              <strong>${money.format(product.price)}</strong>
            </div>`,
          )
          .join("");
        document.getElementById("product-list").innerHTML = items;
      }

      function renderMix(containerId, title, records) {
        const entries = Object.entries(records || {});
        const maxValue = Math.max(...entries.map(([, value]) => Number(value)), 1);
        document.getElementById(containerId).innerHTML =
          `<span class="label">${title}</span>` +
          entries
            .map(
              ([name, value]) => `<div class="mix-row">
                <span>${name}</span>
                <div class="bar"><i style="width: ${(Number(value) / maxValue) * 100}%"></i></div>
                <strong>${value}</strong>
              </div>`,
            )
            .join("");
      }

      function renderDashboard() {
        document.getElementById("service-status").textContent = "后端服务运行中";
        document.getElementById("metric-orders").textContent = state.changeState?.order_count ?? "--";
        document.getElementById("metric-gmv").textContent = money.format(state.changeState?.total_gmv || 0);
        document.getElementById("metric-aov").textContent = money.format(state.summary?.trade?.average_order_value || 0);
        document.getElementById("metric-checked").textContent = new Date().toLocaleTimeString("zh-CN", { hour12: false });
        document.getElementById("delivery-hours").textContent = `${state.summary?.fulfillment?.average_delivery_hours ?? "--"}h`;
        document.getElementById("temperature-rate").textContent = percent(state.summary?.fulfillment?.temperature_pass_rate || 0);
        document.getElementById("loss-rate").textContent = percent(state.summary?.fulfillment?.average_loss_rate || 0);
        document.getElementById("data-version").textContent = state.changeState?.version || "--";
        document.getElementById("top-product").textContent = state.summary?.trade?.top_product?.name || "--";
        document.getElementById("latest-order").textContent = state.changeState?.latest_order_id || "--";
        renderOrders();
        renderProducts();
        renderMix("channel-mix", "来源交易额", state.summary?.trade?.channel_revenue);
        renderMix("customer-mix", "客户类型", state.summary?.trade?.customer_mix);
      }

      async function loadDashboard() {
        const [products, summary, orders, changeState] = await Promise.all([
          requestJson("/api/products"),
          requestJson("/api/summary"),
          requestJson("/api/orders"),
          requestJson("/api/change-state"),
        ]);
        state.products = products;
        state.summary = summary;
        state.orders = orders;
        state.changeState = changeState;
        renderDashboard();
      }

      async function refreshState() {
        try {
          const nextState = await requestJson("/api/change-state");
          if (!state.changeState || state.changeState.version !== nextState.version) {
            await loadDashboard();
            writeLog("检测到前端订单变化，后台数据已自动刷新。");
            return;
          }
          state.changeState = nextState;
          renderDashboard();
        } catch (error) {
          document.getElementById("service-status").textContent = "服务连接异常";
          writeLog(`自动检查失败：${error.message}`);
        }
      }

      document.getElementById("refresh-button").addEventListener("click", async () => {
        await loadDashboard();
        writeLog("已手动刷新后台数据。");
      });
      document.getElementById("order-keyword").addEventListener("input", renderOrders);
      document.getElementById("status-filter").addEventListener("change", renderOrders);

      loadDashboard()
        .then(() => writeLog("后台数据加载完成，等待前端订单变化。"))
        .catch((error) => {
          document.getElementById("service-status").textContent = "服务连接异常";
          writeLog(`加载失败：${error.message}`);
        });
      setInterval(refreshState, 5000);
    </script>
  </body>
</html>
"""
