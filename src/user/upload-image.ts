// src/images/dto/upload-base64.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadBase64Dto {
  @IsString()
  // Accepts "iVBORw0..." OR "data:image/png;base64,iVBORw0..."
  @MaxLength(10_000_000) // guard against huge inputs
  data!: string;

  @IsOptional()
  @IsString()
  folder?: string; // e.g., "avatars"
  
  @IsOptional()
  @IsString()
  fileName?: string; // e.g., "avatars"
}
