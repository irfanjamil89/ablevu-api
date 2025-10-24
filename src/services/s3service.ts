// src/s3/s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class S3Service {
  private readonly bucket = process.env.S3_BUCKET!;
  private readonly publicBase = process.env.S3_PUBLIC_BASE; // optional

  constructor(private readonly s3: S3Client) {}

  async uploadRawBuffer(opts: {
    buffer: Buffer;
    contentType: string;
    folder?: string;
    extension?: string; // e.g., ".png"
    fileName: string; // custom name without extension
  }) {
    const folder = opts.folder ?? 'images';
    const ext = opts.extension?.startsWith('.') ? opts.extension : opts.extension ? `.${opts.extension}` : '';
    const key = `${folder}/${opts.fileName}${ext}`;

    const uploader = new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: opts.buffer,
        ContentType: opts.contentType,
      },
    });
    await uploader.done();

    return {
      key,
      url: this.publicBase ? `${this.publicBase}/${key}` : undefined,
      contentType: opts.contentType,
    };
  }
}
