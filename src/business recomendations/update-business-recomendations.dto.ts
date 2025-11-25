import { IsString, IsBoolean, IsOptional } from "class-validator";

export class UpdateRecomendationsDto {
    
    @IsString()
    @IsOptional()
    businessId: string;

   @IsString()
   @IsOptional()
   label: string;

    @IsBoolean()
    @IsOptional()
    active: boolean;
}
