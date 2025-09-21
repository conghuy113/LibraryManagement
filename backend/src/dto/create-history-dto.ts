import { IsNotEmpty, IsString } from "class-validator";

export class CreateHistoryDto {
    @IsString()
    @IsNotEmpty()
    bookId: string;

    @IsNotEmpty()
    numberDate: number;
}