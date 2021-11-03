import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { Storage } from '@google-cloud/storage';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { FileUploadFilter } from 'src/filter/file.upload.filter';

@Controller('upload')
export class UploadController {
  private storage = new Storage({
    keyFilename: process.env.GCS_KEYFILE,
  }).bucket(process.env.GCS_BUCKET);
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: FileUploadFilter,
      storage: multer.memoryStorage(),
    }),
  )
  async upload(@UploadedFile('file') file: Express.Multer.File) {
    try {
      console.log(file.size);

      const blob = this.storage.file('bro/' + file.originalname);
      const blobStream = blob.createWriteStream({ public: true });

      blobStream.end(file.buffer);

      return file;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
