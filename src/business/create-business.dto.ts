import { IsOptional, IsString, IsEmail, IsNumber } from 'class-validator';

export class CreateBusinessDto {
  @IsString() 
  name: string;

  @IsString() 
  description?: string;

  @IsString() 
  address?: string;

  @IsString() 
  city?: string;

  @IsString() 
  state?: string;

  @IsString() 
  country?: string;

  @IsString() 
  zipcode?: string;

  @IsOptional() 
  @IsString() 
  website?: string;

  @IsOptional() 
  @IsEmail() 
  email?: string;

  @IsOptional() 
  @IsString() 
  phone_number?: string;

  @IsOptional() 
  @IsString() 
  facebook_link?: string;

  @IsOptional() 
  @IsString() 
  instagram_link?: string;

  @IsOptional() 
  @IsString() 
  logo_url?: string;

  @IsOptional() 
  @IsString() 
  marker_image_url?: string;

  @IsOptional() 
  @IsString() 
  place_id?: string;

  @IsOptional() 
  @IsNumber() 
  latitude?: number;

  @IsOptional() 
  @IsNumber() 
  longitude?: number;

  @IsOptional() 
  @IsString() 
  promo_code?: string;

}
