import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateBusinessAudioTour {
  @IsString()
  @IsOptional()
  name: string;

  @IsUrl()
  @IsOptional()
  linkUrl: string;

  @IsString()
  @IsOptional()
  businessId: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}