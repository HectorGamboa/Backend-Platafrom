import { IsUUID,IsOptional,IsEnum,IsDateString } from 'class-validator';
import { SubscriptionStatus } from '@prisma/client';
export class CreateSubscriptionDto{
 @IsUUID() userId:string;
 @IsUUID() planId:string;
 @IsOptional() @IsDateString() startsAt?:string;
}
export class UpdateSubscriptionDto{
 @IsEnum(SubscriptionStatus) status:SubscriptionStatus;
}