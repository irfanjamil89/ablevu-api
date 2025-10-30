import { ArrayMinSize, IsArray } from 'class-validator';
export class AccessibilityFeatureDto {
    @IsArray()
    @ArrayMinSize(1)
    AccessibilityFeatureID: string[];

}
