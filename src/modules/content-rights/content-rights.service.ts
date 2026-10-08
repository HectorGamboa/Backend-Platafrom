import { Injectable,BadRequestException,ForbiddenException } from '@nestjs/common';
import { ContentRightsRepository } from './content-rights.repository';
import { CreateLicensedSourceDto } from './dto/rights.dto';
@Injectable() export class ContentRightsService{
 constructor(private readonly repo:ContentRightsRepository){}
 async create(dto:CreateLicensedSourceDto){
  if(new Date(dto.validFrom)>=new Date(dto.validUntil))throw new BadRequestException('Invalid license period');
  return this.repo.db.licensedSource.create({data:{...dto,validFrom:new Date(dto.validFrom),validUntil:new Date(dto.validUntil),isActive:false}});
 }
 async activate(id:string){
  const source=await this.repo.db.licensedSource.findUnique({where:{id}});
  if(!source||!source.licenseReference||!source.rightsHolder)throw new BadRequestException('License details missing');
  if(!source.allowedCommercialUse)throw new ForbiddenException('Commercial rights not declared');
  return this.repo.db.licensedSource.update({where:{id},data:{isActive:true}});
 }
 list(){return this.repo.db.licensedSource.findMany({select:{id:true,contentId:true,kind:true,territory:true,rightsHolder:true,licenseReference:true,validFrom:true,validUntil:true,isActive:true,allowedCommercialUse:true}});}
 async resolve(contentId:string,kind:string,territory:string){
  const now=new Date();
  const source=await this.repo.db.licensedSource.findFirst({where:{contentId,kind,territory,allowedCommercialUse:true,isActive:true,validFrom:{lte:now},validUntil:{gt:now}}});
  if(!source)throw new ForbiddenException('No active commercial distribution authorization for this content and territory');
  return {sourceId:source.id,playbackUrl:source.playbackUrl};
 }
}