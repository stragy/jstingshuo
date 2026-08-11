"""FastAPI 应用入口：口语评测服务（ai-svc）。"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .cache import cache
from .chivox import ChivoxClient
from .config import settings
from .models import EvalRequest, EvalResponse, HealthResponse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ai-svc")

# 全局驰声客户端
chivox_client = ChivoxClient(settings)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时打印配置状态。"""
    configured = chivox_client.is_configured()
    logger.info("ai-svc 启动中...")
    logger.info("监听端口：%s", settings.port)
    logger.info("驰声端点：%s", settings.chivox_endpoint)
    logger.info(
        "驰声凭据配置状态：%s",
        "已启用真实评测" if configured else "未配置（Mock 模式）",
    )
    yield
    logger.info("ai-svc 关闭中...")
    await chivox_client.close()
    cache.clear()


app = FastAPI(
    title="ai-svc",
    description="慧听说提分应用 - 口语评测服务",
    version="0.1.0",
    lifespan=lifespan,
)

# 启用 CORS（开发期允许所有来源）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """健康检查端点。"""
    return HealthResponse(
        status="ok",
        service="ai-svc",
        time=datetime.now(timezone.utc).isoformat(),
        chivox_configured=chivox_client.is_configured(),
    )


@app.post("/api/eval", response_model=EvalResponse)
async def eval_endpoint(req: EvalRequest) -> EvalResponse:
    """口语评测端点：驰声真实评测或 Mock 评分。"""
    # 简单缓存：同一 user_id + text 组合复用结果
    cache_key = f"eval:{req.user_id}:{hash(req.text)}"
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info("命中缓存，user_id=%s", req.user_id)
        return EvalResponse(**cached)

    result = await chivox_client.eval(req.audio_url, req.text, req.type)
    cache.set(cache_key, result)
    return EvalResponse(**result)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=False,
    )
