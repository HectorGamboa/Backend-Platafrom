import { Controller,Get,Param,Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogQueryDto } from './dto/catalog.dto';
import { Public } from '../../common/public.decorator';
@Controller('catalog') export class CatalogController{
 constructor(private readonly service:CatalogService){}
 @Public() @Get('movies/genres') movieGenres(){return this.service.movieGenres();}
 @Public() @Get('movies/:category') movies(@Param('category') category:string,@Query() q:CatalogQueryDto){return this.service.movies(category,q);}
 @Public() @Get('movie/:id') movie(@Param('id') id:string){return this.service.details('movie',id);}
 @Public() @Get('series/genres') tvGenres(){return this.service.tvGenres();}
 @Public() @Get('series/:category') series(@Param('category') category:string,@Query() q:CatalogQueryDto){return this.service.series(category,q);}
 @Public() @Get('series-detail/:id') seriesDetails(@Param('id') id:string){return this.service.details('tv',id);}
 @Public() @Get('search') search(@Query() q:CatalogQueryDto){return this.service.search(q);}
 @Public() @Get('tv/categories') categories(){return this.service.categories();}
 @Public() @Get('tv/channels') channels(@Query() q:CatalogQueryDto){return this.service.live(q);}
}