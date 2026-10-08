import { Injectable,NestInterceptor,CallHandler,ExecutionContext } from '@nestjs/common';
import { Observable,map } from 'rxjs';
@Injectable() export class ResponseInterceptor implements NestInterceptor {
 intercept(_:ExecutionContext,next:CallHandler):Observable<unknown>{return next.handle().pipe(map((data:unknown)=>{
 if(data && typeof data==='object' && 'success' in data)return data;
 if(data && typeof data==='object' && 'items' in data && 'pagination' in data){
 const obj=data as {items:unknown;pagination:unknown};return {success:true,message:'OK',data:obj.items,pagination:obj.pagination};}
 return {success:true,message:'OK',data:data??null};
 }));}
}
