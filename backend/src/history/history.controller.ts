import { Body, Controller, Get, Post, Req, Request, Type, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HistoryService } from "./history.service";
import { UserService } from "src/user/user.service";
import { BookService } from "src/books/services/book.service";
import { CreateHistoryDto } from "src/dto/create-history-dto";
import { History } from "./history.entity";
import { StatusHistory } from "src/utils/StatusHistory";
import { RoleGuard } from "src/auth/guards/role.guard";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { ManagerOnly, ReaderOnly, Roles } from "src/auth/decorators/roles.decorator";
import { StatusBook } from "src/utils/StatusBook";
import type { RequestWithUser } from "src/types/requests.type";
import { BookCoverService } from "src/books/services/bookCover.service";
import { TypeBookService } from "src/books/services/typeBook.service";

@ApiTags('history')
@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService,
        private readonly userService: UserService,
        private readonly bookService: BookService,
    ) {}

    @Post('add-history')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @ApiBearerAuth('token')
    @ApiOperation({ summary: 'Add a new history record (reader borrows a book)' })
    @ApiResponse({ status: 201, description: 'History created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Reader role required' })
    @ApiBody({
        schema: {
            example: {
                bookId: "64a7f0c2e4b0f5b6c8d9e0a1",
                numberDate: 7
            },
            properties: {
                bookId: { type: 'string', description: 'ID of the book to borrow' },
                numberDate: { type: 'number', description: 'Number of days to borrow (must be > 1)' }
            },
            required: ['bookId', 'numberDate']
        }
    })
    @Roles()
    @ReaderOnly()
    @UsePipes(new ValidationPipe({ transform: true }))
    async addHistory(@Body() createHistoryDto: CreateHistoryDto, @Request() req) {
        const [user, book] = await Promise.all([
            this.userService.findOne(req.user._id as string),
            this.bookService.findOne(createHistoryDto.bookId)
        ]);
        if (!user) throw new Error('User not found');
        if (!book) throw new Error('Book not found');
        if(createHistoryDto.numberDate <= 1) {
            throw new Error('Number of days must be greater than 1');
        }
        const history = {
            idUser: req.user._id as string,
            idBook: createHistoryDto.bookId as string,
            borrowDate: new Date(),
            returnDate: new Date(new Date().setDate(new Date().getDate() + createHistoryDto.numberDate)),
        }as any as History;
        book.status = StatusBook.REQUEST;
        await this.bookService.update(book._id as string, book);
        return this.historyService.create(history);
    }

    @Get('all-history')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @ApiBearerAuth('token')
    @ApiOperation({ summary: 'Get all history records (manager only)' })
    @ApiResponse({ status: 200, description: 'Retrieved all history records' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Manager role required' })
    @Roles()
    @ManagerOnly()
    async getAllHistory() {
        return this.historyService.findAll();
    }

    @Post('change-status')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @ApiBearerAuth('token')
    @ApiOperation({ summary: 'Change history status (manager only)' })
    @ApiResponse({ status: 200, description: 'Status changed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Manager role required' })
    @ApiBody({
        schema: {
            example: {
                historyId: "64a7f0c2e4b0f5b6c8d9e0a1",
                status: "APPROVED"
            },
            properties: {
                historyId: { type: 'string', description: 'ID of the history record' },
                status: { type: 'string', enum: Object.keys(StatusHistory), description: 'New status for the history' }
            },
            required: ['historyId', 'status']
        }
    })
    @Roles()
    @ManagerOnly()
    async changeStatus(@Body() data: {historyId: string, status: string}) {
        const history = await this.historyService.findOne(data.historyId);
        if (!history) throw new Error('History not found');
        history.status = StatusHistory[data.status as keyof typeof StatusHistory];
        return this.historyService.update(history._id as string, history);
    }

    @Get('my-history')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @ApiBearerAuth('token')
    @ApiOperation({ summary: 'Get current user history (reader only)' })
    @ApiResponse({ status: 200, description: 'Retrieved user history' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Reader role required' })
    @Roles()
    @ReaderOnly()
    async getMyHistory(@Request() req: RequestWithUser) {
        const userId = req.user._id as string;
        const user = await this.userService.findOne(userId);
        if (!user) throw new Error('User not found');
        return await this.historyService.findAll({idUser: userId});
    }

    @Post('handle-request')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles()
    @ManagerOnly()
    async handleRequest(@Body() data: {historyId: string, approve: boolean}) {
        const history = await this.historyService.findOne(data.historyId);
        if (!history) throw new Error('History not found');
        const book = await this.bookService.findOne(history.idBook);
        if (!book) throw new Error('Book not found');
        if (data.approve) {
            history.status = StatusHistory.BORROWED;
            book.status = StatusBook.BORROWED;
        } else {
            history.status = StatusHistory.CANCELED;
            book.status = StatusBook.AVAILABLE;
        }
        
        await this.bookService.update(book._id as string, book);
        return await this.historyService.update(history._id as string, history);
    }
}