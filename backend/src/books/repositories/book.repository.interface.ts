import { BaseRepositoryInterface } from "src/base/base.interface.repository";
import { Book } from "../entities/book.entity";

export interface BookRepositoryInterface
    extends BaseRepositoryInterface<Book>{
}