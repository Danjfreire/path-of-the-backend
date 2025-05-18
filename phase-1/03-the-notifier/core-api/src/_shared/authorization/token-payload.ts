import { UserRole } from './roles.model';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}
