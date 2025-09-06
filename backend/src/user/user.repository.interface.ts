import { BaseRepositoryInterface } from "src/base/base.interface.repository";
import { User } from "./user.entity";
import { FindAllResponse } from "src/utils/common.type";

export interface UserRepositoryInterface
    extends BaseRepositoryInterface<User>{
}