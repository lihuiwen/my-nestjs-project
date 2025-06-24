# NestJS Full-Stack API 项目

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![GitHub API](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://docs.github.com/en/rest)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

基于 NestJS 构建的全栈 API 项目，集成 GitHub API 和数据库管理功能，支持读写分离架构。

## 🚀 功能特性

### GitHub API 模块
- ✅ 获取用户 GitHub 仓库列表
- ✅ 自动处理分页和错误处理
- ✅ 完整的 GitHub API 集成

### 数据库管理模块
- ✅ 用户管理 (创建、查询)
- ✅ 文章管理 (创建、查询、删除)
- ✅ 用户创建时同步创建多篇文章
- ✅ 为现有用户批量添加文章
- ✅ 读写分离架构
- ✅ 自动数据迁移

### 系统特性
- ✅ TypeScript 类型安全
- ✅ Swagger API 文档
- ✅ 环境变量配置管理
- ✅ 完善的错误处理
- ✅ 支持 AWS Lambda 部署

## 📋 技术栈

- **框架**: NestJS 10.x
- **语言**: TypeScript 5.x
- **数据库**: PostgreSQL / SQLite
- **ORM**: Prisma 5.x
- **HTTP客户端**: @nestjs/axios
- **配置管理**: @nestjs/config
- **API文档**: @nestjs/swagger
- **测试框架**: Jest
- **包管理**: Yarn

## 📁 项目结构

```
my-nestjs-project/
├── src/
│   ├── github/                    # GitHub 模块
│   │   ├── github.controller.ts   # 控制器
│   │   ├── github.controller.spec.ts  # 控制器测试
│   │   ├── github.service.ts      # 服务层
│   │   ├── github.service.spec.ts # 服务层测试
│   │   └── github.module.ts       # 模块定义
│   ├── database/                 # 数据库模块
│   │   ├── dto/                  # 数据传输对象
│   │   ├── entities/             # 实体定义
│   │   ├── database.controller.ts
│   │   ├── database.service.ts
│   │   ├── database.module.ts
│   │   └── prisma-read-write.service.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/                       # Prisma 配置
│   ├── schema.prisma
│   └── migrations/
├── test/                         # 测试文件
├── .env                          # 环境变量
├── package.json
└── README.md
```

## 🛠️ 快速开始

### 前置要求

- Node.js >= 18.0.0
- Yarn >= 1.22.0
- PostgreSQL (可选，也可使用 SQLite)
- GitHub Personal Access Token

### 安装依赖

```bash
# 克隆项目
git clone <your-repo-url>
cd my-nestjs-project

# 安装依赖
yarn install
```

### 环境配置

1. 创建 `.env` 文件：

```bash
cp .env.example .env
```

2. 配置环境变量：

```env
# 数据库配置
DATABASE_URL="file:./dev.db"
DATABASE_READ_URL="file:./dev.db"

# 如果使用 PostgreSQL
# DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase"
# DATABASE_READ_URL="postgresql://username:password@localhost:5432/mydatabase"

# GitHub API 配置
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_API_URL="https://api.github.com"

# 应用配置
PORT=3000
NODE_ENV=development
```

### 获取 GitHub Token

1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 选择权限：`repo` (访问仓库)
4. 复制生成的 token 到 `.env` 文件

### 数据库初始化

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init

# 查看数据库 (可选)
npx prisma studio
```

### 启动应用

```bash
# 开发模式
yarn start:dev

# 生产模式
yarn build
yarn start:prod
```

应用将在 `http://localhost:3000` 启动

## 📊 数据模型

### User (用户)
```typescript
{
  id: number          // 用户ID (主键)
  email: string       // 邮箱 (唯一)
  name?: string       // 姓名 (可选)
  posts: Post[]       // 关联的文章
  createdAt: Date     // 创建时间
  updatedAt: Date     // 更新时间
}
```

### Post (文章)
```typescript
{
  id: number          // 文章ID (主键)
  title: string       // 标题
  content?: string    // 内容 (可选)
  published: boolean  // 是否发布
  author: User        // 作者
  authorId: number    // 作者ID (外键)
  createdAt: Date     // 创建时间
  updatedAt: Date     // 更新时间
}
```

## 📡 API 文档

### Swagger 文档

启动应用后，访问 [http://localhost:3000/api](http://localhost:3000/api) 查看完整的 API 文档。

### 基础信息

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`

---

## 👥 用户管理 API

### 创建用户（基础版本）
```http
POST /database/users
Content-Type: application/json

{
  "name": "张三",
  "email": "zhangsan@example.com"
}
```

**响应示例**:
```json
{
  "id": 1,
  "name": "张三",
  "email": "zhangsan@example.com",
  "createdAt": "2025-06-24T12:00:00.000Z",
  "updatedAt": "2025-06-24T12:00:00.000Z"
}
```

### 获取所有用户
```http
GET /database/users
```

**响应示例**:
```json
[
  {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "posts": [
      {
        "id": 1,
        "title": "我的第一篇文章",
        "content": "文章内容...",
        "published": true,
        "authorId": 1,
        "createdAt": "2025-06-24T12:00:00.000Z",
        "updatedAt": "2025-06-24T12:00:00.000Z"
      }
    ],
    "createdAt": "2025-06-24T12:00:00.000Z",
    "updatedAt": "2025-06-24T12:00:00.000Z"
  }
]
```

### 创建用户同时创建多篇文章
```http
POST /database/users-with-posts
Content-Type: application/json

{
  "name": "李四",
  "email": "lisi@example.com",
  "posts": [
    {
      "title": "我的第一篇文章",
      "content": "这是我的第一篇文章内容",
      "published": true
    },
    {
      "title": "我的第二篇文章",
      "content": "这是我的第二篇文章内容",
      "published": false
    }
  ]
}
```

**响应示例**:
```json
{
  "id": 2,
  "name": "李四",
  "email": "lisi@example.com",
  "createdAt": "2025-06-24T12:00:00.000Z",
  "updatedAt": "2025-06-24T12:00:00.000Z",
  "posts": [
    {
      "id": 2,
      "title": "我的第一篇文章",
      "content": "这是我的第一篇文章内容",
      "published": true,
      "authorId": 2,
      "createdAt": "2025-06-24T12:00:00.000Z",
      "updatedAt": "2025-06-24T12:00:00.000Z"
    },
    {
      "id": 3,
      "title": "我的第二篇文章",
      "content": "这是我的第二篇文章内容",
      "published": false,
      "authorId": 2,
      "createdAt": "2025-06-24T12:00:00.000Z",
      "updatedAt": "2025-06-24T12:00:00.000Z"
    }
  ]
}
```

### 为现有用户批量添加文章
```http
POST /database/users/{id}/posts-batch
Content-Type: application/json

{
  "posts": [
    {
      "title": "新增文章1",
      "content": "新增内容1",
      "published": true
    },
    {
      "title": "新增文章2",
      "content": "新增内容2",
      "published": false
    }
  ]
}
```

---

## 📝 文章管理 API

### 创建文章
```http
POST /database/posts
Content-Type: application/json

{
  "title": "我的新文章",
  "content": "这是文章内容...",
  "authorId": 1,
  "published": false
}
```

**响应示例**:
```json
{
  "id": 4,
  "title": "我的新文章",
  "content": "这是文章内容...",
  "published": false,
  "authorId": 1,
  "createdAt": "2025-06-24T12:00:00.000Z",
  "updatedAt": "2025-06-24T12:00:00.000Z",
  "author": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "createdAt": "2025-06-24T12:00:00.000Z",
    "updatedAt": "2025-06-24T12:00:00.000Z"
  }
}
```

### 获取所有文章
```http
GET /database/posts
```

**响应示例**:
```json
[
  {
    "id": 1,
    "title": "我的第一篇文章",
    "content": "文章内容...",
    "published": true,
    "authorId": 1,
    "createdAt": "2025-06-24T12:00:00.000Z",
    "updatedAt": "2025-06-24T12:00:00.000Z",
    "author": {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com",
      "createdAt": "2025-06-24T12:00:00.000Z",
      "updatedAt": "2025-06-24T12:00:00.000Z"
    }
  }
]
```

### 删除文章
```http
DELETE /database/posts/{id}
```

**响应示例**:
```json
{
  "id": 1,
  "title": "已删除的文章",
  "content": "文章内容...",
  "published": true,
  "authorId": 1,
  "createdAt": "2025-06-24T12:00:00.000Z",
  "updatedAt": "2025-06-24T12:00:00.000Z",
  "author": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "createdAt": "2025-06-24T12:00:00.000Z",
    "updatedAt": "2025-06-24T12:00:00.000Z"
  }
}
```

---

## 🐙 GitHub API

### 获取用户仓库列表
```http
GET /github/repositories
```

**响应示例:**
```json
[
  {
    "id": 12345,
    "name": "my-awesome-project",
    "full_name": "username/my-awesome-project",
    "description": "一个很棒的项目",
    "private": false,
    "html_url": "https://github.com/username/my-awesome-project",
    "clone_url": "https://github.com/username/my-awesome-project.git",
    "ssh_url": "git@github.com:username/my-awesome-project.git",
    "language": "TypeScript",
    "stargazers_count": 42,
    "forks_count": 7,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-06-23T00:00:00Z",
    "pushed_at": "2024-06-22T15:30:00Z"
  }
]
```

**状态码:**
- `200 OK` - 成功返回仓库列表
- `401 Unauthorized` - GitHub token 未配置
- `400 Bad Request` - GitHub API 请求失败

---

## 📝 使用示例

### cURL 示例

```bash
# 创建用户（基础版本）
curl -X POST http://localhost:3000/database/users \
  -H "Content-Type: application/json" \
  -d '{"name":"张三","email":"zhangsan@example.com"}'

