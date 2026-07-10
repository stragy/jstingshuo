# start-dev.ps1 — 慧听说提分应用一键启动脚本
#
# 用法：
#   .\start-dev.ps1              # 快速模式（仅前端，Mock 数据）
#   .\start-dev.ps1 -Full        # 完整模式（DB + BFF + AI + 前端）
#   .\start-dev.ps1 -Full -WithChivox  # 完整模式 + 驰声真实评测
#
# 前置条件：
#   - Node.js >= 22 + pnpm >= 9
#   - Docker Desktop（仅 -Full 模式需要）
#   - Python >= 3.11（仅 -Full 模式需要 AI Service）

param(
  [switch]$Full,
  [switch]$WithChivox
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  慧听说提分应用 — 开发环境启动" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if ($Full) {
  Write-Host "[模式] 完整模式（DB + BFF + AI Service + 前端）" -ForegroundColor Yellow
} else {
  Write-Host "[模式] 快速模式（仅前端 + Mock 数据）" -ForegroundColor Green
}
Write-Host ""

# ===== 快速模式 =====
if (-not $Full) {
  Write-Host "启动 Vite 开发服务器（Mock 模式）..." -ForegroundColor Green
  Write-Host "  前端地址: http://localhost:5173" -ForegroundColor White
  Write-Host "  Mock 评测: 返回固定 78/100 分" -ForegroundColor Gray
  Write-Host ""
  Write-Host "提示: 运行 .\start-dev.ps1 -Full 启动完整后端" -ForegroundColor DarkGray
  Write-Host ""

  Push-Location "$ProjectRoot\apps\web"
  npx vite --port 5173
  Pop-Location
  exit
}

# ===== 完整模式 =====

# 1. 检查 Docker
Write-Host "[1/6] 检查 Docker..." -ForegroundColor Yellow
$dockerOk = docker info 2>$null
if (-not $dockerOk) {
  Write-Host "  ✗ Docker 未运行，请先启动 Docker Desktop" -ForegroundColor Red
  exit 1
}
Write-Host "  ✓ Docker 正常" -ForegroundColor Green

# 2. 启动基础设施
Write-Host "[2/6] 启动基础设施（PostgreSQL + MinIO + Redis）..." -ForegroundColor Yellow
Push-Location $ProjectRoot
docker compose up -d postgres minio redis
Pop-Location
Start-Sleep -Seconds 3
Write-Host "  ✓ PostgreSQL : localhost:5432" -ForegroundColor Green
Write-Host "  ✓ MinIO      : localhost:9000 (控制台 :9001)" -ForegroundColor Green
Write-Host "  ✓ Redis      : localhost:6379" -ForegroundColor Green

# 3. Prisma 迁移 + Seed
Write-Host "[3/6] 数据库迁移 + 种子数据..." -ForegroundColor Yellow
Push-Location "$ProjectRoot\apps\api-bff"
npx prisma migrate dev --name init 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "  迁移已存在，跳过..." -ForegroundColor DarkGray
}
npx prisma generate
npx tsx prisma/seed.ts
Pop-Location
Write-Host "  ✓ 数据库就绪" -ForegroundColor Green

# 4. 启动 AI Service（如果有 Python）
Write-Host "[4/6] 启动 AI Service (FastAPI)..." -ForegroundColor Yellow
Push-Location "$ProjectRoot\services\ai-svc"
$pythonOk = Get-Command python -ErrorAction SilentlyContinue
if ($pythonOk) {
  # 尝试启动（后台进程）
  Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "app.main:app", "--port", "8000" -WindowStyle Minimized
  Write-Host "  ✓ AI Service : localhost:8000" -ForegroundColor Green
} else {
  Write-Host "  ⚠ Python 未安装，跳过 AI Service（BFF 将使用 Mock 评测）" -ForegroundColor DarkYellow
}
Pop-Location

# 5. 启动 BFF
Write-Host "[5/6] 启动 BFF (NestJS)..." -ForegroundColor Yellow
Push-Location "$ProjectRoot\apps\api-bff"
# 设置环境变量
if ($WithChivox) {
  Write-Host "  驰声评测: 已启用（需在 .env 中填写 CHIVOX_APP_ID/SECRET）" -ForegroundColor Magenta
}
Start-Process -FilePath "npx" -ArgumentList "tsx", "watch", "src/main.ts" -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 2
Write-Host "  ✓ BFF        : localhost:3000" -ForegroundColor Green

# 6. 启动前端（Proxy 模式）
Write-Host "[6/6] 启动前端 (Vite + Proxy 模式)..." -ForegroundColor Yellow
# 更新 .env 启用真实 BFF
$envContent = Get-Content "$ProjectRoot\apps\web\.env" -Raw
$envContent = $envContent -replace 'VITE_USE_REAL_BFF=false', 'VITE_USE_REAL_BFF=true'
Set-Content "$ProjectRoot\apps\web\.env" -Value $envContent -Encoding UTF8

Push-Location "$ProjectRoot\apps\web"
Write-Host "  ✓ 前端       : localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  所有服务已启动！" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  前端:     http://localhost:5173" -ForegroundColor White
Write-Host "  BFF:      http://localhost:3000/api" -ForegroundColor White
Write-Host "  AI Service: http://localhost:8000" -ForegroundColor White
Write-Host "  MinIO:    http://localhost:9001" -ForegroundColor White
Write-Host ""
Write-Host "  按 Ctrl+C 停止前端。" -ForegroundColor DarkGray
Write-Host "  Docker 基础设施: docker compose down" -ForegroundColor DarkGray
Write-Host ""
npx vite --port 5173
Pop-Location
