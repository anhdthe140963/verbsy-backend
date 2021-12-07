import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { SchoolYear } from './entities/school-year.entity';

@Injectable()
export class SchoolYearService {
  constructor(
    @InjectRepository(SchoolYear)
    private schoolYearRepo: Repository<SchoolYear>,
  ) {}
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
      return await this.schoolYearRepo.createQueryBuilder().getMany();
    } catch (error) {
      throw new InternalServerErrorException('Error while getting school year');
    }
  }

  async findOne(id: number): Promise<SchoolYear> {
    try {
      const data = await this.schoolYearRepo.findOne(id);
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
      const data = await this.schoolYearRepo.findOne(id);
      if (!data) {
        throw new NotFoundException('School year does not exist');
      }
      await this.schoolYearRepo.update(id, updateSchoolYearDto);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const data = await this.schoolYearRepo.findOne(id);
      if (!data) {
        throw new NotFoundException('School year does not exist');
      }
      await this.schoolYearRepo.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async changeStatus(id: number, isActive: boolean) {
    try {
      const data = await this.schoolYearRepo.findOne(id);
      if (!data) {
        throw new NotFoundException('School year does not exist');
      }
      data.isActive = isActive;
      await data.save();
    } catch (error) {
      throw error;
    }
  }
}
