import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { LessonMaterialService } from './lesson-material.service';
import { Storage } from '@google-cloud/storage';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { FileUploadFilter } from 'src/filter/file.upload.filter';
import { GetUser } from 'src/decorator/get-user-decorator';
import { User } from '../user/entity/user.entity';

@Controller('lesson-material')
export class LessonMaterialController {
  private storage = new Storage({
    keyFilename: process.env.GCS_KEYFILE,
  }).bucket(process.env.GCS_BUCKET);

  private readonly cloudStorageFolderPath = 'lesson-material';

  constructor(private readonly lessonMaterialService: LessonMaterialService) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @Get('/:lessonId')
  async getMaterialsByLessonId(@Param('lessonId') lessonId: number) {
    return {
      statusCode: HttpStatus.CREATED,
      data: await this.lessonMaterialService.getMaterialsByLessonId(lessonId),
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: FileUploadFilter,
      storage: multer.memoryStorage(),
    }),
  )
  async createLessonMaterial(
    @UploadedFile('file') file: Express.Multer.File,
    @Body('lessonId') lessonId: number,
    @Body('displayName') displayName: string,
    @GetUser() user: User,
  ) {
    try {
      //Check if lesson exist
      if (!(await this.lessonMaterialService.isLessonExist(lessonId))) {
        throw new BadRequestException('Lesson not exist');
      }

      //Check if file already exist
      if (
        await this.lessonMaterialService.isMaterialExist(
          lessonId,
          `https://storage.googleapis.com/${this.storage.name}/${this.cloudStorageFolderPath}/${lessonId}/${file.originalname}`,
        )
      ) {
        throw new BadRequestException('File already exist');
      }

      //Upload file
      const blob = this.storage.file(
        `${this.cloudStorageFolderPath}/${lessonId}/${file.originalname}`,
      );
      const blobStream = blob.createWriteStream({ public: true });
      blobStream.end(file.buffer);

      blobStream.on('error', () => {
        throw new InternalServerErrorException('Error during file upload');
      });

      //Add to Lesson and create DB record
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Lesson material added',
        data: await this.lessonMaterialService.createLessonMaterial({
          displayName: displayName,
          lessonId: lessonId,
          uploaderId: user.id,
          url: blob.publicUrl(),
        }),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Delete('/:id')
  async delete(@Param('id') id: number) {
    const lesson = await this.lessonMaterialService.getMaterial(id);
    await this.storage
      .file(
        lesson.url.replace(
          `https://storage.googleapis.com/${this.storage.name}/`,
          '',
        ),
      )
      .delete()
      .catch((error: Error) => {
        console.log(error);
        throw new InternalServerErrorException(
          'Exception during cloud file deletion',
        );
      });
    const deleted = await this.lessonMaterialService.deleteLessonMaterial(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lesson material deleted succesfully',
      data: deleted,
    };
  }
}
