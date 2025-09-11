import { UserService } from './user.service';
import { Body, Controller, Get, Post, Req, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) {}

	@Post('update-user')
	@ApiOperation({
		summary: 'Update user information',
		description: `
    * Reader/Manager can use this API
		`
	})
	@UsePipes(new ValidationPipe({transform: true}))
	updateReader(@Body() update_user_dto: UpdateUserDto) {
		return this.userService.updateReader(update_user_dto);
	}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({
		summary: 'Get user profile',
		description: `
		* User can use this API
		`
	})
	@ApiOperation({ summary: 'Get user profile' })
	@ApiBearerAuth()
	getProfile(@Request() req) {
		const user = this.userService.getMe(req.user._id as string);
		if (!user) throw new Error('User not found');
		return user;
	}
}