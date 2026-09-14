# 打卡小程序 · Punch on Clock

一个「**任务可配置、个人可独立使用、团队可协作**」的通用打卡小程序。

- **个人场景**：早起、读书、健身、背单词……用户自建任务，每日打卡，查看连续天数与日历。
- **团队场景**：跑团、读书会、班级、门店……创建圈子，下发打卡任务，成员互相监督，查看排行统计。
- **平台场景**：运营方配置官方模板任务（如「21 天阅读挑战」），供用户一键加入。

> 技术方案与完整设计见 [打卡小程序实现方案.md](./打卡小程序实现方案.md)。

---

## 一、当前进度

| 里程碑 | 内容 | 状态 |
| --- | --- | --- |
| **M1 基础框架** | 项目脚手架、云开发接入、`user` 云函数与登录、`common` 公共层、TDesign 集成、请求/存储工具封装 | 已完成 |
| **M2 任务 + 打卡核心** | `task` 任务 CRUD、`checkin.submit` 打卡闭环、记录与月历、个人统计、任务广场 | 进行中 |
| **M3 圈子 + 互动** | 圈子、成员、圈子任务、动态流、点赞评论、排行 | 规划中 |
| **M4 后台 + 通知** | 管理后台、订阅消息提醒、补卡审批 | 规划中 |
| **M5 上线打磨** | 内容安全、合规、性能优化、体验细节、提审上线 | 规划中 |

M1 已交付能力：

- 小程序端静默登录链路打通（`app.ts` 启动即登录，并发去重）
- 用户资料读写：微信头像昵称填写能力 → 云存储上传 → 云函数落库
- 首页「开发自检」区可直观验证云环境 / `openid` / 用户状态
- `cloudfunctions/common` 公共层与 `sync:common` 同步机制成形

> 数据模型已按最终形态设计（`tasks.groupId` 可为 `null` 即个人任务），M3 引入圈子时无需改表。

---

## 二、技术栈

| 层次 | 选型 | 说明 |
| --- | --- | --- |
| 小程序端 | 微信原生小程序 + TypeScript | 与云开发能力最贴合，无跨端运行时开销 |
| UI 组件 | TDesign 小程序组件库 | 按需引入，需在开发者工具中「构建 npm」 |
| 状态管理 | 内置轻量 Store（模块级单例 + 订阅） | 零第三方依赖，启动链路不受 npm 构建影响 |
| 后端 | 微信云开发 | 云函数 + 云数据库 + 云存储 |
| 管理后台 | Vue3 + Vite + Element Plus + `@cloudbase/js-sdk` | M4 阶段开发，复用同一云环境 |
| 后台部署 | 云开发静态网站托管 | 免额外服务器 |

**已确认的关键决策**：前端采用**微信原生小程序**，不引入 Taro / uni-app；后端采用**微信云开发**。若未来需要多端覆盖，将**自建服务器与后端接口并重构**，而非依赖跨端框架。

---

## 三、目录结构

```
mini-program-punch-on-clock/
├── project.config.json          # AppID / 云函数根目录 / TS 编译开关 / npm 构建配置
├── package.json                 # 根脚本（sync:common）
├── README.md
├── 打卡小程序实现方案.md          # 完整技术方案文档
│
├── scripts/
│   └── sync-common.mjs          # 公共层同步脚本（common → 各云函数 lib/）
│
├── cloudfunctions/              # 云函数根目录
│   ├── common/                  # 公共层源码（唯一来源，本身不是云函数）
│   │   ├── index.js             # 统一出口，聚合以下模块
│   │   ├── errors.js            # 统一错误码 ERR + ERROR_MESSAGE + BusinessError
│   │   ├── response.js          # success / fail / fromError 响应封装
│   │   ├── constants.js         # 集合名 COLLECTIONS + 各类枚举
│   │   ├── db.js                # getDb / command / serverDate / collection
│   │   ├── date.js              # periodKey / 时间窗 / 有效期 / 球面距离
│   │   ├── validator.js         # 参数校验（isString / oneOf / normalizePaging ...）
│   │   ├── auth.js              # openid 鉴权 / requireUser / requireAdmin
│   │   └── package.json
│   │
│   └── user/                    # 用户域云函数
│       ├── index.js             # action 路由入口
│       ├── actions/
│       │   ├── login.js         # 首次调用自动建用户
│       │   ├── getProfile.js    # 获取当前用户
│       │   └── updateProfile.js # 更新昵称 / 头像
│       ├── lib/                 # 由 sync:common 生成，勿手改（已 gitignore）
│       └── package.json
│
└── miniprogram/                 # 小程序端
    ├── app.ts / app.json / app.wxss
    ├── config/index.ts          # 云环境 ID / AppID / 版本号 / 云存储目录约定
    ├── typings/model.d.ts       # 全局业务模型声明（IUser / ITask ...，无需 import）
    ├── store/user.ts            # 用户全局状态（零依赖，含订阅机制）
    ├── utils/
    │   ├── cloud.ts             # 云函数调用封装（call / uploadFile）+ ApiError
    │   ├── constants.ts         # 云函数名 / 本地缓存 key / 路由 / 日期模板
    │   ├── storage.ts           # 本地缓存封装（带异常兜底）
    │   ├── date.ts              # 日期格式化与问候语
    │   └── toast.ts             # 交互反馈（toast / confirm / loading）
    ├── pages/
    │   ├── index/               # 首页：今日概览 + 今日任务 + 开发自检
    │   └── mine/                # 我的：头像昵称编辑 + 数据概览
    ├── tsconfig.json            # 路径别名 @/* → ./*
    └── package.json             # tdesign-miniprogram / miniprogram-api-typings
```

