import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { SchoolYear } from './entities/school-year.entity';
import { SchoolYearRepository } from './repository/school-year.repository';

@Injectable()
export class SchoolYearService {
  constructor(private schoolYearRepository: SchoolYearRepository) {}
  async create(createSchoolYearDto: CreateSchoolYearDto): Promise<SchoolYear> {
    try {
      const schoolYear = new SchoolYear();
      schoolYear.name = createSchoolYearDto.name;
      return await schoolYear.save();
    } catch (error) {
      throw new InternalServerErrorException('Error while create school year');
    }
  }

  async findAll(): Promise<SchoolYear[]> {
    try {
      return await this.schoolYearRepository.createQueryBuilder().getMany();
    } catch (error) {
      throw new InternalServerErrorException('Error while getting school year');
    }
  }

  async findOne(id: number): Promise<SchoolYear> {
    try {
      const data = await this.schoolYearRepository.findOne(id);
      if (!data) {
        throw new NotFoundException('School year does not exist');
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateSchoolYearDto: UpdateSchoolYearDto) {
    try {
      const data = await this.schoolYearRepository.findOne(id);
      if (!data) {
        throw new NotFoundException('School year does not exist');
      }
      await this.schoolYearRepository.update(id, updateSchoolYearDto);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const data = await this.schoolYearRepository.findOne(id);
      if (!data) {
        throw new NotFoundException('School year does not exist');
      }
      await this.schoolYearRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async changeStatus(id: number, isActive: boolean) {
    try {
      const data = await this.schoolYearRepository.findOne(id);
      if (!data) {
        throw new NotFoundException('School year does not exist');
      }
      data.isActive = isActive;
      await data.save();
    } catch (error) {
      throw error;
    }
  }

  async setActiveSchoolYear(schoolYearId: number) {
    await this.schoolYearRepository
      .createQueryBuilder('s')
      .update()
      .set({ isActive: false })
      .where('is_active = true')
      .execute();

    return await this.schoolYearRepository.update(schoolYearId, {
      isActive: true,
    });
  }
}
