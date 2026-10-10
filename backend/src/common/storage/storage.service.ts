import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'avatars');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.png';
    const filename = `avatar-${uniqueSuffix}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    // Write file to storage
    await fs.promises.writeFile(filePath, file.buffer);
    this.logger.log(`Avatar stored locally at: ${filePath}`);

    // Return the relative URL or S3 URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/avatars/${filename}`;
  }
}
