import { Module } from "@nestjs/common";
import { BookController } from "./book.controller";
import { Book, BookSchema } from "./entities/book.entity";
import { MongooseModule } from "@nestjs/mongoose";
import { TypeBook, TypeBookSchema } from "./entities/typeBook.entity";
import { BookCover, BookCoverSchema } from "./entities/bookCover.entity";
import { BookService } from "./services/book.service";
import { TypeBookService } from "./services/typeBook.service";
import { BookCoverService } from "./services/bookCover.service";
import { BookRepository } from "./repositories/book.repository";
import { TypeBookRepository } from "./repositories/typeBook.repository";
import { BookCoverRepository } from "./repositories/bookCover.repository";

@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: Book.name,
                useFactory: () => BookSchema
            },
            {
                name: TypeBook.name,
                useFactory: () => TypeBookSchema
            },
            {
                name: BookCover.name,
                useFactory: () => BookCoverSchema
            }
        ])
    ],
    controllers: [BookController],
    providers: [{
        provide: 'BookRepositoryInterface',
        useClass: BookRepository
    },
    {
        provide: 'TypeBookRepositoryInterface',
        useClass: TypeBookRepository
    },
    {
        provide: 'BookCoverRepositoryInterface',
        useClass: BookCoverRepository
    },BookService,TypeBookService,BookCoverService],
    exports: [BookService,TypeBookService,BookCoverService],
})
export class BookModule {}
