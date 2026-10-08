import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class CineproMovieDto {
 @IsString() @Matches(/^\d{1,12}$/) id:string;
}
export class CineproEpisodeDto extends CineproMovieDto {
 @Type(()=>Number) @IsInt() @Min(1) season:number;
 @Type(()=>Number) @IsInt() @Min(1) episode:number;
}
