import { Module } from '@nestjs/common';
import { CineproController } from './cinepro.controller';
import { CineproService } from './cinepro.service';
import { CineproRepository } from './cinepro.repository';
@Module({controllers:[CineproController],providers:[CineproService,CineproRepository]})
export class CineproModule {}
