import { IsDate, IsPhoneNumber, IsString, Matches, MaxLength } from "class-validator";

export class UpdateUserDto {

    @MaxLength(50)
    firstName?: string;

    @MaxLength(50)
    lastName?: string;

    @IsString()
	@IsPhoneNumber('VN')
    phoneNumber?: string;

    @IsString()
    gender?: string;

    @IsString()
    @Matches(/^([0-2][0-9]|(3)[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/, { message: 'DOB must be in format DD/MM/YYYY' })
    DOB?: string;
}