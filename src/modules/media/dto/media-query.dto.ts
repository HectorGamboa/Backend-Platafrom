import { IsIn,IsOptional,IsString,MaxLength,Matches } from 'class-validator';
export class MediaQueryDto {
 @IsIn(['movie','tv','channel']) kind:'movie'|'tv'|'channel';
 @IsString() @MaxLength(120) contentId:string;
 @IsOptional() @Matches(/^[A-Z]{2}$/) territory?:string;
}