import { Module } from '@nestjs/common';
import { UserClassService } from './user-class.service';
import { UserClassController } from './user-class.controller';
import { UserClassRepository } from './repository/question.repository';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../user/repository/user.repository';
import { ClassesRepository } from '../classes/repository/classes.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      UserClassRepository,
      UserRepository,
      ClassesRepository,
    ]),
  ],
  controllers: [UserClassController],
  providers: [UserClassService],
})
export class UserClassModule {}
