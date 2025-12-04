import { IsString } from "class-validator";
export class BusinessStatusDto {
    @IsString()
    business_status: string;
}