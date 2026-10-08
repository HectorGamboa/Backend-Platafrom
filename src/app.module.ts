import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD,APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './common/prisma/prisma.module';
import { ResponseInterceptor } from './common/response.interceptor';
import { AuthGuard } from './common/auth.guard';
import { PermissionsGuard } from './common/permissions.guard';
import { AuthModule } from './modules/auth/auth.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { DevicesModule } from './modules/devices/devices.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AdminModule } from './modules/admin/admin.module';
import { PlaybackModule } from './modules/playback/playback.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ContentRightsModule } from './modules/content-rights/content-rights.module';
import { CineproModule } from './modules/cinepro/cinepro.module';
import { MediaModule } from './modules/media/media.module';
@Module({imports:[ConfigModule.forRoot({isGlobal:true}),JwtModule.register({global:true,secret:process.env.JWT_SECRET||'DEVELOPMENT_ONLY_CHANGE_ME',signOptions:{expiresIn:'15m'}}),PrismaModule,AuthModule,PlansModule,SubscriptionsModule,DevicesModule,CatalogModule,AdminModule,PlaybackModule,PaymentsModule,ContentRightsModule,CineproModule,MediaModule],providers:[{provide:APP_GUARD,useClass:AuthGuard},{provide:APP_GUARD,useClass:PermissionsGuard},{provide:APP_INTERCEPTOR,useClass:ResponseInterceptor}]})
export class AppModule {}
