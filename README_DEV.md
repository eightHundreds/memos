# Memos 开发构建指南

本文档详细介绍了如何构建和开发 Memos 项目。

## 项目架构概览

Memos 是一个全栈应用程序，采用现代化的技术栈：

### 后端技术栈
- **语言**: Go 1.24+
- **框架**: Echo v4 (HTTP 服务器)
- **API**: gRPC + gRPC-Gateway (RESTful API)
- **数据库**: SQLite (默认), PostgreSQL, MySQL
- **协议**: Protocol Buffers

### 前端技术栈  
- **语言**: TypeScript
- **框架**: React 18.3+
- **构建工具**: Vite 6.3+
- **包管理**: pnpm
- **UI**: MUI Joy + Tailwind CSS

### 构建工具
- **Protocol Buffers**: buf CLI
- **容器化**: Docker 多阶段构建
- **CI/CD**: GitHub Actions

## 环境要求

### 必需依赖
- **Go**: 1.24 或更高版本
- **Node.js**: 22+ 
- **pnpm**: 最新版本
- **buf**: Protocol Buffers 工具 (用于 API 生成)

### 可选依赖
- **Docker**: 用于容器化构建
- **git**: 版本控制

## 项目结构

```
memos/
├── bin/memos/           # Go 主程序入口
├── internal/            # 内部工具库
├── server/              # HTTP 服务器和路由
│   └── router/frontend/ # 前端静态文件嵌入
├── store/               # 数据访问层
├── proto/               # Protocol Buffers 定义
│   └── gen/            # 生成的 gRPC 代码
├── web/                # 前端源代码
│   └── dist/           # 前端构建输出
├── scripts/            # 构建脚本
└── plugin/             # 插件系统
```

## 完整构建步骤

### 1. 克隆项目

```bash
git clone https://github.com/usememos/memos.git
cd memos
```

### 2. 安装 buf 工具

```bash
# macOS
brew install bufbuild/buf/buf

# Linux/Windows
# 参考 https://docs.buf.build/installation
```

### 3. 生成 Protocol Buffers 代码

```bash
cd proto
buf generate
cd ..
```

这会生成：
- `proto/gen/` - Go gRPC 服务端代码
- `web/src/types/proto/` - TypeScript 客户端类型

### 4. 构建前端

```bash
cd web

# 安装依赖
pnpm install

# 开发构建
pnpm dev

# 生产构建 (嵌入到 Go 程序)
pnpm release
```

**注意**: `pnpm release` 会将构建输出到 `../server/router/frontend/dist/`，这个目录会被 Go 的 `//go:embed` 指令嵌入到最终的二进制文件中。

### 5. 构建后端

#### 开发模式

```bash
# 下载 Go 依赖
go mod download

# 直接运行 (开发模式)
go run ./bin/memos/main.go --mode dev --port 8081
```

#### 生产构建

```bash
# 使用提供的构建脚本
./scripts/build.sh
```

或手动构建：

```bash
# 创建构建目录
mkdir -p build

# 构建可执行文件
go build -o build/memos ./bin/memos/main.go
```

### 6. 运行应用

```bash
# 开发模式
./build/memos --mode dev --port 8081

# 生产模式  
./build/memos --mode prod --port 5230
```

## 容器化构建

### 使用 Docker

```bash
# 构建 Docker 镜像
docker build -f scripts/Dockerfile -t memos:local .

# 运行容器
docker run -d \
  --name memos \
  -p 5230:5230 \
  -v ~/.memos:/var/opt/memos \
  memos:local
```

### 多阶段构建说明

Dockerfile 采用多阶段构建：

1. **前端阶段**: 在 CI 中预先构建前端 (`pnpm release`)
2. **后端阶段**: Go 编译，静态链接
3. **运行阶段**: Alpine Linux 最小镜像

## 开发模式

### 同时运行前后端

**终端 1 - 后端**:
```bash
go run ./bin/memos/main.go --mode dev --port 8081
```

**终端 2 - 前端**:
```bash
cd web
pnpm dev
```

访问:
- 前端开发服务器: http://localhost:3001
- 后端 API: http://localhost:8081

前端开发服务器会代理 API 请求到后端。

### 热重载

- **前端**: Vite 提供热重载
- **后端**: 使用 [air](https://github.com/cosmtrek/air) 或手动重启

## 常见问题

### Protocol Buffers 相关

**问题**: `buf generate` 失败
**解决**: 确保安装了 buf 工具，并检查 `proto/buf.gen.yaml` 配置

### 前端构建问题

**问题**: `pnpm install` 失败
**解决**: 
1. 清除缓存: `pnpm store prune`
2. 删除 `node_modules` 重新安装

### Go 编译问题

**问题**: 找不到嵌入的前端文件
**解决**: 确保先运行 `pnpm release` 生成前端构建文件

### 端口冲突

**问题**: 端口被占用
**解决**: 
- 前端: 修改 `web/vite.config.mts` 中的端口
- 后端: 使用 `--port` 参数指定其他端口

## 性能优化

### 构建性能

1. **并行构建**: CI 中前后端并行构建
2. **缓存优化**: 
   - Go: `go mod download` 缓存
   - Node: pnpm 存储缓存
   - Docker: 构建缓存

### 运行性能

1. **静态文件**: Go embed 提供高效的静态文件服务
2. **数据库**: SQLite 适合小型部署，PostgreSQL 适合大型部署
3. **gRPC**: 高性能的 API 通信

## 部署选项

### 单二进制部署

```bash
# 构建
./scripts/build.sh

# 部署 (所有静态文件已嵌入)
scp build/memos user@server:/usr/local/bin/
```

### 容器部署

```bash
# 推送到镜像仓库
docker push youregistry/memos:latest

# 部署
docker run -d \
  --name memos \
  -p 5230:5230 \
  -v /data/memos:/var/opt/memos \
  youregistry/memos:latest
```

### 环境变量配置

```bash
# 数据库
export MEMOS_DSN="postgres://user:pass@localhost/memos"
export MEMOS_DRIVER="postgres"

# 服务配置
export MEMOS_MODE="prod"
export MEMOS_PORT="5230"
export MEMOS_INSTANCE_URL="https://your-domain.com"
```

## 贡献指南

### 代码提交前检查

1. **后端检查**:
   ```bash
   go mod tidy
   go test ./...
   golangci-lint run
   ```

2. **前端检查**:
   ```bash
   cd web
   pnpm lint
   pnpm build
   ```

3. **Protocol Buffers**:
   ```bash
   cd proto
   buf lint
   buf format -w
   ```

### Git 提交格式

遵循标准提交格式:
- `feat: 添加新功能`
- `fix: 修复问题`
- `docs: 更新文档`
- `refactor: 重构代码`

## 参考链接

- [Memos 官网](https://www.usememos.com)
- [Go 官方文档](https://golang.org/doc/)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)
- [buf CLI](https://docs.buf.build/)
- [Vite 文档](https://vitejs.dev/)
- [pnpm 文档](https://pnpm.io/) 