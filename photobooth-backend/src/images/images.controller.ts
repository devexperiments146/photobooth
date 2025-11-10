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
    const logo = await Jimp.read("public/logo.png");
    const image1 = await Jimp.read(dto.url1);
    const image2 = await Jimp.read(dto.url2);
    const image3 = await Jimp.read(dto.url3);

    const spacing = 50;
    const margin = 30;

    const row1Width = image1.width + spacing + image2.width;
    const row1Height = Math.max(image1.height, image2.height);
    const totalWidth = Math.max(row1Width, image3.width);
    const totalHeight = row1Height + spacing + image3.height;

    const newImage = new Jimp({
      width: totalWidth,
      height: totalHeight,
      color: 0xffffffff,
    });

    newImage.composite(image1, 0, 0);
    newImage.composite(image2, image1.width + spacing, 0);
    newImage.composite(image3, 0, row1Height + spacing);

    const logoWidth = totalWidth * 0.4;
    const logoHeight = (logoWidth / logo.width) * logo.height;
    logo.resize({ w: logoWidth, h: logoHeight });

    // centré dans le bloc bas droit
    const rightSectionX = image1.width + spacing;
    const rightSectionWidth = image2.width;
    const logoX = rightSectionX + (rightSectionWidth - logoWidth) / 2;
    const logoY = totalHeight - logoHeight - margin;

    newImage.composite(logo, logoX, logoY);
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
