import { BaseRepositoryInterface } from "src/base/base.interface.repository";
import { User } from "./user.entity";

export interface UserRepositoryInterface
    extends BaseRepositoryInterface<User>{
}