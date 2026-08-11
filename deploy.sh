#!/usr/bin/env bash
# deploy.sh — 生产环境一键部署脚本（Linux/macOS，Docker 版）
#
# 用法：
#   ./deploy.sh                # 启动全部服务
#   ./deploy.sh --build        # 重新构建镜像
#   ./deploy.sh --down         # 停止全部服务
#   ./deploy.sh --logs         # 查看日志
#   ./deploy.sh --migrate      # 仅执行数据库迁移
#
# 前置条件：
#   - Docker Engine + Docker Compose v2 已安装并运行
#   - 已创建 .env.prod 文件（参考 .env.prod.example）

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.prod"
COMPOSE_ARGS=(--env-file "$ENV_FILE" -f docker-compose.prod.yml)

ACTION="up"
BUILD=false
for arg in "$@"; do
  case "$arg" in
    --build) BUILD=true ;;
    --down) ACTION="down" ;;
    --logs) ACTION="logs" ;;
    --migrate) ACTION="migrate" ;;
    *) echo "未知参数: $arg" >&2; exit 1 ;;
  esac
done

# 检查 .env.prod
if [ ! -f "$ENV_FILE" ]; then
  echo "未找到 .env.prod 文件，正在从模板创建..." >&2
  cp "$PROJECT_ROOT/.env.prod.example" "$ENV_FILE"
  echo "已创建 .env.prod，请编辑后重新运行此脚本" >&2
  echo "  vim $ENV_FILE" >&2
  exit 0
fi

# 停止
if [ "$ACTION" = "down" ]; then
  echo "停止全部服务..."
  docker compose "${COMPOSE_ARGS[@]}" down
  echo "已停止。清除数据: docker compose ${COMPOSE_ARGS[*]} down -v"
  exit 0
fi

# 日志
if [ "$ACTION" = "logs" ]; then
  docker compose "${COMPOSE_ARGS[@]}" logs -f --tail=100
  exit 0
fi

# 仅迁移
if [ "$ACTION" = "migrate" ]; then
  echo "执行数据库迁移..."
  docker compose "${COMPOSE_ARGS[@]}" exec -T bff npx prisma migrate deploy
  docker compose "${COMPOSE_ARGS[@]}" exec -T bff npx tsx prisma/seed.ts
  echo "迁移完成"
  exit 0
fi

# 检查 Docker
if ! docker info >/dev/null 2>&1; then
  echo "Docker 未运行，请先启动 Docker Engine" >&2
  exit 1
fi

# 构建 + 启动
if [ "$BUILD" = true ]; then
  echo "重新构建镜像并启动..."
  docker compose "${COMPOSE_ARGS[@]}" up -d --build
else
  echo "启动服务..."
  docker compose "${COMPOSE_ARGS[@]}" up -d
fi

sleep 5

# 执行数据库迁移
echo "执行数据库迁移..."
docker compose "${COMPOSE_ARGS[@]}" exec -T bff npx prisma migrate deploy 2>/dev/null || true
docker compose "${COMPOSE_ARGS[@]}" exec -T bff npx tsx prisma/seed.ts 2>/dev/null || true

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "  前端入口:  http://localhost"
echo "  BFF API:   http://localhost/api/health"
echo "  MinIO:     http://localhost:9001"
echo ""
echo "  查看日志:  ./deploy.sh --logs"
echo "  停止服务:  ./deploy.sh --down"
echo ""
