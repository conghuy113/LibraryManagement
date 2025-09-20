import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { BaseEntity } from "src/base/base.entity";

export type TypeBookDocument = HydratedDocument<TypeBook>;

@Schema({ timestamps: {
    createdAt: true,
    updatedAt: true
} })
export class TypeBook extends BaseEntity {
    @Prop({ required: true, trim: true, type: String })
    name: string; // Tên loại sách

    @Prop({ required: true, trim: true,type: String })
    description: string; // Mô tả loại sách
}

export const TypeBookSchema = SchemaFactory.createForClass(TypeBook);