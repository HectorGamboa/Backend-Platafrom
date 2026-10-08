import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePlanDto,UpdatePlanDto } from './dto/plan.dto';
@Injectable() export class PlansRepository{
 constructor(private readonly db:PrismaService){}
 list(skip:number,take:number){return this.db.plan.findMany({skip,take,orderBy:{name:'asc'}});}
 count(){return this.db.plan.count();}
 find(id:string){return this.db.plan.findUnique({where:{id}});}
 create(dto:CreatePlanDto){return this.db.plan.create({data:dto});}
 update(id:string,dto:UpdatePlanDto){return this.db.plan.update({where:{id},data:dto});}
}