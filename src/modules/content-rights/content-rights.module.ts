import { Module } from '@nestjs/common';
import { ContentRightsController } from './content-rights.controller';
import { ContentRightsService } from './content-rights.service';
import { ContentRightsRepository } from './content-rights.repository';
@Module({controllers:[ContentRightsController],providers:[ContentRightsService,ContentRightsRepository],exports:[ContentRightsService]})export class ContentRightsModule{}
