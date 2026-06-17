import { Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ImagesDto } from './images.dto';
import { Jimp, JimpMime } from 'jimp';
import { google } from 'googleapis';
// import * as crypto from 'crypto'; // Inutilisé dans ce fragment
import { AuthGuard } from 'src/app/guards/auth.guard';
import { GoogleService } from 'src/app/google.service';
// import { Readable } from "stream"; // Inutilisé dans ce fragment
import fs from "fs";

@Controller('images')
export class ImagesController {

  constructor(private readonly googleService: GoogleService) {}


    @UseGuards(AuthGuard)
    @Delete(':id')
    async delete(@Req() request: Request,@Param('id') id: string): Promise<void> {
      await this.deleteImage(id,request);
    }
    
  @UseGuards(AuthGuard)
  @Post()
  async getHello(@Body() dto: ImagesDto, @Req() request: Request): Promise<{image:string,url:string,id:string}> {
    const verticalMode = process.env.VERTICAL_MODE ? process.env.VERTICAL_MODE === "true" : false;
    let newImage;
    if(verticalMode){
      newImage = await this.generateVerticalImage(dto);
    }else{
       newImage = await this.generateHorizontalImage(dto);
    }
    const result = await newImage.getBase64(JimpMime.jpeg);
    const { url ,id} = await this.saveImage(newImage,request);
    return {image:result,url:url,id:id};
  }

private async generateHorizontalImage(dto: ImagesDto) {
    const logo = await Jimp.read("public/logo.png");
    const image1 = await Jimp.read(dto.url1);
    const image2 = await Jimp.read(dto.url2);
    const image3 = await Jimp.read(dto.url3);

    const spacing = 50;
    const margin = 30;

    // Dimensions du contenu
    const row1Width = image1.width + spacing + image2.width;
    const row1Height = Math.max(image1.height, image2.height);

    const totalWidth = Math.max(row1Width, image3.width);
    const totalHeight = row1Height + spacing + image3.height;

    // === NOUVEAU : LOGO EN VERSION MAXI ===
    // On base la taille du logo sur 45% de la largeur TOTALE du montage, 
    // ainsi il dépassera largement la taille de la simple image au-dessus.
    const logoWidth = totalWidth * 0.45; // Près de la moitié de la largeur globale
    const logoHeight = (logoWidth / logo.width) * logo.height;
    logo.resize({ w: logoWidth, h: logoHeight });

    // Dimensions finales
    const finalWidth = totalWidth + margin * 2;
    const finalHeight = totalHeight + margin * 2;

    // === CANVAS FINAL ===
    const canvas = new Jimp({
      width: finalWidth,
      height: finalHeight,
      color: 0xFFFFFFFF,
    });

    // === CONTENU ===
    canvas.composite(image1, margin, margin);
    canvas.composite(
      image2,
      margin + image1.width + spacing,
      margin
    );
    canvas.composite(
      image3,
      margin,
      margin + row1Height + spacing
    );

    // === LOGO POSITIONNÉ ===
    const rightSectionX = margin + image1.width + spacing;
    const rightSectionWidth = image2.width;

    // Calcul pour centrer parfaitement ce GROS logo sous la colonne de droite
    const logoX = rightSectionX + (rightSectionWidth - logo.width) / 2;
    const logoY = margin + row1Height + spacing;

    canvas.composite(logo, logoX, logoY);

    return canvas;
  }

  private async generateVerticalImage(dto: ImagesDto) {
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

    // === NOUVEAU : ENCORE PLUS GROS (85% de la largeur maximale) ===
    const logoWidth = maxWidth * 0.85; 
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

  private async saveImage(image,request: Request):Promise<{url : string, id :string}>{

    const oauth = this.googleService.getAuthClient()
    const user = request['user'];
    const name = 'festirecre2025_'+Math.random() * 1000000000000+'.jpg';
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
    return {url : "https://drive.google.com/uc?export=download&id="+file.data.id, id: file.data.id ?? ""}
  }

  private async deleteImage(fileId: string, request: Request): Promise<boolean> {
    const oauth = this.googleService.getAuthClient();
    const user = request['user'];

    oauth.setCredentials(user.credentials);

    const auth = new google.auth.GoogleAuth({
      authClient: oauth,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    try {
      await drive.files.delete({ fileId });
      return true;
    } catch (error) {
      console.error("Erreur suppression Drive:", error);
      return false;
    }
  }

}