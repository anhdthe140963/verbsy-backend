import { Injectable } from '@nestjs/common';
import { ContractTypeRepository } from './repositories/contract-type.repository';
import { EthnicRepository } from './repositories/ethnic.repository';
import { QualificationRepository } from './repositories/qualification.repository';
import { StudentStatusRepository } from './repositories/student-status.repository';
import { SubjectRepository } from './repositories/subject.repository';
import { TeacherStatusRepository } from './repositories/teacher-status.repository';

@Injectable()
export class StaticDataService {
  constructor(
    private readonly ethnicRepository: EthnicRepository,
    private readonly contractTypeRepository: ContractTypeRepository,
    private readonly qualificationRepository: QualificationRepository,
    private readonly studentStatusRepository: StudentStatusRepository,
    private readonly teacherStatusRepository: TeacherStatusRepository,
    private readonly subjectRepository: SubjectRepository,
  ) {}

  async getStaticData() {
    const ethnics = await this.ethnicRepository.find();
    const contractTypes = await this.contractTypeRepository.find();
    const qualifications = await this.qualificationRepository.find();
    const studentStatuses = await this.studentStatusRepository.find();
    const teacherStatuses = await this.teacherStatusRepository.find();
    const subjects = await this.subjectRepository.find();

    return {
      ethnics,
      contractTypes,
      qualifications,
      studentStatuses,
      teacherStatuses,
      subjects,
    };
  }
}
