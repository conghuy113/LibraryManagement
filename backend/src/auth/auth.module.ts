import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { LocalGuard } from './guards/local.guard';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { PassportModule } from '@nestjs/passport';
import { AuthSerializer } from './providers/serialization.provider';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { GoogleAuthGuard } from './guards/google-oauth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { RoleGuard } from './guards/role.guard';

@Module({
	imports: [
		JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1000000s' } 
        }),
		ConfigModule.forRoot(),
		UserModule,
		MailModule,
        PassportModule.register({session: true}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, LocalGuard,AuthSerializer,JwtStrategy,
		JwtAuthGuard, GoogleAuthGuard, GoogleStrategy, RoleGuard],
	exports: [AuthService, LocalGuard, JwtAuthGuard, GoogleAuthGuard, RoleGuard],
})
export class AuthModule {}
