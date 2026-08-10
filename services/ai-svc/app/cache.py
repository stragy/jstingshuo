"""简单的内存缓存，基于 dict + TTL 实现，替代 Redis。"""

import time
from typing import Any


class MemoryCache:
    """带 TTL 的线程非安全内存缓存。"""

    def __init__(self, default_ttl: int = 300) -> None:
        self._store: dict[str, tuple[Any, float]] = {}
        self.default_ttl = default_ttl

    def get(self, key: str) -> Any | None:
        """获取缓存值，过期则删除并返回 None。"""
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expire_at = entry
        if time.time() > expire_at:
            self._store.pop(key, None)
            return None
        return value

    def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        """写入缓存。"""
        expire_at = time.time() + (ttl if ttl is not None else self.default_ttl)
        self._store[key] = (value, expire_at)

    def clear(self) -> None:
        """清空缓存。"""
        self._store.clear()


# 全局缓存实例
cache = MemoryCache()
