import { Injectable } from "@nestjs/common";
import { BaseRepositoryAbstract } from "src/base/base.abstract.repository";
import { BookCover } from "../entities/bookCover.entity";
import { BookCoverRepositoryInterface } from "./bookCover.repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class BookCoverRepository 
    extends BaseRepositoryAbstract<BookCover>
    implements BookCoverRepositoryInterface
{
    constructor(
        @InjectModel(BookCover.name)
        private readonly bookCoverModel: Model<BookCover>
    ) {
        super(bookCoverModel);
    }
}