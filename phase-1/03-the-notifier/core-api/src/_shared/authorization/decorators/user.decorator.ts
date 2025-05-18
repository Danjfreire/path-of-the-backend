import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '../token-payload';

declare module 'express' {
  interface Request {
    user?: TokenPayload;
  }
}

export function setRequestUser(req: Request, data: TokenPayload) {
  req.user = data;
}

export const ReqUser = createParamDecorator(
  (data: TokenPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return request.user;
  },
);
