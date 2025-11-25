import { IsNotEmpty, IsString, IsBoolean, IsOptional } from "class-validator";

export class CreateRecomendationsDto {
    
    @IsString()
    @IsNotEmpty()
    businessId: string;

   @IsString()
   @IsNotEmpty()
   label: string;

    @IsBoolean()
    @IsOptional()
    active: boolean;
}
