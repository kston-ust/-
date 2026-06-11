# 西域羊都网上交易程序

基于《西域羊都：西北羊产业数字化供应链平台》方案文档生成的前后端样例项目。

## 项目内容

- 前端：React + Vite 电商商城界面，默认是消费者页面，提供商品浏览、购物车下单、保障承诺和订单查询；顶部“商户入口”完成账号密码验证后进入商户页面。
- 商户页面：展示后台分配来的需求任务、任务查询、保障信息上传按钮、本商户供货信息和新增挂单入口；消费者与商户工作区互不混用。
- 后端：FastAPI + SQLite 接口，包含商品、订单、溯源、商户认证、商户管理、商户挂单、订单分配、综合经营汇总、订单趋势分析和运营数据中心。
- 后端运营数据中心：访问 `http://localhost:8000/admin` 或 `http://localhost:8000/`，用于查看订单监控、分配状态、商户管理、单单分配、批量分配、履约监控、商品库存、销量和趋势分析；订单创建入口属于前端商城。
- 汇总模块：归纳已支付订单、热销商品、履约质量、金融服务、养殖户增收、分配状态和订单趋势等数据，用于支撑页面展示和管理分析。
- 自动刷新：后端提供订单数据版本，前端和后端运营数据中心每 5 秒轻量检查一次；发现订单或金额变化后自动刷新页面信息。
- 代码结构：代码分别存放在 `frontend/` 与 `backend/`，前端只做客户商城交互，后端只做 API、数据、运营后台和业务计算。
- 供应链闭环：后端保留农户挂单、交易撮合和 JIT 排产接口，平台后台负责把消费者订单分配给商户，商户页查看自己的需求任务和供货信息。

## 代码结构与职责边界

| 子文件夹 | 运行栈 | 主要职责 | 入口 |
| --- | --- | --- | --- |
| `frontend/` | React + Vite | 消费者商城、商品浏览、购物车下单、订单查询、商户入口、商户任务页、商户挂单 | `frontend/src/App.jsx`、`http://localhost:5173` |
| `backend/` | FastAPI + SQLite | 商品与订单 API、商户认证、商户管理、商户挂单、订单分配、经营汇总、趋势分析、运营数据中心 | `backend/app/main.py`、`http://localhost:8000/admin` |

前端不直接写数据库；所有订单创建都通过 `POST /api/orders` 提交给后端。商户登录由后端商户信息校验，任务由后台分配生成。后端运营数据中心承担平台工作人员的分配和管理操作，不承担客户下单入口。

## 目录

```text
backend/
  app/
    admin_console.py  后端运营数据中心页面
    main.py           FastAPI 入口与 API 路由
    database.py       SQLite 初始化、种子数据、查询、下单、商户管理、分配与变更状态
    summary.py        综合经营数据汇总与版本号算法
    supply_chain.py   农户挂单、交易撮合与订单即排产算法
  tests/
    test_admin_console.py
    test_database.py
    test_summary.py
    test_supply_chain.py
frontend/
  src/
    App.jsx           消费者商城、购物车、下单、订单查询、商户登录和商户任务页
    api.js            后端业务接口访问与离线备用数据
    summary.js        前端购物车、订单查询、商户任务和刷新判断
  tests/
    summary.test.mjs
```

## 运行

推荐直接运行一键启动程序：

```powershell
cd "E:\数媒，羊\xiyu-yangdu-trading-work-20260530-164320"
.\启动前后端.ps1
```

也可以双击 `启动前后端.bat`。程序会自动启动后端和前端，等待服务就绪，并在窗口里显示前端商城、后端后台和接口链接。

后端：

```powershell
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

后端运营数据中心：

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

演示商户账号：

```text
hht / 123456
xijing / 123456
tumen / 123456
```

## API

- `GET /`：后端运营数据中心
- `GET /admin`：后端运营数据中心
- `GET /api/health`：服务健康检查
- `GET /api/products`：商品列表
- `GET /api/orders`：订单列表，包含分配状态
- `GET /api/customer/orders`：消费者订单查询
- `POST /api/orders`：前端提交订单，后端计算商品明细和订单金额
- `POST /api/merchant/login`：商户入口账号密码验证
- `GET /api/merchant/{merchant_id}/tasks`：商户任务列表
- `GET /api/merchant/{merchant_id}/listings`：商户自己的供货挂单
- `POST /api/merchant/{merchant_id}/listings`：商户新增供货挂单
- `GET /api/merchants`：后台商户列表
- `POST /api/merchants`：后台新增商户
- `DELETE /api/merchants/{merchant_id}`：后台删除商户
- `POST /api/orders/{order_id}/assign`：后台单独分配某笔订单
- `POST /api/orders/assign-batch`：后台批量分配已确认未分配订单
- `GET /api/order-analysis`：订单分配、趋势和商品销量分析
- `GET /api/summary`：综合经营归纳数据
- `GET /api/change-state`：订单变更状态，供页面自动判断是否需要刷新
- `GET /api/supply-listings`：农户在线挂单数据
- `GET /api/supply-matches`：已支付订单与农户挂单的撮合、动态收购价和 JIT 排产结果
- `GET /api/trace/{product_id}`：商品溯源节点

## 交互场景

1. 顾客在前端选择商品并加入购物车。
2. 顾客选择采购场景，填写采购方名称。
3. 顾客调整数量并提交订单。
4. 后端接收订单，按商品价格计算订单金额，写入订单和明细。
5. 平台工作人员在后端运营数据中心查看分配状态，可单独处理某笔订单，也可批量分配订单给商户。
6. 商户从前端“商户入口”登录后，查看后台分配来的需求任务、任务查询、供货信息并新增挂单。
7. 消费者页面提交成功后立即刷新商品、保障和订单状态数据，不展示后台工程或商户分配细节。
8. 页面每 5 秒检查一次订单状态版本；如果订单数据变化，页面会自动刷新。

## 测试

```powershell
cd backend
python -m unittest discover -s tests

cd ../frontend
npm test
npm run build
```
