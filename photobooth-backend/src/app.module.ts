import { Module } from '@nestjs/common';
import { ImagesController } from './images/images.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleService } from './app/google.service';
import { AppService } from './app/app.service';
import { AppController } from './app/app.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),],
  controllers: [ ImagesController, AppController],
  providers: [AppService, GoogleService, ConfigService]
})
export class AppModule {}


