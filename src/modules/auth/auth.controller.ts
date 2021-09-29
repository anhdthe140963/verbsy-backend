import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LogInDto } from './dto/log-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<{ accessToken }> {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  signIn(@Body() logInDto: LogInDto): Promise<{ accessToken }> {
    return this.authService.logIn(logInDto);
  }
}