---

## 四、架构与设计约定

### 4.1 分层职责

```
小程序端 (展示与交互)
   │  wx.cloud.callFunction（写操作唯一通道）
   ▼
云函数层（业务逻辑、校验、统计、鉴权的唯一权威入口）
   │
   ▼
云数据库 / 云存储 / 定时触发器
```

- **小程序端**只做展示与交互，**不直接写数据库**；复杂写操作全部走云函数。
- **云函数层**是所有业务写入、校验、统计、鉴权的唯一权威入口。
- **读操作**后续可按安全规则直连数据库以降低延迟。

### 4.2 统一响应结构

所有云函数返回固定结构，前端 `utils/cloud.ts` 统一解包：

```jsonc
{
  "code": 0,          // 0 为成功，非 0 见下方错误码表
  "message": "ok",
  "data": { },        // 业务数据
  "timestamp": 1757836800000
}
```

云函数入口统一用 `try / catch` + `fromError()` 包装，**不会向前端泄露堆栈**：

```js
exports.main = async (event = {}) => {
  try {
    return success(await handler(event))
  } catch (error) {
    return fromError(error)
  }
}
```

### 4.3 错误码

业务代码通过 `throw new BusinessError(ERR.XXX)` 主动抛出，由响应层自动转换为标准错误。
前端 `call()` 会在 `code !== 0` 时抛出 `ApiError`，并默认自动弹出 toast（可用 `silent: true` 关闭）。

| 段位 | 含义 | 错误码 |
| --- | --- | --- |
| 0 | 成功 | `0` |
| 通用 | 参数 / 未登录 / 无权限 / 不存在 / 冲突 / 限流 / 服务异常 | `40000` `40100` `40300` `40400` `40900` `42900` `50000` |
| 用户 | 用户不存在 / 已封禁 | `41001` `41002` |
| 任务 | 不存在 / 未发布 / 已过期 / 无权限 | `42001` `42002` `42003` `42004` |
| 打卡 | 重复打卡 / 不在时间窗 / 超范围 / 超额 / 内容违规 | `43001` `43002` `43003` `43004` `43005` |
| 圈子 | 不存在 / 无权限 / 已加入 / 人数已满 | `44001` `44002` `44003` `44004` |

前端本地错误码 `-1` 表示网络异常或服务无响应。

### 4.4 鉴权

云函数天然可信：`openid` 由微信注入（`cloud.getWXContext()`），**不信任前端传参**。

`cloudfunctions/common/auth.js` 提供分层校验：

| 方法 | 作用 |
| --- | --- |
| `getWXContext()` | 取 `openid` / `unionid` / `appid` / `source` |
| `requireOpenId()` | 无 `openid` 抛 `40100` |
| `requireUser()` | 已登录且未被封禁，返回用户文档 |
| `requireAdmin()` | 必须是平台管理员（M4 后台使用） |

### 4.5 公共层与 `sync:common`（重要）

微信云开发在部署时**每个云函数是相互隔离的独立包，无法 `require` 目录之外的代码**。

因此本项目约定：`cloudfunctions/common/` 是公共层的**唯一源码来源**，部署前通过脚本复制到每个云函数的 `lib/` 目录。

```bash
npm run sync:common     # 在项目根目录执行
```

```
cloudfunctions/common/  ──[sync-common.mjs]──▶  cloudfunctions/<fn>/lib/
```

注意事项：

- `cloudfunctions/*/lib/` 是**生成产物，已在 `.gitignore` 中忽略**，克隆仓库后必须重新生成。
- 云函数内统一以 `require('./lib')` 或 `require('../lib')` 引用。
- **每次修改 `cloudfunctions/common/` 后，必须重新执行 `npm run sync:common` 并重新部署受影响的云函数**，否则改动不生效。
- 同步时不会复制 `package.json`（会造成包名解析冲突）与 `node_modules`。
- 后续可选升级为云开发「公共层（Layer）」能力，届时本脚本可废弃。

