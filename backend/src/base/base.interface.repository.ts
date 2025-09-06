import { FindAllResponse } from "src/utils/common.type";

export interface BaseRepositoryInterface<T> {
    create(dto: T | any): Promise<T>;

    findOneById(id: string, projection?: string): Promise<T | null>;

    findOneByCondition(condition?: object, projection?: string): Promise<T | null>;

    findAll(
        condition?: object,
        options?: object,
    ): Promise<FindAllResponse<T>>;

    update(id: string, dto: Partial<T>): Promise<T>;

    delete(id: string): Promise<boolean>;
}