# Wish Creator

一个可直接运行、方便继续演进的全栈 AI Application 基线。当前业务用 TODO CRUD 占位；以后可以替换领域模块，而无需重新搭建前后端、数据库迁移、测试和容器部署链路。

## 技术栈

- 前端：React 19 + TypeScript 6 + Vite 8
- 后端：Java 21 + Spring Boot 3.5 + Spring Data JPA
- 数据库：PostgreSQL 17 + Flyway
- 部署：Docker + Docker Compose + Nginx
- 测试：Vitest / Testing Library + JUnit / Testcontainers

## 一键启动

只需要安装 Docker Desktop：

```bash
cp .env.example .env
docker compose up --build
```

启动完成后访问：

- Web App: <http://localhost:3000>
- Backend health: <http://localhost:8080/actuator/health>
- PostgreSQL: `localhost:5432`

停止服务：

```bash
docker compose down
```

数据库数据保存在 `postgres-data` volume 中。需要连数据一起清空时，明确执行 `docker compose down -v`。

## 本地开发

### 前端

需要 Node.js 24：

```bash
cd frontend
npm ci
npm run dev
```

Vite 会把 `/api` 请求代理到 `http://localhost:8080`。

### 原型工作台

新增或修改用户可观察功能前，先启动配套原型工作台：

```bash
cd frontend
npm run prototype
```

工作台位于 <http://localhost:5173/prototype>，具体更新顺序和目录约定见 [`docs/prototype-workflow.md`](docs/prototype-workflow.md)。当前工作台保持空状态，等待具体功能需求明确后再登记原型，不预设产品行为。

### 后端

需要 Java 21；先单独启动数据库：

```bash
docker compose up database -d
cd backend
./mvnw spring-boot:run
```

后端已接入 Spring Boot DevTools。IDE 自动编译，或在另一个终端执行 `cd backend && ./mvnw compile` 后，DevTools 会检测 classpath 变化并自动重启应用；仅保存 `.java` 文件但没有生成新的 `.class` 文件不会触发重启。

数据库结构由 `backend/src/main/resources/db/migration` 下的 Flyway migration 管理。不要依赖 Hibernate 自动改表，新增字段时应增加新的 migration。

## 测试与质量检查

```bash
make test
```

也可以分开执行：

```bash
cd backend && ./mvnw verify
cd frontend && npm test && npm run build && npm run lint
```

后端集成测试会通过 Testcontainers 启动真实 PostgreSQL，因此运行测试时 Docker 必须可用。GitHub Actions 会在 push 和 pull request 时执行同样的检查。

## REST API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/todos` | 获取全部 TODO，按创建时间倒序 |
| `GET` | `/api/todos/{id}` | 获取单个 TODO |
| `POST` | `/api/todos` | 创建 TODO |
| `PUT` | `/api/todos/{id}` | 更新标题和完成状态 |
| `DELETE` | `/api/todos/{id}` | 删除 TODO |

创建请求：

```json
{ "title": "Design the first AI workflow" }
```

更新请求：

```json
{ "title": "Ship the first AI workflow", "completed": true }
```

## 工程结构

```text
.
├── backend/                 # Spring Boot API 与 Flyway migrations
├── frontend/                # React SPA、测试与开发原型工作台
├── docs/                    # 产品、开发与原型工作流规范
├── .github/workflows/ci.yml # 持续集成
├── compose.yml              # 完整本地/单机部署编排
└── Makefile                 # 常用开发命令
```

下一阶段接入真实 AI 需求时，建议按业务能力在后端增加独立 package，在前端增加对应 feature 目录；TODO 模块届时可以作为示例删除，不必把所有未来逻辑继续塞进它。
