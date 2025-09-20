import { Inject, Injectable } from "@nestjs/common";
import { BaseServiceAbstract } from "src/base/base.abstract.service";
import { Book } from "../entities/book.entity";
import type { BookRepositoryInterface } from "../repositories/book.repository.interface";

@Injectable()
export class BookService extends BaseServiceAbstract<Book> {
    constructor(
        @Inject('BookRepositoryInterface') 
        private readonly books_repository: BookRepositoryInterface,
    ) {
        super(books_repository);
    }
}