import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUserDto } from '../user/dto/get-user.dto';
import { UserRepository } from '../user/repository/user.repository';
import { LogInDto } from './dto/log-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ user; accessToken }> {
    const user = await this.userRepository.createUser(signUpDto);
    const payload: JwtPayload = { username: user.username };
    const accessToken = await this.jwtService.sign(payload);

    //set data for user info
    const getUserDto = new GetUserDto();
    getUserDto.username = user.username;
    getUserDto.fullName = user.fullName;
    getUserDto.email = user.email;
    getUserDto.phone = user.phone;
    getUserDto.id = user.id;
    getUserDto.role = user.role;
    getUserDto.avatar = user.avatar;
    return { user: getUserDto, accessToken: accessToken };
  }

  async logIn(logInDto: LogInDto): Promise<{ user; accessToken }> {
    const user = await this.userRepository.validate(logInDto);
    //check if user is authenticated
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const username = user.username;
    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);
    //set data for user info
    const getUserDto = new GetUserDto();
    getUserDto.username = user.username;
    getUserDto.fullName = user.fullName;
    getUserDto.email = user.email;
    getUserDto.phone = user.phone;
    getUserDto.id = user.id;
    getUserDto.role = user.role;
    getUserDto.avatar = user.avatar;
    return {
      user: getUserDto,
      accessToken: accessToken,
    };
  }
}
