import { IsString, IsStrongPassword } from "class-validator";

export class ChangePasswordDto {
    @IsString()
    @IsStrongPassword()
    oldPassword: string;
    
    @IsString()
    @IsStrongPassword()
    newPassword: string;
}