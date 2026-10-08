import { ArgumentsHost,Catch,ExceptionFilter,HttpException,HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
@Catch() export class HttpExceptionFilter implements ExceptionFilter {
 catch(exception:unknown,host:ArgumentsHost){
  const response=host.switchToHttp().getResponse<Response>();
  const status=exception instanceof HttpException?exception.getStatus():HttpStatus.INTERNAL_SERVER_ERROR;
  const payload=exception instanceof HttpException?exception.getResponse():null;
  const details=typeof payload==='object' && payload!==null && 'message' in payload?payload.message:undefined;
  response.status(status).json({success:false,message:typeof details==='string'?details:status===500?'Internal server error':exception instanceof Error?exception.message:'Request failed',data:null,...(Array.isArray(details)?{errors:details}:{})});
 }
}
