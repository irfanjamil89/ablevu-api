import { IsNotEmpty, IsString } from 'class-validator';

export class AutocompleteQueryDto {
  @IsString()
  @IsNotEmpty()
  input: string;
}
