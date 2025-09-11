import { UserService } from './user.service';
import { Body, Controller, Get, Post, Req, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { AdminOnly, ReaderOnly, Roles } from 'src/auth/decorators/roles.decorator';

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
	@ReaderOnly()
	getProfile(@Request() req) {
		const user = this.userService.getMe(req.user._id as string);
		if (!user) throw new Error('User not found');
		return user;
	}

	@Get('all-users')
	@UseGuards(JwtAuthGuard,RoleGuard)
	@ApiOperation({
		summary: 'Get all users',
		description: `
		* Admin can use this API
		`
	})
	@ApiBearerAuth()
	@Roles()
	@AdminOnly()
	getAllUsers() {
		return this.userService.getAllUsers();
	}

	@Post('update-user-admin')
	@UseGuards(JwtAuthGuard,RoleGuard)
	@ApiOperation({
		summary: 'Admin update user role/status',
		description: `
		* Admin can use this API
		`
	})
	@ApiBearerAuth()
	@Roles()
	@AdminOnly()
	updateUserByAdmin(@Body() body: {id: String, status: string, role: string}) {
		return this.userService.updateUser(body.id, body.status as any, body.role as any);
	}
}