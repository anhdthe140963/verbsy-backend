import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repository/user.repository';
import { TeacherInfoRepository } from './repository/teacher-info.repostitory';
import { StudentInfoRepository } from './repository/student-info.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { ClassesRepository } from '../classes/repository/classes.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      UserRepository,
      TeacherInfoRepository,
      StudentInfoRepository,
      UserClassRepository,
      ClassesRepository,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
