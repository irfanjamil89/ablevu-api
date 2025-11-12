import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsUrl } from 'class-validator';

export class CreateBusinessVirtualTour{
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @IsUrl()
  @IsNotEmpty()
  linkUrl: string;

  @IsString()
  @IsNotEmpty()
  businessId: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
