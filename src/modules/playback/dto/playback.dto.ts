import { IsString,MaxLength,MinLength,IsUUID } from 'class-validator';
export class StartPlaybackDto { @IsString() @MinLength(1) @MaxLength(150) contentId:string; @IsString() @MinLength(3) @MaxLength(191) deviceId:string; }
export class SessionIdDto { @IsUUID() id:string; }
