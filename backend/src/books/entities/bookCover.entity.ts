import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { BaseEntity } from "src/base/base.entity";

export type BookCoverDocument = HydratedDocument<BookCover>;

@Schema({ timestamps: {
    createdAt: true,
    updatedAt: true
} })
export class BookCover extends BaseEntity {
    @Prop({ required: true, trim: true, maxlength: 255 })
    title: string;

    @Prop({ required: true, trim: true, maxlength: 255 })
    authorName: string;

    @Prop({ required: true, trim: true, regexp: /^\d{4}$/ })
    publicationYear: string;

    @Prop({ required: true, trim: true, maxlength: 255 })
    publisher: string;

    @Prop({ required: true})
    typeBookId: string; 

    @Prop({ required: false, trim: true })
    image: string; // URL ảnh bìa
}

export const BookCoverSchema = SchemaFactory.createForClass(BookCover);