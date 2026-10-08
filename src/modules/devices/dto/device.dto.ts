import { IsString,MinLength,MaxLength } from 'class-validator';
export class RegisterDeviceDto{ @IsString() @MinLength(3) @MaxLength(191) deviceId:string; }