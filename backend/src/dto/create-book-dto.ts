import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    idBook: string; // Mã sách nội bộ

    @IsNotEmpty()
    @Matches(/^\d{2}-\d{2}-\d{4}$/, { message: 'importDate must be in DD-MM-YYYY format' })
    importDate: String;

    @IsString()
    @IsNotEmpty()
    index: string; // Vị trí/ký hiệu lưu kho

    @IsString()
    @IsNotEmpty()
    idBookCover: string; // ID bìa sách 
}