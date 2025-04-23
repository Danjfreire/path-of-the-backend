import { AuthService } from 'src/v1/auth/auth.service';

export async function signInForTest(
  authService: AuthService,
  options?: { email?: string; password?: string },
) {
  const email = options?.email ?? 'test@email.com';
  const password = options?.password ?? 'password';

  // Create a user
  const createUserDto = {
    name: 'John Doe',
    email,
    password,
  };
  const userId = await authService.createUser(createUserDto);

  // Sign in
  const loginResponse = await authService.login({ email, password });

  if (!loginResponse) {
    throw new Error('Sign in failed');
  }

  return {
    access_token: loginResponse.access_token,
    user: { id: userId, ...createUserDto },
  };
}
