import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({ limit: '50mb' }));

  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Images')
    .setDescription('Images')
    .setVersion('1.0')
    .addTag('images')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();