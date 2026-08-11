#!/usr/bin/env bash
# start-dev.sh — 慧听说提分应用一键启动脚本（Linux/macOS）
#
# 用法：
#   ./start-dev.sh              # 快速模式（仅前端，Mock 数据）
#   ./start-dev.sh --full       # 完整模式（BFF + AI Service + 前端）
#   ./start-dev.sh --full --with-chivox  # 完整模式 + 驰声真实评测
#
# 前置条件：
#   - Node.js >= 22 + pnpm >= 9
#   - Python >= 3.11（仅 --full 模式需要 AI Service）

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FULL_MODE=false
WITH_CHIVOX=false

# 解析参数
for arg in "$@"; do
  case "$arg" in
    --full) FULL_MODE=true ;;
    --with-chivox) WITH_CHIVOX=true ;;
    *) echo "未知参数: $arg" >&2; exit 1 ;;
  esac
done

echo ""
echo "========================================="
[ "$FULL_MODE" = true ] && \
  echo "  慧听说提分应用 — 完整模式（BFF + AI + 前端）" || \
  echo "  慧听说提分应用 — 快速模式（仅前端 + Mock）"
echo "========================================="
echo ""

# ===== 快速模式 =====
if [ "$FULL_MODE" = false ]; then
  echo "启动 Vite 开发服务器（Mock 模式）..."
  echo "  前端地址: http://localhost:5173"
  echo "  Mock 评测: 返回固定 78/100 分"
  echo ""
  echo "提示: 运行 ./start-dev.sh --full 启动完整后端"
  echo ""
  cd "$PROJECT_ROOT/apps/web"
  exec npx vite --port 5173
fi

# ===== 完整模式 =====
PIDS=()
cleanup() {
  echo ""
  echo "停止所有服务..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  exit 0
}
trap cleanup INT TERM

# 1. 检查依赖
echo "[1/4] 检查依赖..."
command -v node >/dev/null 2>&1 || { echo "  ✗ Node.js 未安装"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "  ✗ pnpm 未安装"; exit 1; }
echo "  ✓ Node $(node --version) / pnpm $(pnpm --version)"

# 2. 数据库迁移 + Seed
echo "[2/4] 数据库迁移 + 种子数据..."
cd "$PROJECT_ROOT/apps/api-bff"
[ -d node_modules ] || pnpm install --no-frozen-lockfile
npx prisma generate
npx prisma db push --accept-data-loss 2>/dev/null || true
npx tsx prisma/seed.ts 2>/dev/null || echo "  种子数据已存在，跳过"
echo "  ✓ 数据库就绪（SQLite: dev.db）"

# 3. 启动 AI Service
echo "[3/4] 启动 AI Service (FastAPI)..."
cd "$PROJECT_ROOT/services/ai-svc"
if command -v python3 >/dev/null 2>&1; then
  [ -d .venv ] || python3 -m venv .venv
  # shellcheck disable=SC1091
  source .venv/bin/activate
  pip install -q -r requirements.txt 2>/dev/null || true
  [ "$WITH_CHIVOX" = true ] && \
    echo "  驰声评测: 已启用（需在 .env 中填写 CHIVOX_APP_ID/SECRET）"
  python3 -m uvicorn app.main:app --port 8000 &
  PIDS+=($!)
  echo "  ✓ AI Service : http://localhost:8000"
  deactivate 2>/dev/null || true
else
  echo "  ⚠ Python 未安装，跳过 AI Service（BFF 将使用 Mock 评测）"
fi

# 4. 启动 BFF（注意：tsx 会破坏 NestJS 的 emitDecoratorMetadata，必须用 nest start）
echo "[4/4] 启动 BFF (NestJS) + 前端 (Vite)..."
cd "$PROJECT_ROOT/apps/api-bff"
npx nest start --watch &
PIDS+=($!)
sleep 2
echo "  ✓ BFF        : http://localhost:3000/api"

# 5. 启动前端
cd "$PROJECT_ROOT/apps/web"
[ -d node_modules ] || pnpm install --no-frozen-lockfile
# 启用真实 BFF
if [ -f .env ]; then
  sed -i.bak 's/VITE_USE_REAL_BFF=false/VITE_USE_REAL_BFF=true/' .env && rm -f .env.bak
fi
echo "  ✓ 前端       : http://localhost:5173"
echo ""
echo "========================================="
echo "  所有服务已启动！"
echo "========================================="
echo ""
echo "  前端:       http://localhost:5173"
echo "  BFF:        http://localhost:3000/api"
echo "  AI Service: http://localhost:8000"
echo ""
echo "  按 Ctrl+C 停止所有服务。"
echo ""

npx vite --port 5173 &
PIDS+=($!)
wait
