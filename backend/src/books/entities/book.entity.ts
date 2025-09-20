import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { BaseEntity } from "src/base/base.entity";
import { IndexBook } from "src/utils/IndexBook";

export type BookDocument = HydratedDocument<Book>;

@Schema({ timestamps: {
    createdAt: true,
    updatedAt: true
} })
export class Book extends BaseEntity {
    @Prop({ required: true, unique: true, trim: true })
    idBook: string; // Mã sách nội bộ

    @Prop({ required: true, type: Date })
    importDate: Date;

    @Prop({ required: false, default: ""})
    status: string; 

    @Prop({ required: true, type: String, enum: IndexBook })
    index: string; // Vị trí/ký hiệu lưu kho

    @Prop({ required: true})
    idBookCover: string; // ID bìa sách
}

export const BookSchema = SchemaFactory.createForClass(Book);