import {  IsNotEmpty, IsString, Matches, IsOptional } from "class-validator";
import { IndexBook } from "src/utils/IndexBook";
import { StatusBook } from "src/utils/StatusBook";

export class UpdateBookDto {
    @IsNotEmpty()
    @IsString()
    id: string; // ID của cuốn sách cần cập nhật

    @IsOptional()
    @IsString()
    idBook?: string; // Mã sách nội bộ

    @IsOptional()
    @IsString()
    @Matches(/^\d{2}-\d{2}-\d{4}$/, { message: 'importDate must be in DD-MM-YYYY format' })
    importDate?: string;

    @IsOptional()
    @IsString()
    index?: IndexBook; // Vị trí/ký hiệu lưu kho

    @IsOptional()
    @IsString()
    status?: StatusBook;
}