import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsStrongPassword, MaxLength, Matches } from "class-validator";

export class CreateUserDto {
	@IsNotEmpty()
	@MaxLength(50)
	firstName: string;

	@IsNotEmpty()
	@MaxLength(50)
	lastName: string;

	@IsNotEmpty()
	@MaxLength(50)
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsPhoneNumber('VN')
	phoneNumber: string;

	@IsNotEmpty()
	@IsStrongPassword()
	password: string;

	@IsNotEmpty()
	@Matches(/^([0-2][0-9]|(3)[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/, { message: 'DOB must be in format DD/MM/YYYY' })
	DOB: string;

	@IsNotEmpty()
	gender: string;
}