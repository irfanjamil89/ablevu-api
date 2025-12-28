// src/images/images.controller.ts (add endpoint)
import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { fileTypeFromBuffer } from 'file-type';
import { S3Service } from 'src/services/s3service';
import { UploadBase64Dto } from './upload-image';
import { randomUUID } from 'crypto';
import { User } from 'src/entity/user.entity';
import { Business } from 'src/entity/business.entity';
import { BusinessImages } from 'src/entity/business_images.entity';
import { Partner } from 'src/entity/partner.entity';
import { AccessibleCity } from 'src/entity/accessible_city.entity';
import { BusinessReviews } from 'src/entity/business_reviews.entity';
import { UploadBase64MultipleDto } from './upload-review-images.dto';


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
  private readonly logger = new Logger(ImagesController.name);
  constructor(
    private readonly s3: S3Service,
    
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,

    @InjectRepository(BusinessImages)
    private readonly businessImagesRepo: Repository<BusinessImages>,

    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,

    @InjectRepository(AccessibleCity)
    private readonly cityRepo: Repository<AccessibleCity>,

    @InjectRepository(BusinessReviews)
    private readonly businessReviewsRepo: Repository<BusinessReviews>,
    
  ) {}

  @Post('upload-base64')
  async uploadBase64(@Body() dto: UploadBase64Dto) {
    this.logger.log(`Starting image upload via base64 ${dto.fileName ?? ''}`);
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
    this.logger.log(`Invalid base64 payload ${dto.fileName ?? ''}`);

      throw new BadRequestException('Invalid base64 payload');
    }

    // 3) Decode to Buffer
    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64, 'base64');
    } catch {
    this.logger.log(`Unable to decode base64 ${dto.fileName ?? ''}`);

      throw new BadRequestException('Unable to decode base64');
    }

    // 4) Enforce size
    if (!buffer?.length) throw new BadRequestException('Empty image');
    if (buffer.length > MAX_SIZE_BYTES) {
    this.logger.log(`Image too large  ${dto.fileName ?? ''}`);

      throw new BadRequestException(`Image too large (max ${Math.round(MAX_SIZE_BYTES / 1024 / 1024)}MB)`);
    }

    // 5) Sniff real type from bytes
    const ft = await fileTypeFromBuffer(buffer);
    const realMime = ft?.mime ?? declaredMime; // prefer sniffed
    const ext = ft?.ext;

    if (!realMime) {
    this.logger.log(`Unable to detect image type  ${dto.fileName ?? ''}`);

      throw new BadRequestException('Unable to detect image type');
    }
    if (!ALLOWED_MIME.has(realMime)) {
    this.logger.log(`Unsupported image type  ${dto.fileName ?? ''}`);

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
    this.logger.log(`Upload success  ${dto.fileName ?? ''}`);

    const imageUrl = (res as any).url;

    if (!dto.fileName) {
  throw new BadRequestException(
    'fileName is required',
  );
}
    if (dto.folder === 'user') {
  await this.userRepo.update(dto.fileName, {
    profile_picture_url: imageUrl,
  });
} else if (dto.folder === 'business'){
  await this.businessRepo.update(dto.fileName, {
    logo_url: imageUrl,
  });
}
  else if (dto.folder === 'business-images'){
    await this .businessImagesRepo.update(dto.fileName,{
      image_url: imageUrl,
    });
} 
  else if (dto.folder === 'partner'){
    await this.partnerRepo.update(dto.fileName,{
      image_url: imageUrl,
    });
} 
  else if (dto.folder === 'accessible-city'){
    await this.cityRepo.update(dto.fileName,{
      picture_url: imageUrl,
    });
}
    return { ok: true, ...res, size: buffer.length };
  }
  @Post('upload-base64-multiple')
  async uploadBase64Multiple(@Body() dto: UploadBase64MultipleDto) {
    this.logger.log(
      `Starting multiple image upload for ${dto.fileName ?? 'unknown'}, count: ${dto.images.length}`,
    );

    if (!dto.fileName) {
      throw new BadRequestException('fileName is required');
    }

    const uploadedUrls: string[] = [];
    for (let i = 0; i < dto.images.length; i++) {
      try {

        let base64 = dto.images[i].trim();
        let declaredMime: string | undefined;

        const dataUrlMatch = base64.match(/^data:([a-z0-9-+/.]+);base64,(.*)$/i);
        if (dataUrlMatch) {
          declaredMime = dataUrlMatch[1];
          base64 = dataUrlMatch[2];
        }

        // 2) Basic sanity check
        if (!/^[A-Za-z0-9+/=\s]+$/.test(base64)) {
          this.logger.warn(`Invalid base64 payload for image ${i + 1}, skipping`);
          continue;
        }

        // 3) Decode to Buffer
        let buffer: Buffer;
        try {
          buffer = Buffer.from(base64, 'base64');
        } catch {
          this.logger.warn(`Unable to decode base64 for image ${i + 1}, skipping`);
          continue;
        }

        // 4) Enforce size
        if (!buffer?.length) {
          this.logger.warn(`Empty image ${i + 1}, skipping`);
          continue;
        }
        if (buffer.length > MAX_SIZE_BYTES) {
          this.logger.warn(`Image ${i + 1} too large, skipping`);
          continue;
        }

        // 5) Sniff real type from bytes
        const ft = await fileTypeFromBuffer(buffer);
        const realMime = ft?.mime ?? declaredMime;
        const ext = ft?.ext;

        if (!realMime) {
          this.logger.warn(`Unable to detect image type for image ${i + 1}, skipping`);
          continue;
        }
        if (!ALLOWED_MIME.has(realMime)) {
          this.logger.warn(`Unsupported image type for image ${i + 1}: ${realMime}, skipping`);
          continue;
        }

        // 6) Upload to S3
        const uniqueId = `${dto.fileName}-${randomUUID()}`;
        const res = await this.s3.uploadRawBuffer({
          buffer,
          contentType: realMime,
          folder: dto.folder ?? 'business-reviews',
          extension: ext,
          fileName: uniqueId,
        });

        const cleanedUrl = (res as any).url
          .replace(/\/{2,}/g, '/')
          .replace('https:/', 'https://');

        uploadedUrls.push(cleanedUrl);
        this.logger.log(`Image ${i + 1} uploaded successfully`);
      } catch (error) {
        this.logger.error(`Error processing image ${i + 1}:`, error);
        // Continue with next image
      }
    }

    if (uploadedUrls.length === 0) {
      throw new BadRequestException('No images were successfully uploaded');
    }

    // Update database
    if (dto.folder === 'business-reviews') {
      const review = await this.businessReviewsRepo.findOne({
        where: { id: dto.fileName },
      });

      let existingImages: string[] = [];
      if (review?.image_url) {
        try {
          existingImages = JSON.parse(review.image_url);
        } catch {
          existingImages = [];
        }
      }

      const allImages = [...existingImages, ...uploadedUrls];

      await this.businessReviewsRepo.update(dto.fileName, {
        image_url: JSON.stringify(allImages),
      });

      this.logger.log(
        `Updated review ${dto.fileName} with ${uploadedUrls.length} new images`,
      );
    }

    return {
      ok: true,
      uploadedCount: uploadedUrls.length,
      totalRequested: dto.images.length,
      urls: uploadedUrls,
    };
  }
}