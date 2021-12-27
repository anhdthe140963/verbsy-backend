import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/constant/role.enum';
import { LogInDto } from 'src/modules/auth/dto/log-in.dto';
import { SignUpDto } from 'src/modules/auth/dto/sign-up.dto';
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(signUpDto: SignUpDto) {
    const { email, username, password, fullname } = signUpDto;
    const userByEmailorUsername = await this.find({
      where: [{ email: email }, { username: username }],
    });
    //check if username or email is duplicated
    if (userByEmailorUsername.length != 0) {
      throw new BadRequestException('Duplicated username or email');
    }
    const user = new User();
    user.username = username;
    user.email = email;
    user.fullName = fullname;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    user.role = Role.Administrator;
    await user.save();
    return user;
  }

  async validate(logInDto: LogInDto) {
    const user = await this.createQueryBuilder('u')
      .where('username = :username', {
        username: logInDto.username,
      })
      .addSelect('u.salt')
      .addSelect('u.password')
      .getOne();
    if (user && (await user.validatePassword(logInDto.password))) {
      await this.update(
        { id: user.id },
        { lastLogin: new Date().toLocaleString() },
      );
      return user;
    }
    return null;
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  async isUserExist(userId: number): Promise<boolean> {
    if (await this.findOne(userId)) {
      return true;
    }
    return false;
  }
}
