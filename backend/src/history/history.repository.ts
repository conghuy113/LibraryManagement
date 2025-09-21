import { Injectable } from "@nestjs/common";
import { BaseRepositoryAbstract } from "src/base/base.abstract.repository";
import { History } from "./history.entity";
import { HistoryRepositoryInterface } from "./history.repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class HistoryRepository extends BaseRepositoryAbstract<History>
implements HistoryRepositoryInterface{
    constructor(
        @InjectModel(History.name)
        private readonly history_repository: Model<History>,
    ) {
        super(history_repository);
    }
}