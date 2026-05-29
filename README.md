# 西域羊都网上交易程序

基于《西域羊都：西北羊产业数字化供应链平台》方案文档生成的前后端样例项目。

## 项目内容

- 前端：React + Vite 电商商城界面，包含商品交易、购物车、在线下单、订单流、数字溯源标签和经营总览。
- 后端：FastAPI + SQLite 接口，包含商品、订单、溯源和综合经营汇总模块。
- 汇总模块：归纳 GMV、订单数、客单价、热销商品、渠道收入、冷链履约、金融撮合、农户增收等指标。

## 目录

```text
backend/
  app/
    main.py        FastAPI 入口与 API 路由
    database.py    SQLite 初始化、种子数据、查询与下单
    summary.py     综合经营数据汇总算法
  tests/
    test_summary.py
frontend/
  src/
    App.jsx        商城界面与经营驾驶舱
    api.js         后端接口访问与离线备用数据
    summary.js     前端购物车与展示计算
  tests/
    summary.test.mjs
```

## 运行

后端：

```powershell
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

前端：

```powershell
cd frontend
npm install
npm run dev
```

访问 `http://localhost:5173` 查看商城界面。前端会优先请求 `http://localhost:8000/api`，后端未启动时会使用内置展示数据。

## API

- `GET /api/products`：商品列表
- `GET /api/orders`：订单列表
- `POST /api/orders`：提交样例订单
- `GET /api/summary`：综合经营归纳数据
- `GET /api/trace/{product_id}`：商品溯源节点

## 交互场景

1. 在前端选择商品并加入交易单。
2. 修改客户名称、渠道和客户类型。
3. 使用数量加减控件调整订单明细。
4. 点击“提交订单并刷新数据”。
5. 前端调用后端 `POST /api/orders` 创建订单，再重新拉取 `/api/orders` 与 `/api/summary`。
6. 页面上的 GMV、订单数、渠道收入和后端订单流随订单变化。

## 测试

不依赖第三方包的核心测试：

```powershell
cd backend
python -m unittest discover -s tests

cd ../frontend
node --test tests/summary.test.mjs
```
