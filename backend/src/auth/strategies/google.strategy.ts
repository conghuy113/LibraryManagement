import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from "../services/auth.service";
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/user/user.service";
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google'){
    constructor(
		private readonly userService: UserService,
		private readonly config_service: ConfigService,
	) {
        super({
            clientID: config_service.get<string>('GOOGLE_CLIENT_ID') as string,
            clientSecret: config_service.get<string>('GOOGLE_CLIENT_SECRET') as string,
            callbackURL: `${config_service.get('GOOGLE_CALLBACK_URL')}/auth/google/callback`,
            scope: ['email', 'profile'],
        });
	}

    async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
        const { emails } = profile;
        if (!emails || !emails.length) {
            throw new Error('No email associated with this account!');
        }
        
        const email = emails[0].value;
        const user = await this.userService.findUserByEmail(email);
        if (user) {
            return user;
        } else {
            throw new Error('User not found');
        }
    }
}