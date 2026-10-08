import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable() export class AuthRepository{constructor(private db:PrismaService){}
 find(email:string){return this.db.user.findUnique({where:{email}});}
 create(email:string,name:string,passwordHash:string){return this.db.user.create({data:{email,name,passwordHash},select:{id:true,email:true,name:true}});}
}