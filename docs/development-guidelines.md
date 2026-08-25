# 开发规范

本规范面向参与 wish-creator 开发的 Coding Agent。

## 技术基线

- 前端：React 19、TypeScript 6、Vite 8，位于 `frontend/`
- 后端：Java 21、Spring Boot 3.5、Spring Data JPA，位于 `backend/`
- 数据库：PostgreSQL 17，结构变更由 Flyway 管理
- 测试：Vitest、Testing Library、JUnit、Testcontainers
- 本地部署：Docker、Docker Compose、Nginx

运行方式和环境要求以根目录 [`README.md`](../README.md) 为准。

## 开始实现前

1. 检查相关代码、测试、类型、依赖和配置，确认当前行为。
2. 明确用户可观察的行为、公共测试边界（seam）和验收示例。
3. 若测试边界的不同选择会明显影响产品行为、架构或实施成本，请求用户确认；否则说明假设后继续。
4. 涉及产品概念或业务边界时，先读取 [`product-guidelines.md`](product-guidelines.md)。核心语义未明确前，不要过早展开接口、状态机、兼容方案和异常分支。

## 测试驱动开发

所有功能与缺陷修复默认按垂直切片执行红—绿—重构循环：

1. 先写一个通过公共接口验证行为、且会因缺少目标行为而失败的测试。
2. 实现刚好让该测试通过的最小代码。
3. 在测试保护下改善结构，再继续下一个行为。

测试应遵循以下边界：

- 测试公共行为，不依赖私有实现细节。
- 仅在外部 API、时间、随机性等系统边界使用 mock。
- 前端优先验证用户可见的交互和结果。
- 后端按风险选择领域单元测试，或经过 HTTP/API 并使用真实测试数据库的集成测试。
- 修复缺陷时，先增加能够复现缺陷的回归测试。

## 数据库结构变更

Flyway migration 是按版本纳入 Git 的数据库变更脚本。应用启动或测试时，Flyway 会按版本顺序执行尚未运行的脚本，使不同环境得到一致的数据库结构。

本项目的脚本位于 `backend/src/main/resources/db/migration/`，例如 `V1__create_todos.sql`。修改表、字段、索引或约束时：

1. 新增下一个版本的 migration，例如 `V2__add_wish_status.sql`。
2. 不修改已经在其他环境执行过的旧 migration。
3. 不依赖 Hibernate 自动修改数据库结构。
4. 为受影响的持久化行为补充或更新测试。

## 示例模块与业务边界

当前 TODO CRUD 是可运行基线中的占位示例，不代表许愿池的产品领域，也不限制代码中的普通 `TODO:` 注释。

在真实产品边界尚未确认前，可以保留和维护该示例；新增愿望、对话、生成、作品、预览或发布能力时，应先建立对应的业务边界，不要因为现有 TODO 模块方便就默认把真实业务耦合进去。

## 完成与质量检查

完成一个功能后，按以下顺序闭环：

1. 执行受影响的测试。
2. 读取并应用 [`.agents/skills/wish-creator-code-quality-review/SKILL.md`](../.agents/skills/wish-creator-code-quality-review/SKILL.md)。先用 `git status --short` 确认变更范围，再审查未暂存变更、已暂存变更和新增未跟踪文件，避免只看 `git diff` 而漏掉新文件。
3. 修复审查中确认的问题。
4. 重新执行受影响的测试。
5. 在根目录执行 `make test`，完成前后端测试、构建和 lint。

`make test` 的后端集成测试使用 Testcontainers，因此 Docker 必须可用。若环境条件导致无法执行，应明确说明未执行的检查、原因和风险，不得描述为已经通过。

纯文档改动不要求运行与内容无关的全量测试，但应检查链接、命令和描述是否与仓库现状一致。
