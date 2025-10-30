import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString( )
  token: string;

  @IsString({ message: 'Invalid email or password' })
  @MinLength(6, { message: 'Invalid email or password' })
  newPassword: string;
}
