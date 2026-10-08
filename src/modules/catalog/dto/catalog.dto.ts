import { IsIn,IsOptional,IsString,MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/pagination.dto';
export class CatalogQueryDto extends PaginationDto{
 @IsOptional() @IsString() @MaxLength(100) category?:string;
 @IsOptional() @IsString() @MaxLength(5) country?:string;
 @IsOptional() @IsString() @MaxLength(80) language?:string;
 @IsOptional() @IsString() @MaxLength(120) search?:string;
}
export class SourceQueryDto{@IsOptional() @IsIn(['movie','tv']) kind?:'movie'|'tv';}
