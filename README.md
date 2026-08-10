# ProcureFlow Frontend

ProcureFlow V1 企业采购审批平台前端。包含多租户登录、权限导航、工作台、采购申请、固定三级审批、组织管理和审计日志。默认开启内置演示模式，无需后端即可演示核心流程；关闭演示模式后严格消费共享 API 契约。

## 本地运行

要求 Node.js 22 LTS。

```bash
cp .env.example .env
npm install
npm run dev
```

访问 `http://localhost:5173`。演示租户为 `acme`，账号可使用 `admin`、`alice`、`manager`、`finance1`、`owner` 或 `auditor`，密码填写任意非空值。切换账号可分别演示申请人、三级审批人和审计角色。

## 接入后端

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_DEMO_MODE=false
```

前端使用 `Authorization: Bearer <opaque-session-token>`，所有业务请求位于 `/api/v1/tenants/:tenantId`。写操作按契约携带 `Idempotency-Key`，金额使用整数分传输。收到 `UNAUTHENTICATED` 时清理本地会话。

## 质量命令

```bash
npm run build
npm run lint
npm test
```

## Docker

```bash
docker build -t procureflow-frontend .
docker run --rm -p 8080:80 procureflow-frontend
```

演示模式仅用于本地开发和产品验收，生产构建必须设置 `VITE_DEMO_MODE=false`。Session 存储在 `sessionStorage`，关闭标签页后清除；前端权限隐藏不替代后端授权。
