import { Module } from "@nestjs/common";
import { BookModule } from "src/books/book.module";
import { UserModule } from "src/user/user.module";
import { HistoryController } from "./history.controller";
import { HistoryService } from "./history.service";
import { MongooseModule } from "@nestjs/mongoose";
import { History, HistorySchema } from "./history.entity";
import { HistoryRepository } from "./history.repository";

@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: History.name,
                useFactory: () => HistorySchema
            }
        ]),        
        UserModule,
        BookModule
    ],
    controllers: [HistoryController],
    providers: [{
        provide: 'HistoryRepositoryInterface',
        useClass: HistoryRepository
    },HistoryService],
    exports: [HistoryService],
})
export class HistoryModule {}