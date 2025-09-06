import { FindAllResponse } from "src/utils/common.type";
import { BaseRepositoryInterface } from "./base.interface.repository";
import { BaseServiceInterface } from "./base.interface.service";
import { BaseEntity } from "./base.entity";

export abstract class BaseServiceAbstract<T extends BaseEntity>
implements BaseServiceInterface<T>{

    constructor(private readonly repository: BaseRepositoryInterface<T>) {}
    
    async create(create_dto: T): Promise<T> {
        return await this.repository.create(create_dto);
    }

    async findAll(
        filter?: object,
        options?: object,
    ): Promise<FindAllResponse<T>> {
        return await this.repository.findAll(filter, options);
    }
    async findOne(id: string) {
        return await this.repository.findOneById(id);
    }

    async update(id: string, update_dto: Partial<T>) {
        const updated = await this.repository.update(id, update_dto);
        if (!updated) {
            throw new Error(`Entity with id ${id} not found`);
        }
        return updated;
    }

    async remove(id: string) {
        return await this.repository.delete(id);
    }
}