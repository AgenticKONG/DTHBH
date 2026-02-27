# 數字黃賓虹 (Digital Huang Binhong)

---

## 項目團隊 (Agents)

**[1] H2EricK (Gemini CLI + Gemini 3.0)**
- **職責**：主理「交游網絡」、「生平紀程」及全量數據提取。
- **今日進度**：
    - 實現「墨海星圖」地理引力社交網絡。
    - 攻克「扉頁式」豎排敘事卡片排版。
    - 建立物理級「邊界鎖」與「內存回收」機制。

**[2] AgenticKONG (OpenCode Zen CLI + MiniMax2.5)**
- **職責**：協作開發與架構支持、主理「3D」。

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
| 前端 dev 端口 | 3000 | `npm run serve` |

### 一、安装依赖

1. **PostgreSQL**：安装并启动服务，记下端口（默认 5432；若用 5433 需在安装或配置中指定）。
2. **Redis**：安装并启动（`brew services start redis` / 或系统等价方式）。
3. **Java 17**、**Maven**、**Node.js**（前端需 16+）。

### 二、数据库初始化（首次或重置本地库）

1. 在 PostgreSQL 中创建数据库（若尚未创建）：
   createdb -U postgres huangbinhong_visualization
   #或 psql -U postgres -c "CREATE DATABASE huangbinhong_visualization;"
   