公共层能力速览：

| 模块 | 主要导出 |
| --- | --- |
| `errors` | `ERR`、`ERROR_MESSAGE`、`BusinessError` |
| `response` | `success`、`fail`、`fromError`、`isSuccess` |
| `constants` | `COLLECTIONS`、`TASK_STATUS`、`USER_ROLE`、`PERIOD_KEY`、`PAGE` 等枚举 |
| `db` | `getDb`、`command`、`serverDate`、`collection` |
| `date` | `formatDate`、`getPeriodKey`、`isWithinTimeWindows`、`isWithinDateRange`、`getDistance` |
| `validator` | `isString`、`isNumber`、`isArray`、`oneOf`、`isDateString`、`isTimeString`、`normalizePaging` |
| `auth` | `getWXContext`、`requireUser`、`requireAdmin` |

### 4.6 `periodKey` 与打卡幂等

`periodKey` 是打卡去重的核心：同一 `(taskId, userId, periodKey)` 只允许存在一条记录（数据库唯一索引兜底）。

| 统计粒度 | 格式 | 示例 |
| --- | --- | --- |
| `day` | `YYYY-MM-DD` | `2026-09-14` |
| `week` | `<ISO年>-W<周序>` | `2026-W37` |
| `month` | `YYYY-MM` | `2026-09` |

粒度由任务的 `frequency.type` 推导（`weekly → week`、`monthly → month`，其余为 `day`），
也可通过 `frequency.periodKey` 显式指定。

---

## 五、快速开始

### 5.1 环境要求

- 微信开发者工具（最新稳定版）
- Node.js **18+**
- 微信小程序 AppID（已固化在 `project.config.json`）
- 云开发环境 ID（已固化在 `miniprogram/config/index.ts`）

### 5.2 初始化步骤

```bash
# 1. 安装小程序端依赖（务必在 miniprogram/ 目录下执行）
cd miniprogram && npm install && cd ..

# 2. 同步公共层到各云函数 lib/
npm run sync:common
```

随后在**微信开发者工具**中：

1. **导入项目** —— 目录选择本仓库根目录（`project.config.json` 所在位置），AppID 会自动读取。
2. **开通云开发** —— 确认 `miniprogram/config/index.ts` 中的 `envId` 对应环境已创建。
3. **构建 npm** —— 菜单栏「工具 → 构建 npm」。TDesign 组件必需，未构建时页面会报组件找不到。
4. **部署云函数** —— 右键 `cloudfunctions/user` → 「上传并部署：云端安装依赖」。
5. **创建集合与索引** —— 云开发控制台新建 `users` 集合，并为 `_openid` 建立**唯一索引**。

> 每次新增云函数或修改公共层后，重复步骤「同步公共层 → 部署云函数」。

### 5.3 验收自检（M1 完成定义）

| 检查项 | 预期结果 |
| --- | --- |
| 首页「开发自检」区 | 正确显示云环境 ID 与 `openid`，说明登录链路已打通 |
| 首页「用户状态」 | 显示 `normal` |
| 「我的」页修改头像昵称并保存 | 提示「保存成功」，页面即时更新 |
| 云开发控制台 `users` 集合 | 出现对应用户记录，`avatarUrl` 为 `cloud://` 开头的 fileID |

---

## 六、开发指南

### 6.1 云函数调用约定

云函数按领域拆分，函数内用 `event.action` 路由，减少冷启动与部署成本。

```ts
import { call } from '../../utils/cloud'

const user = await call<IUser>('user', 'login', {}, { silent: true })
```

调用选项：

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `loading` | boolean | 是否展示全屏 loading，默认 `false` |
| `loadingText` | string | loading 文案，默认「加载中」 |
| `silent` | boolean | 静默模式，不自动弹出错误提示，由调用方处理 |

### 6.2 新增一个 action

以 `cloudfunctions/user/actions/` 为例：

1. 新建 `actions/xxx.js`，从 `../lib` 引入所需能力；
2. 参数校验用 `validator` 系列方法，失败会自动抛 `BusinessError(ERR.PARAM)`；
3. 需要登录态时调用 `await requireUser()`；
4. 在 `index.js` 的 `handlers` 中注册 `xxx`；
5. 执行 `npm run sync:common` 后重新部署。

```js
const { requireUser, getDb, COLLECTIONS, isString } = require('../lib')

module.exports = async function xxx(event = {}) {
  const user = await requireUser()
  const title = isString(event.title, '标题', { min: 1, max: 30 })
  // ... 业务逻辑
  return { title }
}
```

