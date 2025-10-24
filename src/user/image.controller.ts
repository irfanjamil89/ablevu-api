// src/images/images.controller.ts (add endpoint)
import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import { S3Service } from 'src/services/s3service';
import { UploadBase64Dto } from './upload-image';
import { randomUUID } from 'crypto';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif',
]);

@Controller('images')
export class ImagesController {
  constructor(private readonly s3: S3Service) {}

  @Post('upload-base64')
  async uploadBase64(@Body() dto: UploadBase64Dto) {
    // 1) Unwrap data URL if present
    let base64 = dto.data.trim();
    let declaredMime: string | undefined;

    const dataUrlMatch = base64.match(/^data:([a-z0-9-+/.]+);base64,(.*)$/i);
    if (dataUrlMatch) {
      declaredMime = dataUrlMatch[1];
      base64 = dataUrlMatch[2];
    }

    // 2) Basic sanity check
    if (!/^[A-Za-z0-9+/=\s]+$/.test(base64)) {
      throw new BadRequestException('Invalid base64 payload');
    }

    // 3) Decode to Buffer
    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64, 'base64');
    } catch {
      throw new BadRequestException('Unable to decode base64');
    }

    // 4) Enforce size
    if (!buffer?.length) throw new BadRequestException('Empty image');
    if (buffer.length > MAX_SIZE_BYTES) {
      throw new BadRequestException(`Image too large (max ${Math.round(MAX_SIZE_BYTES / 1024 / 1024)}MB)`);
    }

    // 5) Sniff real type from bytes
    const ft = await fileTypeFromBuffer(buffer);
    const realMime = ft?.mime ?? declaredMime; // prefer sniffed
    const ext = ft?.ext;

    if (!realMime) {
      throw new BadRequestException('Unable to detect image type');
    }
    if (!ALLOWED_MIME.has(realMime)) {
      throw new BadRequestException(`Unsupported image type: ${realMime}`);
    }

    // 6) Upload to S3
    const res = await this.s3.uploadRawBuffer({
      buffer,
      contentType: realMime,
      folder: dto.folder ?? 'images',
      extension: ext, // e.g., "png",
      fileName : dto.fileName ?? randomUUID().toString(),
    });

    return { ok: true, ...res, size: buffer.length };
  }
}
