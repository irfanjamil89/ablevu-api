import { IsNotEmpty, IsNumberString } from 'class-validator';

export class ReverseGeocodeQueryDto {
  @IsNumberString()
  @IsNotEmpty()
  lat: string;

  @IsNumberString()
  @IsNotEmpty()
  lng: string;
}