# 创建用户同时创建文章
curl -X POST http://localhost:3000/database/users-with-posts \
  -H "Content-Type: application/json" \
  -d '{
    "name":"李四",
    "email":"lisi@example.com",
    "posts":[
      {"title":"文章1","content":"内容1","published":true},
      {"title":"文章2","content":"内容2","published":false}
    ]
  }'

# 获取所有用户
curl http://localhost:3000/database/users

# 创建单篇文章
curl -X POST http://localhost:3000/database/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"新文章","content":"内容","authorId":1}'

# 获取所有文章
curl http://localhost:3000/database/posts

# 为用户批量添加文章
curl -X POST http://localhost:3000/database/users/1/posts-batch \
  -H "Content-Type: application/json" \
  -d '{"posts":[{"title":"新文章","content":"新内容"}]}'

# 删除文章
curl -X DELETE http://localhost:3000/database/posts/1

# 获取GitHub仓库
curl http://localhost:3000/github/repositories
```

### JavaScript/Fetch 示例

```javascript
// 创建用户同时创建文章
const createUserWithPosts = async () => {
  const response = await fetch('http://localhost:3000/database/users-with-posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: '王五',
      email: 'wangwu@example.com',
      posts: [
        {
          title: '我的编程之路',
          content: '从零开始学习编程的经历...',
          published: true
        },
        {
          title: '技术栈选择',
          content: '如何选择合适的技术栈...',
          published: false
        }
      ]
    })
  });
  
  const result = await response.json();
  console.log('创建成功:', result);
};

