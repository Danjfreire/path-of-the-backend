import { Module } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthorizationModule {}
