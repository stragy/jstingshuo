// 根据 DATABASE_PROVIDER 环境变量在构建期改写 prisma/schema.prisma 的 provider 字段
// 用途：开发默认 sqlite；生产设置 DATABASE_PROVIDER=postgresql 即可切换到 PostgreSQL
// 用法：node scripts/switch-provider.mjs && prisma generate
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

const provider = process.env.DATABASE_PROVIDER || 'sqlite';
if (!['sqlite', 'postgresql'].includes(provider)) {
  console.error(`[switch-provider] 不支持的 provider: ${provider}（仅支持 sqlite / postgresql）`);
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');
const replaced = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql)"/,
  `provider = "${provider}"`,
);

if (replaced !== schema) {
  fs.writeFileSync(schemaPath, replaced);
  console.log(`[switch-provider] schema provider 已切换为: ${provider}`);
} else {
  console.log(`[switch-provider] schema provider 已为: ${provider}（无需改动）`);
}
