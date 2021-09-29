import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../user/repository/user.repository';
import { LogInDto } from './dto/log-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ accessToken }> {
    const user = await this.userRepository.createUser(signUpDto);
    const payload = { email: user.email };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken: accessToken };
  }

  async logIn(logInDto: LogInDto): Promise<{ accessToken }> {
    const user = await this.userRepository.validate(logInDto);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const email = user.email;
    const payload = { email };
    const accessToken = await this.jwtService.sign(payload);
    return {
      accessToken: accessToken,
    };
  }
}
