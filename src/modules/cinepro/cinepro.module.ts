import { Module } from '@nestjs/common';
import { CineproController } from './cinepro.controller';
import { CineproService } from './cinepro.service';
import { ContentRightsModule } from '../content-rights/content-rights.module';
@Module({imports:[ContentRightsModule],controllers:[CineproController],providers:[CineproService]})export class CineproModule{};
