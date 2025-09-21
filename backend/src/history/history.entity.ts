import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { BaseEntity } from "src/base/base.entity";
import { StatusHistory } from "src/utils/StatusHistory";

export type HistoryDocument = HydratedDocument<History>;

@Schema({ timestamps: {
    createdAt: true,
    updatedAt: true
} })
export class History extends BaseEntity{
    @Prop({type: String, required: true })
    idUser: string;

    @Prop({type: String, required: true })
    idBook: string;

    @Prop({type: Date, required: true })
    borrowDate: Date;

    @Prop({type: Date, required: true })
    returnDate: Date;

    @Prop({type: Date, required: false, default: null })
    actualReturnDate: Date | null;

    @Prop({type: String, enum: StatusHistory, required: true, default: StatusHistory.REQUESTED })
    status: StatusHistory;
}

export const HistorySchema = SchemaFactory.createForClass(History);