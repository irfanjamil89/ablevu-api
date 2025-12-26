// src/audio/dto/upload-audio.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadAudioDto {
  @IsString()
  @MaxLength(15_000_000) // ~10MB base64 encoded
  data!: string; // Base64 audio data

  @IsOptional()
  @IsString()
  folder?: string; // e.g., "audios", "podcasts"
  
  @IsOptional()
  @IsString()
  fileName?: string; // e.g., "my-audio"
}