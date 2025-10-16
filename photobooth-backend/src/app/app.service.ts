import { Injectable } from '@nestjs/common';
import { GoogleService } from './google.service';
import { Credentials } from 'google-auth-library';

@Injectable()
export class AppService {
  constructor(private googleService: GoogleService) {}

  async googleAuth(): Promise<{ url: string }> {
    const result = await this.googleService.getOAuth2ClientUrl();
    return result
  }

  async getAuthClientData(code: string): Promise<Credentials> {
    return this.googleService.getAuthClientData(code);
  }
}