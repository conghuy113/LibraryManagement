import { Inject, Injectable } from "@nestjs/common";
import { BaseServiceAbstract } from "src/base/base.abstract.service";
import { History } from "./history.entity";
import type { HistoryRepositoryInterface } from "./history.repository.interface";

@Injectable()
export class HistoryService extends BaseServiceAbstract<History>{
    constructor(
        @Inject('HistoryRepositoryInterface')
        private readonly history_repository: HistoryRepositoryInterface,
    ) {
        super(history_repository);
    }
}
