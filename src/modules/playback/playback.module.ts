import { Module } from '@nestjs/common';
import { PlaybackController } from './playback.controller';
import { PlaybackService } from './playback.service';
import { PlaybackRepository } from './playback.repository';
@Module({controllers:[PlaybackController],providers:[PlaybackService,PlaybackRepository]})export class PlaybackModule{}
