import { FilterQuery, Model, QueryOptions } from "mongoose";
import { BaseEntity } from "./base.entity";
import { BaseRepositoryInterface } from "./base.interface.repository";
import { FindAllResponse } from "src/utils/common.type";

export abstract class BaseRepositoryAbstract<T extends BaseEntity>
implements BaseRepositoryInterface<T>{

    protected constructor(private readonly model: Model<T>) {
        this.model = model;
    }

    async create(dto: T | any): Promise<T> {
        const created_data = await this.model.create(dto);
        return created_data.save();
    }

    async findOneById(id: string): Promise<T | null> {
        const item = await this.model.findById(id);
        if (!item) return null;
        return item.deleted_at ? null : item;
    }

    async findOneByCondition(condition = {}): Promise<T | null> {
        return await this.model
            .findOne({
                ...condition,
                deleted_at: null,
            })
            .exec();
    }

    async findAll(
        condition: FilterQuery<T>,
        options?: QueryOptions<T>,
    ): Promise<FindAllResponse<T>> {
        return Promise.all([
            this.model.countDocuments({ ...condition, deleted_at: null }),
            this.model.find({ ...condition, deleted_at: null }, options?.projection, options),
        ])
        .then(([count, items]) => ({ count, items }))
        .catch((error) => {
            console.log("Error fetching all items:", error);
            throw new Error("Error fetching all items");
        });
    }

    async update(id: string, dto: Partial<T>): Promise<T> {
        const updated = await this.model.findOneAndUpdate(
            { _id: id, deleted_at: null },
            dto,
            { new: true },
        );
        if (!updated) {
            throw new Error(`Entity with id ${id} not found or has been deleted.`);
        }
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        const delete_item = await this.model.findById(id);
        if (!delete_item) {
            return false;
        }

        return !!(await this.model
            .findByIdAndUpdate<T>(id, { deleted_at: new Date() })
            .exec());
    }
}