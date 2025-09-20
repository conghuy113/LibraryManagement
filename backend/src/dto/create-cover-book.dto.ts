import { IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";

export class CreateCoverBookDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    authorName: string

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{4}$/, { message: 'Publication year must be a 4-digit year' })
    publicationYear: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    publisher: string;

    @IsString()
    @IsNotEmpty()
    typeBookId: string;

    @IsString()
    image?: string; // URL ảnh bìa
}