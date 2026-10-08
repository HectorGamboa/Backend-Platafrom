import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DevicesRepository } from './devices.repository';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
@Module({imports:[SubscriptionsModule],controllers:[DevicesController],providers:[DevicesService,DevicesRepository]})export class DevicesModule{}