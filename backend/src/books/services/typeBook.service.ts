import { Inject, Injectable } from "@nestjs/common";
import { TypeBook } from "../entities/typeBook.entity";
import { BaseServiceAbstract } from "src/base/base.abstract.service";
import type { TypeBookRepositoryInterface } from "../repositories/typeBook.repository.interface";

@Injectable()
export class TypeBookService extends BaseServiceAbstract<TypeBook> {
    constructor(
        @Inject('TypeBookRepositoryInterface')
        private readonly type_book_repository: TypeBookRepositoryInterface
    ) {
        super(type_book_repository);
    }
}