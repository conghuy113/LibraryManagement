import { IsDate, IsEmail, IsPhoneNumber, MaxLength } from "class-validator";

export class UpdateUserDto {
    @IsEmail()
    email: string;

    @MaxLength(50)
    firstName?: string;

    @MaxLength(50)
    lastName?: string;

    @IsPhoneNumber()
    phoneNumber?: string;

    gender?: string;

    @IsDate()
    DOB?: Date;
}