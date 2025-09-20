import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTypeBookDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsNotEmpty()
    @MaxLength(500)
    description: string;
}
