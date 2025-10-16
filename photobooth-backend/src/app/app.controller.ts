import { Controller, Get, Redirect, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,private readonly jwtService: JwtService) {}

  @Get('google-auth')
  async googleAuth(): Promise<{ url: string }> {
    return this.appService.googleAuth();
  }

  @Get('google-callback')
  @Redirect()
  async googleAuthCallback(@Query('code') code: string): Promise<{ url: string }> {
    const credentials = await this.appService.getAuthClientData(code);
    const payload = { 
        credentials :  credentials
    };
    const token = await this.jwtService.signAsync(payload)
    const url = process.env.REDIRECT_TO_LOGIN + "?auth_token="+token;

    return { url: url};
  }
}