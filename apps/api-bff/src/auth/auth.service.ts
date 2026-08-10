import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 注册
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (exists) {
      throw new ConflictException('用户名已存在');
    }
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password,
        name: dto.name,
        grade: dto.grade,
      },
    });
    return this.buildAuthResponse(user);
  }

  // 登录
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return this.buildAuthResponse(user);
  }

  // 构造登录/注册响应（含 JWT）
  private buildAuthResponse(user: {
    id: string;
    username: string;
    name: string;
    grade: string;
    targetScore: number;
  }) {
    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        grade: user.grade,
        targetScore: user.targetScore,
      },
    };
  }

  // 获取当前用户信息
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    // 不返回密码
    const { password, ...rest } = user;
    return rest;
  }
}
