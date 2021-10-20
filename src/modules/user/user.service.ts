import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { GenerateAccountDto } from './dto/generate-account.dto';
import { GetUserDto } from './dto/get-user.dto';
import { User } from './entity/user.entity';
import { UserRepository } from './repository/user.repository';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepo: UserRepository,
  ) {}

  async getUserDetail(userId: number): Promise<GetUserDto> {
    const user = await this.userRepo.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not exist');
    }
    const getUserDto = new GetUserDto();
    getUserDto.username = user.username;
    getUserDto.fullName = user.fullName;
    getUserDto.email = user.email;
    getUserDto.phone = user.phone;
    getUserDto.id = user.id;
    getUserDto.role = user.role;
    getUserDto.avatar = user.avatar;
    return getUserDto;
  }

  async generateStudentAccount(
    genAccDto: GenerateAccountDto,
  ): Promise<Record<string, unknown>> {
    const { firstName, middleName, lastName } = genAccDto;
    let user = new User();
    user = await user.save();
    let username = firstName + lastName.slice(0, 1);
    if (middleName) {
      username = username + middleName.slice(0, 1);
    }
    username = username + user.id;
    const randomPassword = Math.random().toString(36).slice(-8);

    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await this.userRepo.hashPassword(randomPassword, user.salt);
    await user.save();
    return { username: username, password: randomPassword };
  }

  async getUserByFilter(
    options: IPaginationOptions,
    roleId: number,
  ): Promise<Pagination<User>> {
    try {
      return await paginate<User>(this.userRepo, options, {
        where: `role = ${roleId}`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
