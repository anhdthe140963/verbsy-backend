import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

export function FileUploadFilter(
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error, acceptFile: boolean) => void,
): void {
  if (isValidFile(file)) callback(null, true);
  else {
    callback(new BadRequestException('File size limit exceeded'), false);
  }
}

function isValidFile(file: Express.Multer.File): boolean {
  //Check file validity

  return true;
}
