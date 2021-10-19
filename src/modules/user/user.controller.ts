import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaginationEnum } from 'src/constant/pagination.enum';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { GenerateAccountDto } from './dto/generate-account.dto';
import { GetUserDto } from './dto/get-user.dto';
import { GetUserFilter } from './dto/get-user.filter';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Post('student/generate-account')
  async generateStudentAccount(
    @Body() genAccDto: GenerateAccountDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Account created',
      data: await this.userService.generateStudentAccount(genAccDto),
    };
  }
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get('users')
  async getUserByFilter(
    @Query() filter: GetUserFilter,
  ): Promise<{ statusCode; error; message; data }> {
    filter.page = filter.page ? filter.page : PaginationEnum.DefaultPage;
    filter.limit = filter.limit ? filter.limit : PaginationEnum.DefaultLimit;
    const data = await this.userService.getUserByFilter(
      {
        page: filter.page,
        limit: filter.limit,
      },
      filter.roleId,
    );
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get user data successfully',
      data: data,
    };
  }
  @UseGuards(AuthGuard(), RolesGuard)
  @Get(':userId')
  async getUserDetail(@Param('userId') userId: number): Promise<GetUserDto> {
    return await this.userService.getUserDetail(userId);
  }
}
