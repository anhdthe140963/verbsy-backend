import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles.guard';
import { GetUserDto } from './dto/get-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @Get(':userId')
  async getUserDetail(@Param('userId') userId: number): Promise<GetUserDto> {
    return await this.userService.getUserDetail(userId);
  }
}
