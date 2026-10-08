import { Body,Controller,Get,Param,Patch,Post,Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PaginationDto } from '../../common/pagination.dto';
import { Permissions } from '../../common/permissions.decorator';
import { UpdateUserDto,CreateRoleDto,CreatePermissionDto,AssignRoleDto,GrantPermissionDto } from './dto/admin.dto';
@Controller('admin') export class AdminController {
 constructor(private readonly service:AdminService){}
 @Permissions('users:view') @Get('users') users(@Query() q:PaginationDto){return this.service.users(q);}
 @Permissions('users:update') @Patch('users/:id') updateUser(@Param('id') id:string,@Body() dto:UpdateUserDto){return this.service.updateUser(id,dto);}
 @Permissions('roles:view') @Get('roles') roles(@Query() q:PaginationDto){return this.service.roles(q);}
 @Permissions('roles:create') @Post('roles') createRole(@Body() dto:CreateRoleDto){return this.service.createRole(dto);}
 @Permissions('roles:update') @Post('users/:userId/roles') assignRole(@Param('userId') userId:string,@Body() dto:AssignRoleDto){return this.service.assignRole(userId,dto.roleId);}
 @Permissions('permissions:view') @Get('permissions') permissions(@Query() q:PaginationDto){return this.service.permissions(q);}
 @Permissions('permissions:create') @Post('permissions') createPermission(@Body() dto:CreatePermissionDto){return this.service.createPermission(dto);}
 @Permissions('permissions:update') @Post('roles/:roleId/permissions') grantPermission(@Param('roleId') roleId:string,@Body() dto:GrantPermissionDto){return this.service.grantPermission(roleId,dto.permissionId);}
}