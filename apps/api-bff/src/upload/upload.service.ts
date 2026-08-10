import { Injectable, BadRequestException } from '@nestjs/common';
import { OssService } from '../oss/oss.service';

@Injectable()
export class UploadService {
  constructor(private oss: OssService) {}

  // 上传音频文件，存储到本地 ./uploads 或 MinIO
  async uploadAudio(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('未提供音频文件');
    }
    const result = await this.oss.upload(file.buffer, file.originalname, file.mimetype);
    return {
      url: result.url,
      key: result.key,
      size: result.size,
      mimetype: file.mimetype,
      originalname: file.originalname,
    };
  }
}
