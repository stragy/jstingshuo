import { IsString, MinLength } from 'class-validator';

// 注册请求 DTO
export class RegisterDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6, { message: '密码至少 6 位' })
  password: string;

  @IsString()
  name: string;

  @IsString()
  grade: string; // 年级，如「八年级」
}

// 登录请求 DTO
export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
