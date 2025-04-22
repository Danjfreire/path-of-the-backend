import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { AuthGuard } from './auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { PrismaDatabaseModule } from 'src/_shared/prisma-database/prisma-database.module';

@Module({
  imports: [
    PrismaDatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthGuard, AuthService, UserRepository],
  exports: [AuthGuard],
})
export class AuthModule {}
