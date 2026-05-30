# 西域羊都网上交易程序

基于《西域羊都：西北羊产业数字化供应链平台》方案文档生成的前后端样例项目。

## 项目内容

- 前端：React + Vite 电商商城界面，面向顾客展示商品、价格、产地、溯源、冷链保障、购物车和订单确认。
- 后端：FastAPI + SQLite 接口，包含商品、订单、溯源、综合经营汇总、订单变更状态和交互式控制台。
- 后端控制台：访问 `http://localhost:8000/admin` 或 `http://localhost:8000/`，可直接查看订单、提交模拟订单、手动刷新、等待自动刷新，不再只是读取接口文档。
- 汇总模块：归纳已支付订单、热销商品、履约质量、金融服务和养殖户增收等数据，用于支撑页面展示和管理分析。
- 自动刷新：后端提供订单数据版本，前端和后端控制台每 5 秒轻量检查一次；发现新订单或金额变化后自动刷新页面信息。

## 目录

```text
backend/
  app/
    admin_console.py  后端交互控制台页面
    main.py           FastAPI 入口与 API 路由
    database.py       SQLite 初始化、种子数据、查询、下单与变更状态
    summary.py        综合经营数据汇总与版本号算法
  tests/
    test_admin_console.py
    test_database.py
    test_summary.py
frontend/
  src/
    App.jsx           商城界面、购物车、下单和自动刷新
    api.js            后端接口访问与离线备用数据
    summary.js        前端购物车、展示和刷新判断
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

后端交互控制台：

```text
http://localhost:8000/admin
```

前端：

```powershell
cd frontend
npm install
npm run dev
```

访问 `http://localhost:5173` 查看商城界面。前端会优先请求 `http://localhost:8000/api`，后端未启动时会使用内置展示数据。

## API

- `GET /`：后端交互控制台
- `GET /admin`：后端交互控制台
- `GET /api/health`：服务健康检查
- `GET /api/products`：商品列表
- `GET /api/orders`：订单列表
- `POST /api/orders`：提交订单，后端计算商品明细和订单金额
- `GET /api/summary`：综合经营归纳数据
- `GET /api/change-state`：订单变更状态，供页面自动判断是否需要刷新
- `GET /api/trace/{product_id}`：商品溯源节点

## 交互场景

1. 顾客在前端选择商品并加入购物车。
2. 顾客选择采购场景，填写采购方名称。
3. 顾客调整数量并提交订单。
4. 后端接收订单，按商品价格计算订单金额，写入订单和明细。
5. 前端提交成功后立即刷新商品和保障数据。
6. 后端控制台也可以直接提交模拟订单，并查看最近订单与实时汇总。
7. 页面每 5 秒检查一次订单状态版本；如果其他订单导致数据变化，页面会自动刷新。

## 测试

```powershell
cd backend
python -m unittest discover -s tests

cd ../frontend
npm test
npm run build
```
