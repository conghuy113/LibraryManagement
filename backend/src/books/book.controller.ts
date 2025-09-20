import { Body, Controller, Get, Post, Type, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { BookService } from "./services/book.service";
import { TypeBookService } from "./services/typeBook.service";
import { BookCoverService } from "./services/bookCover.service";
import { ApiBearerAuth, ApiBody, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RoleGuard } from "src/auth/guards/role.guard";
import { ManagerOnly, ManagerOrReader, Roles } from "src/auth/decorators/roles.decorator";
import { TypeBook } from "./entities/typeBook.entity";
import { CreateTypeBookDto } from "../dto/create-type-book.dto";
import { CreateCoverBookDto } from "src/dto/create-cover-book.dto";
import { Book } from "./entities/book.entity";
import { BookCover } from "./entities/bookCover.entity";
import { CreateBookDto } from "src/dto/create-book-dto";
import { title } from "process";
import { IndexBook } from "src/utils/IndexBook";
import { StatusBook } from "src/utils/StatusBook";

@Controller('books')
export class BookController {
    constructor(
        private readonly bookService: BookService,
        private readonly typeBookService: TypeBookService,
        private readonly bookCoverService: BookCoverService
    ) {}

    @Get('all-cover-books')
    @ApiOperation({ summary: 'Get all book covers' })
    @UseGuards(JwtAuthGuard,RoleGuard)
    @ApiBearerAuth('token')
    @Roles()
    @ManagerOrReader()
    async findAllCoverBooks() {
        return await this.bookCoverService.findAll();
    }

    @Post('create-cover-book')
    @ApiOperation({ summary: 'Create a new book cover' })
    @UseGuards(JwtAuthGuard,RoleGuard)
    @ApiBearerAuth('token')
    @Roles()
    @ManagerOnly()
    @ApiBody({ schema:{
        example: {
            title: "The Great Gatsby",
            authorName: "F. Scott Fitzgerald",
            publicationYear: "1925",
            publisher: "Charles Scribner's Sons",
            typeBookId: "64a7f0c2e4b0f5b6c8d9e0a1",
            image: "https://example.com/great-gatsby-cover.jpg"
        },
        properties: {
            title: { type: 'string' },
            authorName: { type: 'string' },
            publicationYear: { type: 'string', description: '4-digit year' },
            publisher: { type: 'string' },
            typeBookId: { type: 'string' },
            image: { type: 'string', description: 'URL of the book cover image' }
        },
        required: ['title', 'authorName', 'publicationYear', 'publisher', 'typeBookId', 'image']
    } })
    @UsePipes(new ValidationPipe({ transform: true }))
    async createCoverBook(@Body() dto: CreateCoverBookDto) {
        const {items} = await this.typeBookService.findAll();
        if(!items.find(item => item.deleted_at === null && item._id?.toString() === dto.typeBookId)) {
            return { 
                message: `Book with id ${dto.typeBookId} not found`,
                status: 404
            };
        }
        const coverBook =  await this.bookCoverService.create(dto as unknown as BookCover);
        return {
            message: 'Book cover created successfully',
            status: 201,
            data: coverBook
        }
    }

    @Post('create-type-book')
    @ApiOperation({ summary: 'Create a new book type' })
    @UseGuards(JwtAuthGuard,RoleGuard)
    @ApiBearerAuth('token')
    @Roles()
    @ApiBody({
        schema: {
            example: {
                name: "Fiction",
                description: "Fictional books"
            },
            properties: {
                name: { type: 'string' },
                description: { type: 'string' }
            },
            required: ['name', 'description'],
        },
    })
    @ManagerOnly()
    async createTypeBook(@Body() dto: CreateTypeBookDto) {
        return await this.typeBookService.create(dto as unknown as TypeBook);
    }

    @Get('all-type-books')
    @ApiOperation({ summary: 'Get all book types' })
    @UseGuards(JwtAuthGuard,RoleGuard)
    @ApiBearerAuth('token')
    @Roles()
    @ManagerOrReader()
    async findAllTypeBooks() {
        return await this.typeBookService.findAll();
    }

    @Get('all-books')
    @ApiOperation({ summary: 'Get all books' })
    @UseGuards(JwtAuthGuard,RoleGuard)
    @ApiBearerAuth('token')
    @Roles()
    @ManagerOrReader()
    async findAllBooks() {
        return await this.bookService.findAll();
    }

    @Post('create-book')
    @ApiOperation({ summary: 'Create a new book' })
    @UseGuards(JwtAuthGuard,RoleGuard)
    @ApiBearerAuth('token')
    @Roles()
    @ManagerOnly()
    @ApiBody({
        schema: {
            example: {
                idBook: "B001",
                importDate: "15-08-2023",
                index: "A1",
                idBookCover: "64a7f0c2e4b0f5b6c8d9e0a1"
            }
        }
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    async createBook(@Body() dto: CreateBookDto) {
        const {items} = await this.bookCoverService.findAll();
        if(!items.find(item => item.deleted_at === null && item._id?.toString() === dto.idBookCover)) {
            return {
                message: `Book cover with id ${dto.idBookCover} not found`,
                status: 404
            };
        }
        if(dto.index && !Object.values(IndexBook).includes(dto.index as IndexBook)) {
            return {
                message: `Index ${dto.index} is invalid. Valid indexes are: ${Object.values(IndexBook).join(', ')}`,
                status: 400
            };
        }

        // Convert DD-MM-YYYY to Date object if needed
        let parsedImportDate: Date;
        // Handle DD-MM-YYYY format
        const dateString = dto.importDate.toString();
        const dateParts = dateString.split('-');
        if (dateParts.length === 3) {
            const [day, month, year] = dateParts;
            parsedImportDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
            // Try to parse as regular date string
            parsedImportDate = new Date(dateString);
        }
        
        if (isNaN(parsedImportDate.getTime())) {
            return {
                message: `Invalid date format for importDate: ${dto.importDate}. Use DD-MM-YYYY or ISO format.`,
                status: 400
            };
        }

        const bookData = {
            ...dto,
            importDate: parsedImportDate,
            status: StatusBook.AVAILABLE
        };

        const book = await this.bookService.create(bookData as unknown as Book);
        return {
            message: 'Book created successfully',
            status: 201,
            data: book
        };
    }
}