import {Type} from 'class-transformer';
import {ArrayMaxSize,ArrayMinSize,IsArray,IsBoolean,IsDateString,IsIn,IsString,IsUrl,MaxLength,MinLength,ValidateNested} from 'class-validator';
export class MediaImportItemDto {
 @IsIn(['channel','movie','tv','episode']) kind:string;
 @IsString() @MinLength(1) @MaxLength(120) contentId:string;
 @IsUrl({require_protocol:true,protocols:['https']}) playbackUrl:string;
}
export class MediaBulkImportDto {
 @IsArray() @ArrayMinSize(1) @ArrayMaxSize(500)
 @ValidateNested({each:true}) @Type(()=>MediaImportItemDto)
 entries:MediaImportItemDto[];
 @IsString() @MinLength(2) @MaxLength(200) rightsHolder:string;
 @IsString() @MinLength(4) @MaxLength(200) licenseReference:string;
 @IsString() @MaxLength(5) territory:string;
 @IsBoolean() allowedCommercialUse:boolean;
 @IsDateString() validFrom:string;
 @IsDateString() validUntil:string;
}