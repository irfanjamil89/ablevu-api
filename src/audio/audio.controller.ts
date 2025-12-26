// src/audio/audio.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
} from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import { S3Service } from 'src/services/s3service';
import { UploadAudioDto } from './upload-audio.dto';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessAudioTour } from '../entity/business_audio_tour.entity';
import { Repository } from 'typeorm';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set([
  'audio/mpeg',      // mp3
  'audio/wav',       // wav
  'audio/wave',      // wav alternative
  'audio/ogg',       // ogg
  'audio/mp4',       // m4a
  'audio/aac',       // aac
  'audio/webm',      // webm
  'video/webm',      // video/webm
  'audio/x-m4a',     // m4a alternative
]);

@Controller('audio')
export class AudioController {
  private readonly logger = new Logger(AudioController.name);

  constructor(private readonly s3: S3Service,
    @InjectRepository(BusinessAudioTour)
    private readonly audioRepo: Repository<BusinessAudioTour>
  ) {

  }

  @Post('upload-base64')
  async uploadBase64(@Body() dto: UploadAudioDto) {
    this.logger.log(`Starting audio upload via base64: ${dto.fileName ?? 'unnamed'}`);

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
      this.logger.log(`Invalid base64 payload: ${dto.fileName ?? 'unnamed'}`);
      throw new BadRequestException('Invalid base64 payload');
    }

    // 3) Decode to Buffer
    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64, 'base64');
    } catch {
      this.logger.log(`Unable to decode base64: ${dto.fileName ?? 'unnamed'}`);
      throw new BadRequestException('Unable to decode base64');
    }

    // 4) Enforce size
    if (!buffer?.length) throw new BadRequestException('Empty audio file');
    if (buffer.length > MAX_SIZE_BYTES) {
      this.logger.log(`Audio too large: ${dto.fileName ?? 'unnamed'}`);
      throw new BadRequestException(
        `Audio too large (max ${Math.round(MAX_SIZE_BYTES / 1024 / 1024)}MB)`
      );
    }

    // 5) Sniff real type from bytes
    const ft = await fileTypeFromBuffer(buffer);
    const realMime = ft?.mime ?? declaredMime;
    const ext = ft?.ext;

    if (!realMime) {
      this.logger.log(`Unable to detect audio type: ${dto.fileName ?? 'unnamed'}`);
      throw new BadRequestException('Unable to detect audio type');
    }

    if (!ALLOWED_MIME.has(realMime)) {
      this.logger.log(`Unsupported audio type: ${realMime} - ${dto.fileName ?? 'unnamed'}`);
      throw new BadRequestException(`Unsupported audio type: ${realMime}`);
    }

    // 6) Upload to S3
    const res = await this.s3.uploadRawBuffer({
      buffer,
      contentType: realMime,
      folder: dto.folder ?? 'audios',
      extension: ext,
      fileName: dto.fileName ?? randomUUID().toString(),
    });



    this.logger.log(`Upload success: ${dto.fileName ?? 'unnamed'}`);



    const linkUrl = (res as any).url;

    if (!dto.fileName) {
      throw new BadRequestException(
        'fileName is required',
      );
    }
    if (dto.folder === 'audios') {
      await this.audioRepo.update(dto.fileName, {
        link_url: linkUrl,
      });


      return {
        ok: true,
        ...res,
        size: buffer.length
      };
    }
  }
}