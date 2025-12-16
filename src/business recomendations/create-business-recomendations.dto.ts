import { IsNotEmpty, IsString, IsBoolean, IsOptional } from "class-validator";

export class CreateRecomendationsDto {
    
    @IsString()
    @IsNotEmpty()
    businessId: string;

   @IsString()
   @IsOptional()
   label: string;

    @IsBoolean()
    @IsOptional()
    active: boolean;
}
