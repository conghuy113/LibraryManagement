import { RoleUser } from "src/utils/RoleUser";
import { User } from "./user.entity";
import { Inject, Injectable } from "@nestjs/common";
import { BaseServiceAbstract } from "src/base/base.abstract.service";
import { CreateUserDto } from "src/dto/create-user.dto";
import type { UserRepositoryInterface } from "./user.repository.interface";
import { StatusUser } from "src/utils/StatusUser";
import { UpdateUserDto } from "src/dto/update-user.dto";
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService extends BaseServiceAbstract<User> {
    constructor(
        @Inject('UserRepositoryInterface')
        private readonly users_repository: UserRepositoryInterface,
    ){
        super(users_repository);
    }

    async createReader(create_dto: CreateUserDto): Promise<User> {
        const existing_user = await this.findUserByEmail(create_dto.email);
        if (existing_user) throw new Error('Email already in use');
        create_dto.password = await this.hashPassword(create_dto.password);
        const user = await this.users_repository.create({
            ...create_dto,
            role: RoleUser.READER,
            status: StatusUser.NOT_VERIFIED,
        });
        return user;
    }

    async updateReader(update_dto: UpdateUserDto): Promise<User> {
        const user = await this.findUserByEmail(update_dto.email);
        if (!user) throw new Error('User not found');
        if(user.status === StatusUser.BANNED) throw new Error('User is banned');
        await this.users_repository.update(user._id as string, update_dto);
        return user;
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }
    
    async findUserByEmail(email: string): Promise<User | null> {
        return await this.users_repository.findOneByCondition({ email }, 'email');
    }

    async setCurrentRefreshToken(id: string, hashed_token?: string): Promise<void> {
        try {
            await this.users_repository.update(id, {
                refreshToken: hashed_token || "" as string,
            });
		} catch (error) {
			throw error;
		}
	}

    async getMe(userId: string): Promise<User> {
        const user = await this.users_repository.findOneById(userId);
        if (!user) throw new Error('User not found');
        return user;
    }
}