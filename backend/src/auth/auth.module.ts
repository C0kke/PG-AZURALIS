import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';
import { User } from './entities/user.entity';
import { UserProfilePicture } from './entities/user-profile-picture.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { SharedModule } from '../shared/shared.module';
import { MailService } from '../mail/mail.service';
import { MailModule } from 'src/mail/mail.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfilePicture]),
    SharedModule,
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'tu-clave-secreta-super-segura',
        signOptions: {
          expiresIn: parseInt(configService.get<string>('JWT_EXPIRES', '86400')), //86400 seconds = 1 day
        },
      }),
    }),
  ],
  controllers: [AuthController, UsersController, UserProfileController],
  providers: [AuthService, UsersService, UserProfileService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}