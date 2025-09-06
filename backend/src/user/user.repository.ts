import { Injectable } from "@nestjs/common";
import { BaseRepositoryAbstract } from "src/base/base.abstract.repository";
import { User } from "./user.entity";
import { UserRepositoryInterface } from "./user.repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FindAllResponse } from "src/utils/common.type";

@Injectable()
export class UserRepository
    extends BaseRepositoryAbstract<User>
    implements UserRepositoryInterface
{
    constructor(
        @InjectModel(User.name)
        private readonly users_repository: Model<User>,
    ) {
        super(users_repository);
    }
}