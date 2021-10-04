import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LogInDto } from 'src/modules/auth/dto/log-in.dto';
import { SignUpDto } from 'src/modules/auth/dto/sign-up.dto';
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(signUpDto: SignUpDto) {
    const { email, username, password } = signUpDto;
    const userByEmailorUsername = this.find({
      where: [{ email: email }, { username: username }],
    });
    if (userByEmailorUsername) {
      throw new BadRequestException('Duplicated username or email');
    }
    const user = new User();
    user.username = username;
    user.email = email;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    await user.save();
    return user;
  }

  async validate(logInDto: LogInDto) {
    const user = await this.createQueryBuilder()
      .where('email = :email', {
        email: logInDto.email,
      })
      .getOne();
    if (user && (await user.validatePassword(logInDto.password))) {
      return user;
    }
    return null;
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
