# deploy.ps1 — 生产环境一键部署脚本
#
# 用法：
#   .\deploy.ps1                    # 构建并启动全部服务
#   .\deploy.ps1 -Build             # 重新构建镜像
#   .\deploy.ps1 -Down              # 停止全部服务
#   .\deploy.ps1 -Logs              # 查看日志
#   .\deploy.ps1 -Migrate           # 仅执行数据库迁移
#
# 前置条件：
#   - Docker Desktop 已运行
#   - 已创建 .env.prod 文件（参考 .env.prod.example）

param(
  [switch]$Build,
  [switch]$Down,
  [switch]$Logs,
  [switch]$Migrate
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# 检查 .env.prod
$envFile = "$ProjectRoot\.env.prod"
if (-not (Test-Path $envFile)) {
  Write-Host "未找到 .env.prod 文件，正在从模板创建..." -ForegroundColor Yellow
  Copy-Item "$ProjectRoot\.env.prod.example" $envFile
  Write-Host "已创建 .env.prod，请编辑后重新运行此脚本" -ForegroundColor Yellow
  Write-Host "  notepad $envFile" -ForegroundColor Gray
  exit 0
}

# 停止
if ($Down) {
  Write-Host "停止全部服务..." -ForegroundColor Yellow
  docker compose --env-file .env.prod -f docker-compose.prod.yml down
  Write-Host "已停止。清除数据: docker compose --env-file .env.prod -f docker-compose.prod.yml down -v" -ForegroundColor DarkGray
  exit 0
}

# 日志
if ($Logs) {
  docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f --tail=100
  exit 0
}

# 仅迁移
if ($Migrate) {
  Write-Host "执行数据库迁移..." -ForegroundColor Yellow
  docker compose --env-file .env.prod -f docker-compose.prod.yml exec bff npx prisma migrate deploy
  docker compose --env-file .env.prod -f docker-compose.prod.yml exec bff npx tsx prisma/seed.ts
  Write-Host "迁移完成" -ForegroundColor Green
  exit 0
}

# 检查 Docker
$dockerOk = docker info 2>$null
if (-not $dockerOk) {
  Write-Host "Docker 未运行，请先启动 Docker Desktop" -ForegroundColor Red
  exit 1
}

# 构建 + 启动
if ($Build) {
  Write-Host "重新构建镜像并启动..." -ForegroundColor Yellow
  docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
} else {
  Write-Host "启动服务..." -ForegroundColor Yellow
  docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
}

Start-Sleep -Seconds 5

# 执行数据库迁移
Write-Host "执行数据库迁移..." -ForegroundColor Yellow
docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T bff npx prisma migrate deploy 2>$null
docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T bff npx tsx prisma/seed.ts 2>$null

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  部署完成！" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  前端入口:  http://localhost" -ForegroundColor White
Write-Host "  BFF API:   http://localhost/api/health" -ForegroundColor White
Write-Host "  MinIO:     http://localhost:9001" -ForegroundColor White
Write-Host ""
Write-Host "  查看日志:  .\deploy.ps1 -Logs" -ForegroundColor DarkGray
Write-Host "  停止服务:  .\deploy.ps1 -Down" -ForegroundColor DarkGray
Write-Host ""
