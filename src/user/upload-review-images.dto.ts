// src/images/dto/upload-base64-multiple.dto.ts
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadBase64MultipleDto {
  @IsArray()
  @IsString({ each: true })
  @MaxLength(10_000_000, { each: true })
  images!: string[]; 

  @IsOptional()
  @IsString()
  folder?: string;
  
  @IsOptional()
  @IsString()
  fileName?: string; 
}