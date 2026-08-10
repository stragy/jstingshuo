// 种子数据：测试用户 + 练习记录 + 能力诊断
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 测试用户
  const password = await bcrypt.hash('123456', 10);
  const user = await prisma.user.upsert({
    where: { username: 'test' },
    update: {},
    create: {
      username: 'test',
      password,
      name: '测试同学',
      grade: '八年级',
      targetScore: 85,
    },
  });

  // 练习记录
  const records = [
    { type: 'listening', title: '听力短对话训练 - Shopping', score: 82, duration: 360 },
    { type: 'reading', title: '朗读短文 - My Hometown', score: 88, duration: 240 },
    { type: 'dialogue', title: '情景对话 - 问路与指路', score: 75, duration: 480 },
    { type: 'vocab', title: '词汇跟读 - Unit 1 重点词汇', score: 90, duration: 180 },
    { type: 'listening', title: '听力长对话训练 - School Life', score: 79, duration: 420 },
    { type: 'reading', title: '朗读短文 - A Trip to Beijing', score: 85, duration: 300 },
  ];
  for (const r of records) {
    await prisma.practiceRecord.create({
      data: { ...r, userId: user.id },
    });
  }

  // 能力诊断
  await prisma.diagnosis.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      listening: 78,
      pronunciation: 72,
      vocabulary: 85,
      grammar: 80,
      fluency: 70,
    },
  });

  console.log('✅ 种子数据已创建，用户ID:', user.id);
}

main()
  .catch((e) => {
    console.error('种子数据创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