// 获取GitHub仓库
const getGitHubRepos = async () => {
  const response = await fetch('http://localhost:3000/github/repositories');
  const repos = await response.json();
  console.log('GitHub仓库:', repos);
};

// 为现有用户添加文章
const addPostsToUser = async (userId) => {
  const response = await fetch(`http://localhost:3000/database/users/${userId}/posts-batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      posts: [
        {
          title: '新的想法',
          content: '今天有一些新的想法...',
          published: true
        }
      ]
    })
  });
  
  const result = await response.json();
  console.log('文章添加成功:', result);
};

// 获取所有用户
const getAllUsers = async () => {
  const response = await fetch('http://localhost:3000/database/users');
  const users = await response.json();
  console.log('所有用户:', users);
};
```

---

## 🏗️ 高级特性

### 读写分离

项目支持数据库读写分离，自动将：
- **读操作** (GET 请求) 路由到从数据库
- **写操作** (POST/PUT/DELETE 请求) 路由到主数据库

配置示例：
```env
DATABASE_URL="postgresql://user:pass@master-db:5432/mydb"
DATABASE_READ_URL="postgresql://user:pass@slave-db:5432/mydb"
```

### 智能路由

系统根据 Prisma 方法名自动选择数据库：
- `find*`, `count`, `aggregate` → 读数据库
- `create*`, `update*`, `delete*` → 写数据库

### 错误处理

API 统一返回标准错误格式：

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 数据验证

所有输入数据都经过验证，确保数据完整性和安全性。

---

## 🧪 测试

### 运行测试

```bash
# 运行所有单元测试
yarn test

# 运行测试并生成覆盖率报告
yarn test:cov

# 监听模式运行测试
yarn test:watch

# 运行特定测试文件
yarn test github.service.spec.ts
yarn test database.service.spec.ts
```

---

## 🐛 错误处理

### 常见错误及解决方案

#### 1. 数据库连接失败

```json
{
  "statusCode": 500,
  "message": "Can't reach database server"
}
```

**解决方案**: 检查 `.env` 文件中的数据库配置，确保数据库服务正在运行。

#### 2. GitHub Token 未配置

```json
{
  "statusCode": 401,
  "message": "GitHub token not configured"
}
```

**解决方案**: 检查 `.env` 文件中的 `GITHUB_TOKEN` 是否正确配置。

#### 3. 创建用户时邮箱重复

```json
{
  "statusCode": 400,
  "message": "Unique constraint failed on the fields: (`email`)"
}
```

**解决方案**: 使用不同的邮箱地址，或先查询用户是否已存在。

#### 4. 文章作者不存在

```json
{
  "statusCode": 400,
  "message": "Foreign key constraint failed"
}
```

**解决方案**: 确保创建文章时提供的 `authorId` 对应的用户存在。

---

## 🔧 开发脚本

```bash
# 启动开发服务器
yarn start:dev

# 构建项目
yarn build

# 代码格式化
yarn format

# 代码检查
yarn lint

# 数据库操作
npx prisma studio          # 打开数据库管理界面
npx prisma migrate reset   # 重置数据库
npx prisma generate        # 生成客户端
```

---

## 🚀 部署

### 环境变量配置

生产环境需要配置以下环境变量：

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@prod-db:5432/mydb
DATABASE_READ_URL=postgresql://user:pass@read-db:5432/mydb
GITHUB_TOKEN=your_production_github_token
```

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN yarn install --only=production

COPY . .
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start:prod"]
```

### AWS Lambda 部署

项目支持通过 AWS SAM 部署到 Lambda：

```bash
# 添加 Lambda 适配器
yarn add @vendia/serverless-express

# 部署到 AWS
sam build
sam deploy --guided
```

---

## 🔒 安全注意事项

1. **Token 安全**: 
   - 不要将 GitHub token 提交到代码仓库
   - 使用环境变量管理敏感信息
   - 定期轮换 token

2. **数据库安全**:
   - 使用强密码和安全连接
   - 定期备份数据
   - 配置适当的访问权限

3. **API 安全**:
   - 实施适当的速率限制
   - 验证所有输入数据
   - 生产环境中避免暴露敏感错误信息

---

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 编写单元测试
- 添加适当的注释和文档

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🙏 致谢

- [NestJS](https://nestjs.com/) - 强大的 Node.js 框架
- [Prisma](https://www.prisma.io/) - 现代化的数据库工具
- [GitHub API](https://docs.github.com/en/rest) - 优秀的 API 设计
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript

---

## 🆘 常见问题

### Q: 如何重置数据库？
A: 运行 `npx prisma migrate reset` 命令。

### Q: 如何查看数据库内容？
A: 运行 `npx prisma studio` 打开图形化界面。

### Q: 如何添加新的 API 接口？
A: 使用 NestJS CLI：`nest generate resource YourResourceName`

### Q: 如何配置读写分离？
A: 在 `.env` 文件中配置 `DATABASE_URL` 和 `DATABASE_READ_URL`。

### Q: 如何获取 GitHub 仓库列表？
A: 访问 `GET /github/repositories` 端点，确保已正确配置 GITHUB_TOKEN。

### Q: 创建用户时可以不添加文章吗？
A: 可以，使用 `POST /database/users-with-posts` 时 `posts` 字段是可选的。

---

⭐ **如果这个项目对您有帮助，请给它一个 star！**

**Happy Coding! 🎉**