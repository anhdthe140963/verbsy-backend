import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LogInDto } from './dto/log-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<{ user; accessToken }> {
    return await this.authService.signUp(signUpDto);
  }

  @Post('login')
  async signIn(@Body() logInDto: LogInDto): Promise<{ user; accessToken }> {
    return await this.authService.logIn(logInDto);
  }
}
