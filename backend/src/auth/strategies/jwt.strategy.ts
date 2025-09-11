import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { TokenPayload } from '../interfaces/token.interface';
import { AuthService } from '../services/auth.service';
import { RoleUser } from 'src/utils/RoleUser';
import { Types } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
            ignoreExpiration: false
        });
    }
    
    async validate(payload: TokenPayload) {
        const userId = payload.userId;
        // Kiểm tra nếu là admin với ID đặc biệt
        if (userId === process.env.ADMIN_ID) {
            return this.userService.createAdminUser();
        }
        // Tìm user thông thường trong database
        const user = await this.userService.findOne(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }
}
