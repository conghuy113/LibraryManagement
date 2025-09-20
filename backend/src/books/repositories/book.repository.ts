import { Injectable } from "@nestjs/common";
import { BaseRepositoryAbstract } from "src/base/base.abstract.repository";
import { Book } from "../entities/book.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BookRepositoryInterface } from "./book.repository.interface";

@Injectable()
export class BookRepository
    extends BaseRepositoryAbstract<Book>
    implements BookRepositoryInterface
{
    constructor(
        @InjectModel(Book.name)
        private readonly books_repository: Model<Book>
    ) {
        super(books_repository);
    }
}