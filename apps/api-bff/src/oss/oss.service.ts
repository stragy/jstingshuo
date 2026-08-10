import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadResult {
  url: string; // 可访问 URL
  key: string; // 存储键名
  size: number; // 文件大小（字节）
}

// 对象存储抽象层
// - 开发环境：本地 ./uploads 目录
// - 生产环境：MinIO（动态加载 minio 客户端，避免开发环境安装该依赖）
@Injectable()
export class OssService {
  private readonly logger = new Logger(OssService.name);
  private readonly type: string;
  private readonly localDir: string;
  private minioClient: any = null;

  constructor() {
    this.type = process.env.OSS_TYPE || 'local';
    this.localDir = process.env.OSS_LOCAL_DIR || './uploads';
    if (this.type === 'local') {
      this.ensureLocalDir();
    }
  }

  private ensureLocalDir(): void {
    if (!fs.existsSync(this.localDir)) {
      fs.mkdirSync(this.localDir, { recursive: true });
    }
  }

  // 懒加载 MinIO 客户端，开发环境无需安装 minio 包
  private getMinioClient(): any {
    if (this.minioClient) return this.minioClient;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Minio = require('minio');
    this.minioClient = new Minio.Client({
      endPoint: process.env.OSS_ENDPOINT || '',
      accessKey: process.env.OSS_ACCESS_KEY || '',
      secretKey: process.env.OSS_SECRET_KEY || '',
    });
    return this.minioClient;
  }

  async upload(file: Buffer, filename: string, contentType?: string): Promise<UploadResult> {
    if (this.type === 'local') {
      return this.uploadLocal(file, filename);
    }
    return this.uploadMinio(file, filename, contentType);
  }

  private async uploadLocal(file: Buffer, filename: string): Promise<UploadResult> {
    this.ensureLocalDir();
    const unique = `${Date.now()}-${filename}`;
    const fp = path.join(this.localDir, unique);
    fs.writeFileSync(fp, file);
    this.logger.log(`本地文件已保存: ${fp}`);
    return {
      url: `/uploads/${unique}`,
      key: unique,
      size: file.length,
    };
  }

  private async uploadMinio(file: Buffer, filename: string, contentType?: string): Promise<UploadResult> {
    const client = this.getMinioClient();
    const bucket = process.env.OSS_BUCKET || 'hui-listening';
    const key = `${Date.now()}-${filename}`;
    await client.putObject(bucket, key, file, file.length, {
      'Content-Type': contentType || 'application/octet-stream',
    });
    const endpoint = process.env.OSS_ENDPOINT || '';
    return {
      url: `https://${endpoint}/${bucket}/${key}`,
      key,
      size: file.length,
    };
  }
}
