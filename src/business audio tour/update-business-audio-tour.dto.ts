import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class UpdateBusinessAudioTour {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  linkUrl?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  // REMOVED businessId - you shouldn't change the business after creation
}