import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { Body, Controller, Post, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateUserDto } from 'src/dto/update-user.dto';

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
}