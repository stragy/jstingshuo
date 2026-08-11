/* ==========================================================================
   mock-data.js —— Mock 数据（用于 VITE_USE_REAL_BFF=false 模式）
   每个页面从本模块取数后渲染到 DOM。
   ========================================================================== */

/** 5 个能力维度（统一字段，供首页 mini 雷达与诊断页大雷达复用） */
export const SKILL_DIMENSIONS = [
  { key: 'listening',  name: '听力理解', score: 78, weak: false, weakTags: ['主旨题'] },
  { key: 'pronounce',  name: '语音语调', score: 65, weak: true,  weakTags: ['连读弱读', '语调起伏'] },
  { key: 'vocab',      name: '词汇运用', score: 72, weak: false, weakTags: ['搭配辨析'] },
  { key: 'grammar',    name: '语法结构', score: 80, weak: false, weakTags: [] },
  { key: 'fluency',    name: '流利度',   score: 58, weak: true,  weakTags: ['停顿过多', '语速不稳'] },
]

/* ── 学生首页 ── */
export const homeData = {
  /** 距离目标分数的差距 */
  progress: {
    target: 85,
    current: 72,
    gap: 13,
  },
  /** 2x2 统计网格 */
  stats: [
    { label: '练习天数',   value: '12', suffix: '天' },
    { label: '完成题数',   value: '86', suffix: '题' },
    { label: '平均分',     value: '76', suffix: '分' },
    { label: '连续打卡',   value: '7',  suffix: '天' },
  ],
  /** AI 推荐任务（横向滑动卡片） */
  recommendedTasks: [
    {
      id: 't1',
      title: '连读与弱读专项训练',
      typeLabel: '语音',
      type: 'pronounce',
      difficulty: 3,
      duration: '约 8 分钟',
    },
    {
      id: 't2',
      title: '中考高频听力·主旨题',
      typeLabel: '听力',
      type: 'listening',
      difficulty: 2,
      duration: '约 10 分钟',
    },
    {
      id: 't3',
      title: '话题口语·介绍家乡',
      typeLabel: '口语',
      type: 'fluency',
      difficulty: 4,
      duration: '约 12 分钟',
    },
    {
      id: 't4',
      title: '词汇运用·核心搭配',
      typeLabel: '词汇',
      type: 'vocab',
      difficulty: 2,
      duration: '约 6 分钟',
    },
  ],
  /** 能力雷达 mini（复用 SKILL_DIMENSIONS） */
  radar: SKILL_DIMENSIONS,
}

/* ── 能力诊断 ── */
export const diagnosisData = {
  dimensions: SKILL_DIMENSIONS,
}

/* ── 定向练习 ── */
export const practiceData = {
  /** 筛选 chips（可单选） */
  filters: [
    { key: 'all',       label: '全部' },
    { key: 'listening', label: '听力' },
    { key: 'reading',   label: '朗读' },
    { key: 'dialog',    label: '对话' },
    { key: 'vocab',     label: '词汇' },
  ],
  /** 练习卡片 */
  items: [
    {
      id: 'p1',
      title: '连读与弱读：日常对话短句',
      typeLabel: '朗读',
      type: 'reading',
      difficulty: 3,
      reason: '语音语调弱项，连读准确率仅 62%',
    },
    {
      id: 'p2',
      title: '听力·主旨大意 5 题',
      typeLabel: '听力',
      type: 'listening',
      difficulty: 2,
      reason: '主旨题错误率较高，需强化整体理解',
    },
    {
      id: 'p3',
      title: '话题对话：谈论周末计划',
      typeLabel: '对话',
      type: 'dialog',
      difficulty: 4,
      reason: '流利度偏弱，通过情景对话提升连贯表达',
    },
    {
      id: 'p4',
      title: '核心词汇搭配辨析',
      typeLabel: '词汇',
      type: 'vocab',
      difficulty: 2,
      reason: '词汇运用中的搭配辨析待巩固',
    },
    {
      id: 'p5',
      title: '朗读短文：环境保护',
      typeLabel: '朗读',
      type: 'reading',
      difficulty: 3,
      reason: '语调起伏不足，朗读训练改善韵律',
    },
  ],
}

/* ── 模拟考试 ── */
export const examData = {
  /** 年份筛选 chips */
  years: [
    { key: '2024', label: '2024' },
    { key: '2023', label: '2023' },
    { key: '2022', label: '2022' },
    { key: 'all',  label: '全部' },
  ],
  /** 试卷卡片 */
  papers: [
    {
      id: 'e1',
      title: '2024 年中考英语听说真题卷（一）',
      year: 2024,
      duration: 30,
      questionCount: 20,
      status: 'done',
      score: 82,
      progress: 100,
    },
    {
      id: 'e2',
      title: '2024 年中考英语听说真题卷（二）',
      year: 2024,
      duration: 30,
      questionCount: 20,
      status: 'doing',
      progress: 45,
    },
    {
      id: 'e3',
      title: '2023 年中考英语听说真题卷（一）',
      year: 2023,
      duration: 28,
      questionCount: 18,
      status: 'done',
      score: 76,
      progress: 100,
    },
    {
      id: 'e4',
      title: '2023 年中考英语听说真题卷（二）',
      year: 2023,
      duration: 28,
      questionCount: 18,
      status: 'todo',
    },
    {
      id: 'e5',
      title: '2022 年中考英语听说真题卷',
      year: 2022,
      duration: 25,
      questionCount: 16,
      status: 'todo',
    },
  ],
  /** 考试流程预览说明 */
  flowSteps: [
    '进入考试后请佩戴耳机，确认录音设备正常。',
    '按题目顺序完成听力、朗读、对话三大模块作答。',
    '系统实时录音并评分，全程请保持环境安静。',
    '交卷后即时生成成绩单与错题解析。',
  ],
}

export default {
  SKILL_DIMENSIONS,
  homeData,
  diagnosisData,
  practiceData,
  examData,
}
