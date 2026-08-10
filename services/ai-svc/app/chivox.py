"""驰声（Chivox）口语评测 API 客户端，含签名、真实调用与 Mock 降级。"""

import base64
import hashlib
import hmac
import logging
import random
import time
from typing import Any

import httpx

from .config import Settings

logger = logging.getLogger("ai-svc.chivox")


def _clamp(value: int, low: int = 0, high: int = 100) -> int:
    """将分数限制在 [low, high] 区间。"""
    return max(low, min(high, value))


class ChivoxClient:
    """驰声评测客户端。

    凭据完整时调用真实 API；调用失败或凭据缺失时降级为 Mock 评分。
    """

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._http = httpx.AsyncClient(timeout=30.0)

    def is_configured(self) -> bool:
        """判断驰声凭据是否完整配置。"""
        return self._settings.chivox_configured

    def _sign(self, timestamp: int) -> str:
        """生成驰声 API 签名 token。

        签名规则参考：base64(hmac_sha1(app_secret, app_id + timestamp))
        """
        raw = f"{self._settings.chivox_app_id}{timestamp}".encode("utf-8")
        digest = hmac.new(
            self._settings.chivox_app_secret.encode("utf-8"),
            raw,
            hashlib.sha1,
        ).digest()
        return base64.b64encode(digest).decode("utf-8")

    async def _call_remote(
        self, audio_url: str, text: str, eval_type: str
    ) -> dict[str, Any]:
        """调用驰声真实评测接口。"""
        timestamp = int(time.time())
        token = self._sign(timestamp)
        payload = {
            "appId": self._settings.chivox_app_id,
            "timestamp": timestamp,
            "token": token,
            "audioUrl": audio_url,
            "text": text,
            "type": eval_type,
        }
        resp = await self._http.post(
            self._settings.chivox_endpoint, json=payload
        )
        resp.raise_for_status()
        return resp.json()

    def _mock_score(self, text: str, eval_type: str) -> dict[str, Any]:
        """生成 Mock 评分：基础分 78 + 文本长度微调 + 随机 ±3 扰动。"""
        base = 78
        # 文本越长，给一点小幅加分（最多 +5）
        length_adj = min(len(text) // 10, 5)
        noise = random.randint(-3, 3)
        score = _clamp(base + length_adj + noise)

        pronunciation = _clamp(score + random.randint(-2, 2))
        fluency = _clamp(score + random.randint(-3, 1))
        integrity = _clamp(score + random.randint(-1, 3))

        return {
            "score": score,
            "pronunciation": pronunciation,
            "fluency": fluency,
            "integrity": integrity,
            "details": {
                "mode": "mock",
                "type": eval_type,
                "text_length": len(text),
                "base": base,
                "length_adj": length_adj,
                "noise": noise,
            },
        }

    def _normalize_remote(
        self, result: dict[str, Any], eval_type: str, text: str
    ) -> dict[str, Any]:
        """将驰声返回结构归一化为内部评分模型（字段容错映射）。"""
        score = int(result.get("score", result.get("totalScore", 0)))
        pronunciation = int(
            result.get("pronunciation", result.get("pron_score", score))
        )
        fluency = int(result.get("fluency", result.get("fluency_score", score)))
        integrity = int(
            result.get("integrity", result.get("integrity_score", score))
        )
        return {
            "score": _clamp(score),
            "pronunciation": _clamp(pronunciation),
            "fluency": _clamp(fluency),
            "integrity": _clamp(integrity),
            "details": {
                "mode": "chivox",
                "type": eval_type,
                "text_length": len(text),
                "raw": result,
            },
        }

    async def eval(
        self, audio_url: str, text: str, eval_type: str
    ) -> dict[str, Any]:
        """评测入口：凭据完整则调用驰声，否则直接返回 Mock。"""
        if not self.is_configured():
            logger.info("驰声凭据缺失，使用 Mock 评分")
            return self._mock_score(text, eval_type)

        try:
            result = await self._call_remote(audio_url, text, eval_type)
            logger.info("驰声评测调用成功")
            return self._normalize_remote(result, eval_type, text)
        except Exception as exc:  # noqa: BLE001 - 任何异常都降级 Mock
            logger.warning("驰声评测调用失败，降级 Mock：%s", exc)
            mock = self._mock_score(text, eval_type)
            mock["details"]["fallback_reason"] = str(exc)
            return mock

    async def close(self) -> None:
        """关闭底层 HTTP 客户端。"""
        await self._http.aclose()
