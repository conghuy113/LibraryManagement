import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: User, done: (err: Error, user: { id: any }) => void) {
    done(null as any, { id: user._id });
  }

  async deserializeUser(
    payload: { id: number },
    done: (err: Error, user: Omit<User, 'password'>) => void,
  ) {
    const user = await this.userService.findOne(payload.id as any as string);

    done(null as any, user as any);
  }
}