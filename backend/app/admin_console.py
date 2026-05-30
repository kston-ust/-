from __future__ import annotations


def build_admin_console_html() -> str:
    return """
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>西域羊都后端交互控制台</title>
    <style>
      :root {
        color: #203227;
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
        width: min(1180px, calc(100% - 32px));
        margin: 0 auto;
        padding: 28px 0 40px;
      }
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 18px;
      }
      h1,
      h2,
      h3,
      p {
        margin: 0;
      }
      h1 {
        font-size: clamp(26px, 4vw, 42px);
      }
      .subtitle {
        margin-top: 8px;
        color: #657568;
      }
      .status-pill {
        border: 1px solid #bfd6c7;
        border-radius: 999px;
        padding: 10px 14px;
        color: #1d684b;
        background: #e9f6ed;
        font-weight: 800;
        white-space: nowrap;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }
      .panel,
      .metric {
        border: 1px solid #dbe4d5;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 14px 34px rgba(43, 58, 45, 0.08);
      }
      .metric {
        padding: 16px;
      }
      .metric span {
        display: block;
        color: #657568;
        font-size: 13px;
        font-weight: 800;
      }
      .metric strong {
        display: block;
        margin-top: 8px;
        color: #183024;
        font-size: 28px;
      }
      .layout {
        display: grid;
        grid-template-columns: 380px 1fr;
        gap: 14px;
        margin-top: 14px;
      }
      .panel {
        padding: 18px;
      }
      .panel h2 {
        margin-bottom: 14px;
        font-size: 20px;
      }
      label {
        display: grid;
        gap: 7px;
        margin-bottom: 12px;
        color: #4f6155;
        font-weight: 800;
      }
      input,
      select {
        width: 100%;
        border: 1px solid #ced9c8;
        border-radius: 8px;
        padding: 11px 12px;
        color: #203227;
        background: #fbfdf8;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 112px;
        gap: 10px;
      }
      .actions {
        display: grid;
        grid-template-columns: 1fr 120px;
        gap: 10px;
        margin-top: 14px;
      }
      button {
        cursor: pointer;
        border: 0;
        border-radius: 8px;
        padding: 12px 14px;
        color: #fff;
        background: #28644f;
        font-weight: 900;
      }
      button.secondary {
        border: 1px solid #cfdac9;
        color: #385247;
        background: #fff;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .summary-item {
        border-radius: 8px;
        padding: 14px;
        background: #f4f8ef;
      }
      .summary-item span {
        color: #657568;
        font-size: 12px;
        font-weight: 800;
      }
      .summary-item strong {
        display: block;
        margin-top: 6px;
        color: #193126;
        font-size: 22px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
      }
      th,
      td {
        border-bottom: 1px solid #e5eadf;
        padding: 10px 8px;
        text-align: left;
      }
      th {
        color: #657568;
        font-size: 12px;
      }
      .log {
        min-height: 44px;
        margin-top: 14px;
        border-radius: 8px;
        padding: 11px 12px;
        color: #5a684f;
        background: #f4f8ef;
        line-height: 1.45;
      }
      @media (max-width: 860px) {
        .grid,
        .layout,
        .summary-grid {
          grid-template-columns: 1fr;
        }
        .topbar {
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
          <h1>后端交互控制台</h1>
          <p class="subtitle">直接操作 FastAPI 服务：查看订单、提交模拟订单、刷新汇总与变更状态。</p>
        </div>
        <div class="status-pill" id="service-status">服务检查中</div>
      </header>

      <section class="grid" aria-label="订单状态">
        <div class="metric">
          <span>已确认订单</span>
          <strong id="metric-orders">--</strong>
        </div>
        <div class="metric">
          <span>累计交易额</span>
          <strong id="metric-gmv">--</strong>
        </div>
        <div class="metric">
          <span>最新订单</span>
          <strong id="metric-latest">--</strong>
        </div>
        <div class="metric">
          <span>上次检查</span>
          <strong id="metric-checked">--</strong>
        </div>
      </section>

      <section class="layout">
        <form class="panel" id="order-form">
          <h2>提交模拟订单</h2>
          <label>
            采购方名称
            <input id="customer-name" minlength="2" value="后端控制台测试客户" required />
          </label>
          <label>
            采购场景
            <select id="customer-profile">
              <option value="C端小程序|家庭会员">家庭会员</option>
              <option value="社区团购|家庭会员">社区团购</option>
              <option value="B端集采|火锅连锁">餐饮集采</option>
              <option value="直播电商|家庭会员">直播福利</option>
            </select>
          </label>
          <div class="form-row">
            <label>
              商品
              <select id="product-select" required></select>
            </label>
            <label>
              数量
              <input id="quantity" type="number" min="1" max="999" value="1" required />
            </label>
          </div>
          <div class="actions">
            <button type="submit">提交到后端</button>
            <button class="secondary" id="refresh-button" type="button">刷新</button>
          </div>
          <div class="log" id="activity-log">控制台已就绪，正在读取后端数据。</div>
        </form>

        <section class="panel">
          <h2>实时汇总</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <span>热销商品</span>
              <strong id="top-product">--</strong>
            </div>
            <div class="summary-item">
              <span>平均送达</span>
              <strong id="delivery-hours">--</strong>
            </div>
            <div class="summary-item">
              <span>冷链合格率</span>
              <strong id="temperature-rate">--</strong>
            </div>
            <div class="summary-item">
              <span>数据版本</span>
              <strong id="data-version">--</strong>
            </div>
          </div>
          <h3 style="margin-top: 18px;">最近订单</h3>
          <table>
            <thead>
              <tr>
                <th>订单号</th>
                <th>客户</th>
                <th>金额</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody id="orders-body"></tbody>
          </table>
        </section>
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

      async function requestJson(path, options) {
        const response = await fetch(path, options);
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

      function renderProducts() {
        const select = document.getElementById("product-select");
        select.innerHTML = state.products
          .map((product) => `<option value="${product.id}">${product.name} / ${money.format(product.price)}</option>`)
          .join("");
      }

      function renderDashboard() {
        const latestOrder = state.changeState?.latest_order_id || "--";
        document.getElementById("service-status").textContent = "后端服务运行中";
        document.getElementById("metric-orders").textContent = state.changeState?.order_count ?? "--";
        document.getElementById("metric-gmv").textContent = money.format(state.changeState?.total_gmv || 0);
        document.getElementById("metric-latest").textContent = latestOrder;
        document.getElementById("metric-checked").textContent = new Date().toLocaleTimeString("zh-CN", { hour12: false });
        document.getElementById("top-product").textContent = state.summary?.trade?.top_product?.name || "--";
        document.getElementById("delivery-hours").textContent = `${state.summary?.fulfillment?.average_delivery_hours ?? "--"}h`;
        document.getElementById("temperature-rate").textContent = percent(state.summary?.fulfillment?.temperature_pass_rate || 0);
        document.getElementById("data-version").textContent = state.changeState?.version || "--";
        document.getElementById("orders-body").innerHTML = state.orders
          .slice(0, 8)
          .map(
            (order) => `<tr>
              <td>${order.id}</td>
              <td>${order.customer_name}</td>
              <td>${money.format(order.total_amount)}</td>
              <td>${order.status === "paid" ? "已确认" : "处理中"}</td>
            </tr>`,
          )
          .join("");
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
        renderProducts();
        renderDashboard();
      }

      async function refreshState() {
        try {
          const nextState = await requestJson("/api/change-state");
          if (!state.changeState || state.changeState.version !== nextState.version) {
            await loadDashboard();
            writeLog("检测到订单数据变化，控制台已自动刷新。");
            return;
          }
          state.changeState = nextState;
          renderDashboard();
        } catch (error) {
          document.getElementById("service-status").textContent = "服务连接异常";
          writeLog(`自动检查失败：${error.message}`);
        }
      }

      async function submitOrder(event) {
        event.preventDefault();
        const [channel, customerType] = document.getElementById("customer-profile").value.split("|");
        const payload = {
          customer_name: document.getElementById("customer-name").value.trim(),
          channel,
          customer_type: customerType,
          items: [
            {
              product_id: document.getElementById("product-select").value,
              quantity: Number(document.getElementById("quantity").value),
            },
          ],
        };
        writeLog("正在提交订单到后端服务...");
        const order = await requestJson("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await loadDashboard();
        writeLog(`订单 ${order.id} 已写入后端，金额 ${money.format(order.total_amount)}。`);
      }

      document.getElementById("order-form").addEventListener("submit", submitOrder);
      document.getElementById("refresh-button").addEventListener("click", async () => {
        await loadDashboard();
        writeLog("已手动刷新后端数据。");
      });

      loadDashboard()
        .then(() => writeLog("后端数据加载完成，可以提交订单或等待自动刷新。"))
        .catch((error) => {
          document.getElementById("service-status").textContent = "服务连接异常";
          writeLog(`加载失败：${error.message}`);
        });
      setInterval(refreshState, 5000);
    </script>
  </body>
</html>
"""
