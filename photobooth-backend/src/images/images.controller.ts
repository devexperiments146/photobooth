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
    const verticalMode = process.env.VERTICAL_MODE ? process.env.VERTICAL_MODE === "true" :  false;
    let newImage;
    if(verticalMode){
      newImage = await this.generateVerticalImage(dto);
    }else{
       newImage = await this.generateHorizontalImage(dto);
    }
    const result = await newImage.getBase64(JimpMime.jpeg);
    const url = await this.saveImage(newImage,request);
    return {image:result,url:url};
  }

  private async generateHorizontalImage(dto: ImagesDto){
    const logo = await Jimp.read("public/logo.png");
    const image1 = await Jimp.read(dto.url1);
    const image2 = await Jimp.read(dto.url2);
    const image3 = await Jimp.read(dto.url3);

    const spacing = 50;
    const margin = 30;

    // Dimensions du contenu (sans marges)
    const row1Width = image1.width + spacing + image2.width;
    const row1Height = Math.max(image1.height, image2.height);
    const totalWidth = Math.max(row1Width, image3.width);
    const totalHeight = row1Height + spacing + image3.height;

    // Taille finale AVEC marges sur les 4 côtés
    const finalWidth = totalWidth + margin * 2;
    const finalHeight = totalHeight + margin * 2;

    // Création de l'image avec fond blanc
    const newImage = new Jimp({
      width: finalWidth,
      height: finalHeight,
      color: 0xffffffff,
    });

    // Placement des images avec décalage = marge
    newImage.composite(image1, margin, margin);
    newImage.composite(image2, margin + image1.width + spacing, margin);
    newImage.composite(image3, margin, margin + row1Height + spacing);

    // Redimension du logo
    const logoWidth = totalWidth * 0.4;
    const logoHeight = (logoWidth / logo.width) * logo.height;
    logo.resize({ w: logoWidth, h: logoHeight });

    // Calcul de la position du logo (dans le bloc bas droit)
    const rightSectionX = margin + image1.width + spacing;
    const rightSectionWidth = image2.width;
    const logoX = rightSectionX + (rightSectionWidth - logoWidth) / 2;
    const logoY = margin + totalHeight - logoHeight - margin;

    newImage.composite(logo, logoX, logoY);
    return newImage;
  }

  
  private async generateVerticalImage(dto: ImagesDto){
  const logo = await Jimp.read("public/logo.png");
    const images = [
      await Jimp.read(dto.url1),
      await Jimp.read(dto.url2),
      await Jimp.read(dto.url3),
    ];

    const spacing = 50;
    const margin = 30;

    // Calcul des dimensions totales
    const maxWidth = Math.max(...images.map((img) => img.width));
    const totalHeight =
      images.reduce((sum, img) => sum + img.height, 0) + spacing * (images.length - 1);

    // Taille du logo (40% de la largeur totale)
    const logoWidth = maxWidth * 0.4;
    const logoHeight = (logoWidth / logo.width) * logo.height;
    logo.resize({ w: logoWidth, h: logoHeight });

    // Hauteur finale avec marges et logo
    const finalWidth = maxWidth + margin * 2;
    const finalHeight = totalHeight + logoHeight + spacing + margin * 2;

    // Création de l’image finale (fond blanc)
    const newImage = new Jimp({
      width: finalWidth,
      height: finalHeight,
      color: 0xffffffff,
    });

    // Placement des images verticalement
    let currentY = margin;
    for (const img of images) {
      const x = margin + (maxWidth - img.width) / 2; // centrer horizontalement
      newImage.composite(img, x, currentY);
      currentY += img.height + spacing;
    }

    // Placement du logo tout en bas, centré
    const logoX = margin + (maxWidth - logoWidth) / 2;
    const logoY = currentY;
    newImage.composite(logo, logoX, logoY);
    return newImage;
  }


  private async saveImage(image,request: Request):Promise<string>{

    const oauth = this.googleService.getAuthClient()
    const user = request['user'];
    const name = 'festirecre2025_'+crypto.randomUUID()+'.jpg';
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
    fs.unlinkSync(name);
    return "https://drive.google.com/uc?export=download&id="+file.data.id;
  }

}
