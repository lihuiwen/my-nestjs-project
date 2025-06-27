#!/bin/bash
# deploy.sh - 修复版部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}第一阶段：加载环境配置...${NC}"
source ./deploy-dev.env

echo -e "${YELLOW}第二阶段：安装依赖并构建项目，创建 Lambda Layer...${NC}"
# 1. 清理之前的构建
rm -rf dist deploy layers

# 2. 安装项目依赖
yarn install --frozen-lockfile

# 3. 清理之前的生成文件
rm -rf node_modules/.prisma/client
npx prisma generate

# 4. 构建 webpack 包
yarn build:lambda

# 📍 在 deploy 目录中重新生成 Prisma 客户端
echo -e "${YELLOW}第2.5阶段：为 Lambda 环境重新生成 Prisma 客户端...${NC}"

# 5. 创建 Lambda Layer（移除 Prisma 相关依赖）
mkdir -p layers/nest/nodejs

# Layer 的 package.json（不包含 Prisma）
cat > layers/nest/nodejs/package.json << 'EOF'
{
  "name": "nestjs-lambda-layer-deps",
  "version": "1.0.0",
  "description": "NestJS Lambda Layer Dependencies",
  "dependencies": {
    "aws-lambda": "^1.0.7",
    "@vendia/serverless-express": "^4.12.6",
    "reflect-metadata": "^0.2.2",
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "rxjs": "^7.8.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0"
  }
}
EOF

cd layers/nest/nodejs

npm install --production --no-package-lock --no-audit --no-fund
cd ../../../

echo -e "${YELLOW}第三阶段：打包 Lambda 代码...${NC}"
rm -rf deploy
mkdir -p deploy

# 1. 拷贝 webpack 构建文件
cp dist/lambda.js deploy/

# 📍 拷贝 webpack 构建的 Prisma 文件
cp -r dist/node_modules deploy/

# 2. 创建 Lambda 的 package.json
cat > deploy/package.json << 'EOF'
{
  "name": "nestjs-lambda-function",
  "version": "1.0.0",
  "main": "lambda.js",
  "dependencies": {
    "@prisma/client": "*"
  }
}
EOF

# 📍 重要：确保 Prisma 客户端正确复制并重新生成
echo -e "${GREEN}正在为 Lambda 环境设置 Prisma 客户端...${NC}"

# 📍 不需要手动复制，因为 webpack 已经处理了
# mkdir -p deploy/node_modules/@prisma
# mkdir -p deploy/node_modules/.prisma
# cp -r node_modules/@prisma/client deploy/node_modules/@prisma/
# cp -r node_modules/.prisma/client deploy/node_modules/.prisma/

# 拷贝 Prisma schema
cp -r prisma deploy/

# 📍 重要：在 deploy 目录中重新生成客户端，确保使用正确的 binary target
cd deploy
# PRISMA_CLI_BINARY_TARGETS="rhel-openssl-3.0.x" npx prisma generate --schema=./prisma/schema.prisma
yarn install --frozen-lockfile
cd ../

# 📍 新增：复制 binary 文件到根目录，确保 PRISMA_QUERY_ENGINE_LIBRARY 环境变量能找到
if [ -f "deploy/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node" ]; then
  echo -e "${GREEN}复制 Prisma binary 到根目录...${NC}"
  cp deploy/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node deploy/
  chmod +x deploy/libquery_engine-rhel-openssl-3.0.x.so.node
  echo -e "${GREEN}✅ Binary 文件复制完成${NC}"
else
  echo -e "${RED}❌ 警告：未找到 Prisma binary 文件${NC}"
fi

echo -e "${GREEN}Prisma 客户端设置完成！${NC}"

find deploy/node_modules/.prisma/client -name "*.so.node" -exec chmod +x {} \;

echo -e "${YELLOW}第四阶段：部署 SAM 应用...${NC}"
export SAM_CLI_TELEMETRY=0

sam build --template-file template.yaml --build-dir .aws-sam/build
# 部署命令
sam deploy \
    --template-file .aws-sam/build/template.yaml \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        Environment="$ENVIRONMENT" \
        DatabaseName="$DATABASE_NAME" \
        DatabaseUsername="$DATABASE_USERNAME" \
        DatabasePassword="$DATABASE_PASSWORD" \
        GitHubToken="$GITHUB_TOKEN" \
        MinCapacity="$MIN_CAPACITY" \
        MaxCapacity="$MAX_CAPACITY" \
    --no-fail-on-empty-changeset \
    --resolve-s3 \
    --no-confirm-changeset
