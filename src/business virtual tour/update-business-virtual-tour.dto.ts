import { IsString, IsOptional, IsBoolean, IsInt, IsUrl } from 'class-validator';

export class UpdateBusinessVirtualTour {
  @IsString()
  @IsOptional()
  name: string;

  @IsInt()
  @IsOptional()
  displayOrder: number;

  @IsUrl()
  @IsOptional()
  linkUrl: string;

  @IsString()
  @IsOptional()
  businessId: string;

  @IsBoolean()
  @IsOptional()
  active: boolean;
}
