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
        const token = jwt.sign({ userId: user._id as string }, process.env.JWT_SECRET as string, {
            expiresIn: 60 * 60 * 24 * 14, // 14 days
        });
        const url = `${process.env.FRONTEND_URL}/auth/email/${token}`;
        try {
            this.mailService.sendUserConfirmation(user, 'Library Website', url);
        } catch (error) {
            throw new BadRequestException('Error sending Verify email:', error);
        }
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
        if (!token) {
            throw new BadRequestException('Token is required', token);
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        const user = await this.userService.findOne(decoded.userId);
        if (!user) throw new BadRequestException('User not found');
        if (user.status === StatusUser.VERIFIED) throw new ConflictException('User already verified');
        if (user.status === StatusUser.BANNED) throw new BadRequestException('User is banned');
        const updatedUser = await this.userService.update(
            user._id as string,
            {
                status: StatusUser.VERIFIED,
            },
        );
        return updatedUser;
    }

    async registerReader(user: CreateUserDto) {
        const res = await this.userService.createReader(user);
        if (!res) throw new BadRequestException('Error creating user. Please try again later.');
        try {
            this.sendEmailVerificationMail(res);
        } catch (error) {
            throw new BadRequestException('Error sending email verification. Please try again later.');
        }
        return {
            message: 'User registered successfully. Please check your email to verify your account.',
            statusCode: 201,
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