### 6.3 开发约定

- **写操作只走云函数**，禁止客户端直接写库。
- **时间戳统一用毫秒数**，字段名为 `createdAt` / `updatedAt`，软删除用 `isDeleted`。
- **云函数新增文档不会自动写入 `_openid`**（云函数拥有管理员权限），必须显式设置，见 `actions/login.js`。
- 集合名与枚举一律从 `common/constants.js` 取，禁止硬编码字符串。
- 前端全局模型声明写在 `miniprogram/typings/model.d.ts`，无需 `import` 即可使用。
- 前后端日期算法保持同口径：`utils/date.ts` 与 `common/date.js` 逻辑一致。
- 页面路由、云函数名、缓存 key 集中在 `miniprogram/utils/constants.ts`。

---

## 七、云函数与数据库清单

### 7.1 云函数

| 函数名 | 职责 | 状态 |
| --- | --- | --- |
| `user` | 登录、资料读写、消息（`login` / `getProfile` / `updateProfile`） | 已实现 |
| `task` | 任务 CRUD、加入（`create` / `update` / `list` / `detail` / `publish` / `join` / `quit` / `square`） | 规划中 |
| `checkin` | 打卡核心（`submit` / `list` / `detail` / `calendar` / `delete` / `stats`） | 规划中 |
| `group` | 圈子（`create` / `update` / `list` / `join` / `approve` / `members` / `leave`） | 规划中 |
| `interaction` | 互动（`like` / `comment` / `list` / `delete`） | 规划中 |
| `makeup` | 补卡（`apply` / `approve` / `list`） | 规划中 |
| `ranking` | 排行（`taskRank` / `groupRank` / `userStat`） | 规划中 |
| `notify` | 通知（`subscribe` / `send`） | 规划中 |
| `admin` | 后台专用，校验 `role = admin` | 规划中 |
| `common` | 公共层（非云函数，同步到各函数 `lib/`） | 已实现 |

### 7.2 数据库集合

已定义于 `cloudfunctions/common/constants.js` 的 `COLLECTIONS`：

| 集合 | 说明 | 状态 |
| --- | --- | --- |
| `users` | 用户。`_openid` 唯一索引 | **需手动创建** |
| `tasks` | 打卡任务 | 规划中 |
| `checkin_records` | 打卡记录（核心表）。`(taskId, userId, periodKey)` 唯一索引 | 规划中 |
| `user_task_stats` | 用户-任务统计（连续天数 / 累计 / 本月） | 规划中 |
| `groups` / `group_members` | 圈子与成员 | 规划中 |
| `interactions` | 点赞评论 | 规划中 |
| `makeup_requests` | 补卡申请 | 规划中 |
| `messages` / `notify_subscriptions` | 站内消息、订阅授权记录 | 规划中 |
| `categories` / `settings` / `admin_logs` / `stat_daily` | 字典、配置、审计日志、每日汇总 | 规划中 |

字段定义详见 [方案文档 第五章](./打卡小程序实现方案.md)。

---

## 八、常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 云函数报 `Cannot find module './lib'` | 未同步公共层 | 根目录执行 `npm run sync:common` 后重新部署云函数 |
| 页面报 `tdesign-miniprogram/...` 找不到 | 未构建 npm | 开发者工具 → 工具 → 构建 npm |
| 提示找不到 `miniprogram-api-typings` | 未安装依赖 | 在 `miniprogram/` 目录下执行 `npm install` |
| 首页 `openid` 显示为空或「登录中…」 | 云函数未部署 / 云环境 ID 不符 | 部署 `user` 云函数；核对 `miniprogram/config/index.ts` 与云开发环境 |
| 保存资料报「昵称不能为空」 | 昵称为空 | 昵称必填，长度 1–20 字符 |
| 修改了 `common/` 但云端行为没变 | 忘记同步或重新部署 | 执行 `npm run sync:common` 并重新上传云函数 |
| 控制台提示 `_openid` 重复 | 未建唯一索引 | 在 `users` 集合为 `_openid` 建立唯一索引 |
| 提示当前基础库版本过低 | 基础库 < 2.2.3 | 在开发者工具中调整调试基础库版本 |

---

## 九、相关文档

| 文档 | 内容 |
| --- | --- |
| [打卡小程序实现方案.md](./打卡小程序实现方案.md) | 产品定位、技术选型、系统架构、功能模块、数据库设计、云函数设计、关键流程、权限模型、非功能需求、里程碑、风险应对、关键决策记录 |

其中「附录 A」包含 M1 环境搭建步骤、验收标准与常见问题。
