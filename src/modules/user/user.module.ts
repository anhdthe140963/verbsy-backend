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
import { ContractTypeRepository } from '../static-data/repositories/contract-type.repository';
import { EthnicRepository } from '../static-data/repositories/ethnic.repository';
import { QualificationRepository } from '../static-data/repositories/qualification.repository';
import { StudentStatusRepository } from '../static-data/repositories/student-status.repository';
import { TeacherStatusRepository } from '../static-data/repositories/teacher-status.repository';
import { SubjectRepository } from '../static-data/repositories/subject.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      UserRepository,
      TeacherInfoRepository,
      StudentInfoRepository,
      UserClassRepository,
      ClassesRepository,
      EthnicRepository,
      ContractTypeRepository,
      QualificationRepository,
      StudentStatusRepository,
      TeacherStatusRepository,
      SubjectRepository,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
