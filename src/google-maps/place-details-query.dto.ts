import { IsNotEmpty, IsString } from 'class-validator';

export class PlaceDetailsQueryDto {
  @IsString()
  @IsNotEmpty()
  placeId: string;
}
