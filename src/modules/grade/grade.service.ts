import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/constant/role.enum';
import { Repository } from 'typeorm';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { SchoolYear } from '../school-year/entities/school-year.entity';
import { UserClass } from '../user-class/entity/user-class.entity';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Grade } from './entities/grade.entity';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepo: Repository<Grade>,
    @InjectRepository(SchoolYear)
    private schoolYearRepo: Repository<SchoolYear>,
    private classRepo: ClassesRepository,
    private userClassRepo: UserClassRepository,
  ) {}
  async create(createGrade: CreateGradeDto): Promise<Grade> {
    try {
      const grade = new Grade();
      grade.name = createGrade.name;
      return await grade.save();
    } catch (error) {
      throw error;
    }
  }

  async getGradesForUser(user: User): Promise<Grade[]> {
    try {
      const grades = await this.gradeRepo.find({ order: { name: 'ASC' } });
      for (let grade of grades) {
        let classes = [];
        if (user.role == Role.Administrator) {
          classes = await this.classRepo.find({
            where: { gradeId: grade.id },
            order: { name: 'ASC' },
          });
        } else {
          const userClasses = await this.userClassRepo.find({
            teacherId: user.id,
          });
          for (const uc of userClasses) {
            const cl = await this.classRepo.findOne(uc.classId);
            if (cl.gradeId == grade.id) {
              classes.push(cl);
            }
          }
        }
        grade = Object.assign(grade, { classes: classes });
      }
      return grades;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<Grade> {
    try {
      const data = await this.gradeRepo.findOne(id);
      if (!data) {
        throw new NotFoundException('Grade does not exist');
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateGradeDto: UpdateGradeDto) {
    try {
      const data = await this.gradeRepo.findOne(id);
      if (!data) {
        throw new NotFoundException('Grade does not exist');
      }
      await this.gradeRepo.update(id, updateGradeDto);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const data = await this.gradeRepo.findOne(id);
      if (!data) {
        throw new NotFoundException('Grade does not exist');
      }
      await this.gradeRepo.delete(id);
    } catch (error) {
      throw error;
    }
  }
}
