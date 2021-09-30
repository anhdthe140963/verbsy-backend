import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUserDto } from './dto/get-user.dto';
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
}
