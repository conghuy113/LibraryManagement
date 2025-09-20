import { Inject, Injectable } from "@nestjs/common";
import { BaseServiceAbstract } from "src/base/base.abstract.service";
import { BookCover } from "../entities/bookCover.entity";
import type { BookCoverRepositoryInterface } from "../repositories/bookCover.repository.interface";
import { CreateCoverBookDto } from "src/dto/create-cover-book.dto";

@Injectable()
export class BookCoverService extends BaseServiceAbstract<BookCover> {
    constructor(
        @Inject('BookCoverRepositoryInterface')
        private readonly book_cover_repository: BookCoverRepositoryInterface
    ) {
        super(book_cover_repository);
    }
}