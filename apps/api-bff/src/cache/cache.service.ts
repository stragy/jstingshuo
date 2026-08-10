import { Injectable } from '@nestjs/common';

// 内存缓存服务（无 Redis 环境下的替代方案）
// 生产环境可替换为 Redis 实现
@Injectable()
export class CacheService {
  private store = new Map<string, { value: unknown; expireAt: number | null }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expireAt !== null && Date.now() > entry.expireAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const expireAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expireAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
