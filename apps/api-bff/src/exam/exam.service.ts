import { Injectable } from '@nestjs/common';

// 试卷服务（数据为内置 mock，后续可接入题库服务）
@Injectable()
export class ExamService {
  private readonly exams = [
    {
      id: 'e1',
      year: '2024',
      title: '2024 年中考英语听说真题',
      type: 'listening',
      questionCount: 20,
      duration: 1200,
      difficulty: 'medium',
    },
    {
      id: 'e2',
      year: '2023',
      title: '2023 年中考英语听说真题',
      type: 'listening',
      questionCount: 20,
      duration: 1200,
      difficulty: 'medium',
    },
    {
      id: 'e3',
      year: '2024',
      title: '2024 八年级期末听说模拟',
      type: 'mixed',
      questionCount: 15,
      duration: 900,
      difficulty: 'easy',
    },
    {
      id: 'e4',
      year: '2024',
      title: '2024 中考听说全真模拟卷一',
      type: 'mixed',
      questionCount: 25,
      duration: 1500,
      difficulty: 'hard',
    },
    {
      id: 'e5',
      year: '2023',
      title: '2023 八年级期中听说模拟',
      type: 'reading',
      questionCount: 10,
      duration: 600,
      difficulty: 'easy',
    },
  ];

  // 试卷列表，支持按年份筛选
  async getList(year?: string) {
    const list = year ? this.exams.filter((e) => e.year === year) : this.exams;
    return { list, total: list.length };
  }
}
