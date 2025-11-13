import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBusinessQuestionsDto{

    @IsString()
    @IsNotEmpty()
    business_id: string;

    @IsString()
    @IsNotEmpty()
    question: string;

    @IsOptional()
    @IsString()
    answer: string;

    @IsOptional()
    @IsBoolean()
    active: boolean;

    @IsOptional()
    @IsBoolean()
    show_name: boolean;
}