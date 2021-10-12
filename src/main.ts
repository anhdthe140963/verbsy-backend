import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const config = new DocumentBuilder()
    .setTitle('Verbsy api')
    .setDescription('Verbsy api description')
    .setVersion('1.0')
    .addTag('Verbsy')
    .build();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  await app.listen(process.env.PORT);
  logger.log(`App listening on ${process.env.PORT}`);
}
bootstrap();
