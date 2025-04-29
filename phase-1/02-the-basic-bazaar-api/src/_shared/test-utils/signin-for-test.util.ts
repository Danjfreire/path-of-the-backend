import { UserRole } from 'generated/prisma';
import { AuthService } from 'src/v1/auth/auth.service';

export async function signInForTest(
  authService: AuthService,
  options?: { email?: string; password?: string; role: UserRole },
) {
  const email = options?.email ?? 'test@email.com';
  const password = options?.password ?? 'password';
  const role = options?.role ?? UserRole.USER;

  // Create a user
  const createUserDto = {
    name: 'John Doe',
    email,
    password,
    role,
  };
  const user = await authService.createUser(createUserDto);

  // Sign in
  const loginResponse = await authService.loginUser({ email, password });

  if (!loginResponse) {
    throw new Error('Sign in failed');
  }

  return {
    access_token: loginResponse.access_token,
    user: { id: user.id, ...createUserDto },
  };
}
