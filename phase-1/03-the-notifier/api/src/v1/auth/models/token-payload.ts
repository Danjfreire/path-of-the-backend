import { UserRole } from 'generated/prisma';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}
