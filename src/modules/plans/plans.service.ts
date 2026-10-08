import { Injectable,NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../../common/pagination.dto';
import { pageMeta } from '../../common/api-response.interface';
import { PlansRepository } from './plans.repository';
import { CreatePlanDto,UpdatePlanDto } from './dto/plan.dto';
@Injectable() export class PlansService{
 constructor(private readonly repo:PlansRepository){}
 async list(query:PaginationDto){const [items,total]=await Promise.all([this.repo.list(query.skip,query.limit),this.repo.count()]);return {items,pagination:pageMeta(query.page,query.limit,total)};}
 async find(id:string){const plan=await this.repo.find(id);if(!plan)throw new NotFoundException('Plan not found');return plan;}
 create(dto:CreatePlanDto){return this.repo.create(dto);}
 async update(id:string,dto:UpdatePlanDto){await this.find(id);return this.repo.update(id,dto);}
}