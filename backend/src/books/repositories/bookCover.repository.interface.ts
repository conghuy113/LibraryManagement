import { BaseRepositoryInterface } from "src/base/base.interface.repository";
import { BookCover } from "../entities/bookCover.entity";

export interface BookCoverRepositoryInterface
    extends BaseRepositoryInterface<BookCover>{
}
