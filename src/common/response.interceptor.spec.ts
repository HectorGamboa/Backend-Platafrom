import { of, lastValueFrom } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor Xtream interoperability', () => {
 const interceptor = new ResponseInterceptor();
 const next = (value:unknown) => ({handle:()=>of(value)}) as CallHandler;
 const ctx = (path:string) => ({
  switchToHttp:()=>({getRequest:()=>({path})})
 }) as unknown as ExecutionContext;
 it('does not wrap the Xtream authentication object',async()=>{
  const payload={user_info:{auth:1},server_info:{}};
  expect(await lastValueFrom(interceptor.intercept(ctx('/player_api.php'),next(payload)))).toEqual(payload);
 });
 it('does not wrap Xtream catalog arrays',async()=>{
  const payload=[{stream_id:4,name:'Demo'}];
  expect(await lastValueFrom(interceptor.intercept(ctx('/player_api.php'),next(payload)))).toEqual(payload);
 });
 it('preserves standard Veyra responses',async()=>{
  expect(await lastValueFrom(interceptor.intercept(ctx('/api/v1/catalog'),next({foo:1})))).toEqual({success:true,message:'OK',data:{foo:1}});
 });
});
