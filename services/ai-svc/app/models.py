"""请求与响应的 Pydantic 数据模型。"""

from typing import Any, Literal

from pydantic import BaseModel, Field


class EvalRequest(BaseModel):
    """口语评测请求体。"""

    audio_url: str = Field(..., description="待评测音频的 URL")
    text: str = Field(..., description="对应文本内容")
    type: Literal["reading", "dialogue"] = Field(
        "reading", description="评测类型：reading 朗读 / dialogue 对话"
    )
    user_id: str = Field(..., description="提交评测的用户 ID")


class EvalResponse(BaseModel):
    """口语评测响应体。"""

    score: int = Field(..., description="总分")
    pronunciation: int = Field(..., description="发音得分")
    fluency: int = Field(..., description="流利度得分")
    integrity: int = Field(..., description="完整度得分")
    details: dict[str, Any] = Field(default_factory=dict, description="评测明细")


class HealthResponse(BaseModel):
    """健康检查响应体。"""

    status: str
    service: str
    time: str
    chivox_configured: bool
