"""应用配置：从环境变量读取驰声凭据和服务端口。"""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    """全局配置项。"""

    port: int
    chivox_app_id: str
    chivox_app_secret: str
    chivox_endpoint: str

    @property
    def chivox_configured(self) -> bool:
        """判断驰声凭据是否完整配置。"""
        return bool(self.chivox_app_id and self.chivox_app_secret)


def load_settings() -> Settings:
    """从环境变量加载配置。"""
    return Settings(
        port=int(os.getenv("PORT", "8000")),
        chivox_app_id=os.getenv("CHIVOX_APP_ID", "").strip(),
        chivox_app_secret=os.getenv("CHIVOX_APP_SECRET", "").strip(),
        chivox_endpoint=os.getenv(
            "CHIVOX_ENDPOINT", "https://api.chivox.com/cloud/eval/v2"
        ).strip(),
    )


# 全局配置单例
settings = load_settings()
