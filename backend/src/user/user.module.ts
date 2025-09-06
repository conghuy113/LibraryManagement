import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.entity';

@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: User.name,
                useFactory: () => UserSchema
            }
        ])
    ],
    controllers: [UserController],
    providers: [{
        provide: 'UserRepositoryInterface',
        useClass: UserRepository
    },UserService],
    exports: [UserService]
})
export class UserModule {}