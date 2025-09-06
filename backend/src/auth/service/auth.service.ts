import { UserService } from './../../user/user.service';
import { User } from 'src/user/user.entity';
import { MailService } from './../../mail/mail.service';
import * as jwt from 'jsonwebtoken';
import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { StatusUser } from 'src/utils/StatusUser';
import { CreateUserDto } from 'src/dto/create-user.dto';


@Injectable()
export class AuthService {
    constructor(
        private mailService: MailService,
        private userService: UserService,
    ) {}

    private sendEmailVerificationMail(user: User): void {
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET as string, {
            expiresIn: 60 * 60 * 24 * 14,
        });
        const url = `${process.env.FRONTEND_URL}/auth/email/verify/${token}`;
        this.mailService.sendUserConfirmation(user, 'Library Website', url);
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Email incorrect.');
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            throw new UnauthorizedException('Password incorrect.');
        }
        user.password = "";
        return user;
    }

    async verifyEmail(token: string): Promise<User> {
        try {
            var userId = (jwt.verify(token, process.env.JWT_SECRET as string) as {userId: string}).userId;
        } catch (error) {
            throw new BadRequestException('Invalid token');
        }
        const updatedUser = await this.userService.update(
            userId,
            {
                status: StatusUser.VERIFIED,
            },
        );
        return updatedUser;
    }

    async registerReader(user: CreateUserDto) {
        try {
            const res = await this.userService.createReader(user);
            this.sendEmailVerificationMail(res);
        } catch (error) {
            throw new ConflictException('Email already exists.');
        }
        return {
            message: 'User registered successfully. Please check your email to verify your account.',
        };
    }

    private generateAccessToken(userId: string) : string {
        return jwt.sign( {userId}, process.env.JWT_SECRET_ACCESS_TOKEN as string,{
            expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}s`,
        });
    }

    private generateRefreshToken(userId: string) : string {
        return jwt.sign( {userId}, process.env.JWT_SECRET_REFRESH_TOKEN as string, {
            expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME}s`,
        });
    }

    async generateAccessTokenAndRefreshToken(userId: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(userId),
            this.generateRefreshToken(userId),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }

    async login(userId) {
        const { accessToken, refreshToken } 
        = await this.generateAccessTokenAndRefreshToken(userId);
        await this.userService.setCurrentRefreshToken(userId, refreshToken);
        return {
            accessToken,
            refreshToken,
        };
    }

    async logout(refreshToken: string): Promise<void> {
        const userId = this.decodeRefreshToken(refreshToken);
        await this.userService.setCurrentRefreshToken(userId);
    }

    async refreshTokens(refreshToken: string) {
        const userId = this.decodeRefreshToken(refreshToken);
        const user = await this.userService.findOne(userId);
        if (!user || !user.refreshToken) throw new UnauthorizedException('Access denied');
        const tokens = await this.generateAccessTokenAndRefreshToken(userId);
        await this.userService.setCurrentRefreshToken(userId, tokens.refreshToken);
        return tokens;
    }

    private decodeRefreshToken(token: string): string {
        return (jwt.verify(token, process.env.JWT_SECRET_REFRESH_TOKEN as string) as {userId: string}).userId;
    }
}