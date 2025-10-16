import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ImagesDto } from './images.dto';
import { Jimp, JimpMime } from 'jimp';
import { google } from 'googleapis';
import * as crypto from 'crypto';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { GoogleService } from 'src/app/google.service';
import { Readable } from "stream";
import fs from "fs";

@Controller('images')
export class ImagesController {

  constructor(private readonly googleService: GoogleService) {}

  @UseGuards(AuthGuard)
  @Post()
  async getHello(@Body() dto: ImagesDto, @Req() request: Request): Promise<{image:string,url:string}> {
    const newImage = await this.generateImage(dto);
    const result = await newImage.getBase64(JimpMime.jpeg);
    const url = await this.saveImage(newImage,request);
    return {image:result,url:url};
  }

  private async generateImage(dto: ImagesDto){

    const image1 = await Jimp.read(dto.url1);
    const image2 = await Jimp.read(dto.url2);
    const image3 = await Jimp.read(dto.url3);

    const width = Math.max(image1.width + image2.width, image3.width);
    const height = Math.max(image1.height, image2.height) + image3.height;

    const newImage = new Jimp({ width: width, height: height, color: 0xffffffff });
    newImage.composite(image1, 0, 0);
    newImage.composite(image2, image1.width, 0);
    newImage.composite(image3, 0, Math.max(image1.height, image2.height));

    return newImage;
  }

  private async saveImage(image,request: Request):Promise<string>{

    const oauth = this.googleService.getAuthClient()
    const user = request['user'];
    const name = crypto.randomUUID()+'.jpg';
    oauth.setCredentials(user.credentials)
    const auth = new google.auth.GoogleAuth({
      authClient : oauth,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    image.write(name);
    const drive = google.drive({
      version: 'v3',
      auth: auth
    });
    const folderId = process.env.FOLDER_ID ?? "";
    const requestBody = {
      name: name,
      parents: [folderId]
    };
    const media = {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(name)
    };
    const file = await drive.files.create({
      requestBody,
      media: media,
    });
    return "https://drive.google.com/file/d/"+file.data.id+"/view?usp=drive_link";
  }

}
