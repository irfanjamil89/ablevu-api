import { IsEmail, IsOptional, IsString, MinLength, IsEnum, IsBoolean } from 'class-validator';
import { UserType } from './user-type.enum';

export class UserDto {
  @IsEmail()
  emailAddress: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEnum(UserType)
  userType: UserType;

  @IsBoolean()
  consent: boolean;

   @IsOptional()
  @IsString()
  external_id: string;

  @IsOptional()
 @IsBoolean()
  archived: boolean;
}