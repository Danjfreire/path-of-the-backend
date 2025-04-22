import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from './models/token-payload';
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
  }
}

export function setRequestUser(req: Request, data: TokenPayload) {
  const user = {
    id: data.sub,
    email: data.email,
  };

  req.user = user;
}

export const ReqUser = createParamDecorator(
  (data: TokenPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return request.user;
  },
);
