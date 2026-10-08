import { IsEmail,IsOptional,IsString,IsUUID,MaxLength,IsBoolean } from 'class-validator';
export class UpdateUserDto{
 @IsOptional() @IsString() @MaxLength(150) name?:string;
 @IsOptional() @IsBoolean() isActive?:boolean;
}
export class CreateRoleDto{
 @IsString() @MaxLength(100) name:string;
}
export class CreatePermissionDto{
 @IsString() @MaxLength(100) code:string;
}
export class AssignRoleDto{ @IsUUID() roleId:string; }
export class GrantPermissionDto{ @IsUUID() permissionId:string; }
