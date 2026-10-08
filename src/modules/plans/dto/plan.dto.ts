import { IsBoolean,IsInt,IsOptional,IsString,MaxLength,Min } from 'class-validator';
export class CreatePlanDto{
 @IsString() @MaxLength(100) name:string;
 @IsInt() @Min(0) priceCents:number;
 @IsInt() @Min(1) durationDays:number;
 @IsInt() @Min(1) maxConnections:number;
 @IsOptional() @IsBoolean() isActive?:boolean;
}
export class UpdatePlanDto{
 @IsOptional() @IsString() @MaxLength(100) name?:string;
 @IsOptional() @IsInt() @Min(0) priceCents?:number;
 @IsOptional() @IsInt() @Min(1) durationDays?:number;
 @IsOptional() @IsInt() @Min(1) maxConnections?:number;
 @IsOptional() @IsBoolean() isActive?:boolean;
}