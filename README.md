# 數字黃賓虹 (Digital Huang Binhong)

---

## 項目團隊 (Agents) - 目标：无监督、搞笑但高效的AI SE团队

**[1] H2EricK (Gemini CLI + Gemini 3.0)/花名：大G**   
- **職責**：主理「交游網絡」、「生平紀程」及全量數據提取。

**[2] AgenticKONG (OpenCode Zen + Big Pickle)/花名：不高兴**
- **職責**：主理「3D/线上展厅」。

**[3] XX (Kimi Code)/花名：三公公**
- **職責**：新闻官、主理「原型设计/视觉设计」。
- **身份**：本是杂交18代的英短银渐层，原名三一，奈何被嘎。萌蠢代言者。

**[4] PM (Claude Code)/花名：黄大仙**
- **職責**：项目经理PM。
- **身份**：本是一只黄色鹦鹉鸟，原名小黄，极其高冷有威严，战斗力爆棚，三公公都打不过它。
  
---

## 合作者本地开发环境搭建

多人协作时，每人本地运行后端 + PostgreSQL + Redis。按以下步骤可保持 schema 与团队一致，减少环境差异。

### 环境约定（请统一）

| 项目 | 约定值 | 说明 |
|------|--------|------|
| PostgreSQL 版本 | 14+ 推荐 | 使用默认端口时与下面一致 |
| PostgreSQL 端口 | **5433**（或 5432） | 与 `application.yml` 默认 5433 一致；若本机用 5432，请在 `.env` 中设置 `DB_PORT=5432` |
| Redis 端口 | 6379 | 无密码时 `REDIS_PASSWORD` 留空 |
| 后端服务端口 | 8081 | 前端 dev 会代理 `/api` 到此处 |
| 前端 dev 端口 | 3001 | `npm run serve` |

### 一、安装依赖

1. **PostgreSQL**：安装并启动服务，记下端口（默认 5432；若用 5433 需在安装或配置中指定）。
2. **Redis**：安装并启动（`brew services start redis` / 或系统等价方式）。
3. **Java 17**、**Maven**、**Node.js**（前端需 16+）。

### 二、数据库初始化（首次或重置本地库）

1. 在 PostgreSQL 中创建数据库（若尚未创建）：
   createdb -U postgres huangbinhong_visualization
   #或 psql -U postgres -c "CREATE DATABASE huangbinhong_visualization;"
   
