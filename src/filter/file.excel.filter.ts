import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

export default (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error, acceptFile: boolean) => void,
): void => {
  if (isExcelFile(file)) callback(null, true);
  else {
    callback(
      new BadRequestException('File is not an Excel spreadsheet'),
      false,
    );
  }
};
function isExcelFile(file: Express.Multer.File): boolean {
  return file.originalname.endsWith('.xlsx');
}
