import { IsBoolean,IsDateString,IsIn,IsString,IsUrl,MaxLength,MinLength } from 'class-validator';
export class CreateLicensedSourceDto{
 @IsString() @MinLength(1) @MaxLength(120) contentId:string;
 @IsIn(['movie','tv','channel','episode']) kind:string;
 @IsUrl({require_tld:true,protocols:['https'],require_protocol:true}) playbackUrl:string;
 @IsString() @MinLength(2) @MaxLength(200) rightsHolder:string;
 @IsString() @MinLength(4) @MaxLength(200) licenseReference:string;
 @IsString() @MaxLength(5) territory:string;
 @IsBoolean() allowedCommercialUse:boolean;
 @IsDateString() validFrom:string;
 @IsDateString() validUntil:string;
}