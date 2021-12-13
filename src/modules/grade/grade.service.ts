import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from 'src/constant/role.enum';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { SchoolYearRepository } from '../school-year/repository/school-year.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Grade } from './entities/grade.entity';
import { GradeRepository } from './repository/school-year.repository';

@Injectable()
export class GradeService {
  constructor(
    private gradeRepository: GradeRepository,
    private schoolYearRepository: SchoolYearRepository,
    private classRepository: ClassesRepository,
    private userClassRepository: UserClassRepository,
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
      const grades = await this.gradeRepository.find({
        order: { name: 'ASC' },
      });
      for (let grade of grades) {
        let classes = [];
        if (user.role == Role.Administrator) {
          classes = await this.classRepository.find({
            where: { gradeId: grade.id },
            order: { name: 'ASC' },
          });
        } else {
          const userClasses = await this.userClassRepository.find({
            teacherId: user.id,
          });
          for (const uc of userClasses) {
            const cl = await this.classRepository.findOne(uc.classId);
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
      const data = await this.gradeRepository.findOne(id);
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
      const data = await this.gradeRepository.findOne(id);
      if (!data) {
        throw new NotFoundException('Grade does not exist');
      }
      await this.gradeRepository.update(id, updateGradeDto);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const data = await this.gradeRepository.findOne(id);
      if (!data) {
        throw new NotFoundException('Grade does not exist');
      }
      await this.gradeRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }
}
