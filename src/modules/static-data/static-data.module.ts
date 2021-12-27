import { Module } from '@nestjs/common';
import { StaticDataService } from './static-data.service';
import { StaticDataController } from './static-data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthnicRepository } from './repositories/ethnic.repository';
import { ContractTypeRepository } from './repositories/contract-type.repository';
import { QualificationRepository } from './repositories/qualification.repository';
import { StudentStatusRepository } from './repositories/student-status.repository';
import { TeacherStatusRepository } from './repositories/teacher-status.repository';
import { SubjectRepository } from './repositories/subject.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EthnicRepository,
      ContractTypeRepository,
      QualificationRepository,
      StudentStatusRepository,
      TeacherStatusRepository,
      SubjectRepository,
    ]),
  ],

  controllers: [StaticDataController],
  providers: [StaticDataService],
})
export class StaticDataModule {}
