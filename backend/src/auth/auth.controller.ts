import { Body, Controller, Get, Param, Post, Req, Request, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./service/auth.service";
import { LocalGuard } from "./guards/local.guard";
import { CreateUserDto } from "src/dto/create-user.dto";
import type { VerifyEmailTokenDto } from "src/dto/verify-email-token.dto";
import type { RequestWithUser } from "src/types/requests.type";
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from "./guards/jwt.guard";


@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}
    

    @ApiOperation({ summary: 'User login' })
    @ApiBody({
        description: 'User credentials',
        schema: {
            example: {
                email: 'user@example.com',
                password: 'yourPassword123'
            },
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'yourPassword123' }
            },
            required: ['email', 'password'],
        },
    })
    @ApiResponse({ status: 201, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @UseGuards(LocalGuard)
    @Post('login')
    async login(@Request() request: RequestWithUser) {
        const { user } = request;
        return this.authService.login(user._id as string);
    }

    @ApiOperation({ summary: 'Register a new reader' })
    @ApiBody({
        schema: {
            example: {
                "email": "conghuy.fptu@gmail.com",
                "password": "Conghuy123...",
                "firstName": "Nguyen Van A",
                "lastName": "pico",
                "phoneNumber": "0332617645",
                "gender": "male",
                "DOB": "07/01/2004"
            },
            properties: {
                email: { type: 'string', example: 'huy@gmaiil.com' },
                password: { type: 'string', example: 'Conghuy123...' },
                firstName: { type: 'string', example: 'Nguyen Van A' },
                lastName: { type: 'string', example: 'pico' },
                phoneNumber: { type: 'string', example: '0332617645' },
                gender: { type: 'string', example: 'male' },
                DOB: { type: 'string', format: 'date', example: '07/01/2004' }
            },
            required: ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'gender', 'DOB'],
        },
    })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @Post('register-reader')
    @UsePipes(new ValidationPipe({ transform: true }))
    async registerReader(@Body() createUserDto: CreateUserDto, @Request() req) {
        return await this.authService.registerReader(createUserDto);
    }

    @ApiOperation({ summary: 'Verify email with token' })
    @ApiResponse({ status: 200, description: 'Email verified successfully' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    @UsePipes(new ValidationPipe({ transform: true }))
    @Get('email/verify/:token')
    async verifyEmail(@Param() params: VerifyEmailTokenDto) {
        return this.authService.verifyEmail(params.token);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Refresh access and refresh tokens' })
    @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post('refresh-token')
    async refreshTokens(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshTokens(refreshToken);
    }
    

    @ApiOperation({ summary: 'User logout' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    async logout(@Body('refreshToken') refreshToken: string) {
        await this.authService.logout(refreshToken);
        return {
            message: 'Logout successful',
        };
    }
}