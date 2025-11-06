import { IsOptional, IsString, IsEmail, IsNumber } from 'class-validator';

export class UpdateBusinessDto {

  @IsOptional() 
  @IsString() 
  name?: string;

  @IsOptional() 
  @IsString() 
  description?: string;

  @IsOptional() 
  @IsString() 
  address?: string;

  @IsOptional() 
  @IsString() 
  city?: string;

  @IsOptional() 
  @IsString() 
  state?: string;

  @IsOptional() 
  @IsString() 
  country?: string;

  @IsOptional() 
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
