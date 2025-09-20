import { ChangePasswordDto } from './../dto/change-password-dto';
import { RoleUser } from "src/utils/RoleUser";
import { User } from "./user.entity";
import { Inject, Injectable } from "@nestjs/common";
import { BaseServiceAbstract } from "src/base/base.abstract.service";
import { CreateUserDto } from "src/dto/create-user.dto";
import type { UserRepositoryInterface } from "./user.repository.interface";
import { StatusUser } from "src/utils/StatusUser";
import { UpdateUserDto } from "src/dto/update-user.dto";
import * as bcrypt from 'bcrypt';
import { FindAllResponse } from "src/utils/common.type";
import { Types } from "mongoose";
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

    async createManager(user : User): Promise<User> {
        const existing_user = await this.findUserByEmail(user.email);
        if(!existing_user) {
            throw new Error('User not found');
        }
        if(user.status !== StatusUser.VERIFIED) {
            throw new Error('User is not verified');
        }
        user.role = RoleUser.MANAGER;
        await this.users_repository.update(existing_user._id as string, user);
        return user;
    }

    async getAllUsers(): Promise<FindAllResponse<User>> {
        const { items, count } = await this.users_repository.findAll();
        items.forEach(user => {
            this.changeToResponseUser(user);
        });
        return { items, count };
    }

    async createAdminUser(): Promise<User> {
        const adminId = process.env.ADMIN_ID as string;
        return {
            _id: new Types.ObjectId(adminId),
            email: process.env.ADMIN_EMAIL || 'admin@library.com',
            firstName: 'System',
            lastName: 'Administrator',
            role: RoleUser.ADMIN,
            status: StatusUser.VERIFIED,
            password: '', // Admin không cần password trong object return
            phoneNumber: '0000000000',
            gender: 'male',
            DOB: new Date('1990-01-01'),
            refreshToken: undefined,
            deleted_at: null,
        } as unknown as User;
    }

    private changeToResponseUser(user: User): User {
        user.password = "";
        user.refreshToken = "";
        return user;
    }

    async updateUser(id: String,status: StatusUser, role: RoleUser): Promise<User> {
        const user = await this.users_repository.findOneById(id as string);
        if (!user) throw new Error('User not found');
        if(user.role === RoleUser.ADMIN) throw new Error('Cannot change role/status of admin');
        const userUpdate = await this.users_repository.update(id as string, {status, role});
        return userUpdate;
    }

    async updateUserInformation(id: string, update_dto: UpdateUserDto): Promise<User> {
        const user = await this.users_repository.findOneById(id);
        if (!user) throw new Error('User not found');
        if(user.status !== StatusUser.VERIFIED) throw new Error('User is not verified');
        let parsedDOB: Date | undefined;
        if (update_dto.DOB) {
            parsedDOB = this.parsedDateInUpdate(update_dto.DOB);
        }
        const { DOB, ...otherFields } = update_dto;
        const updateData = {
            ...otherFields,
            ...(parsedDOB && { DOB: parsedDOB })
        };
        return await this.users_repository.update(id, updateData);
    }

    private parsedDateInUpdate(dateString: string): Date {
        const dateParts = dateString.split('/');
        if (dateParts.length === 3) {
            const [day, month, year] = dateParts;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
            // Try to parse as regular date string
            return new Date(dateString);
        }
    }

    async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const user = await this.users_repository.findOneById(id);
        if (!user || user.status !== StatusUser.VERIFIED) throw new Error('User not found');
        const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
        if (!isMatch) throw new Error('Old password is incorrect');
        const hashedNewPassword = await this.hashPassword(changePasswordDto.newPassword);
        await this.users_repository.update(id, { password: hashedNewPassword });
    }
}