import { User } from 'generated/prisma';

export type UserInfo = Omit<User, 'password'>;
