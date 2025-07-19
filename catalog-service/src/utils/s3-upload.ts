import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import { config } from 'dotenv';

config(); 

const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFileToS3(file: Express.Multer.File): Promise<string> {
  if (!file?.buffer) {
    throw new Error('No file buffer provided');
  }

  const fileKey = `uploads/${uuidv4()}.avif`;

  // 🔻 Compress + Convert image using Sharp
  const compressedBuffer = await sharp(file.buffer)
    .resize({ width: 1280, withoutEnlargement: true }) // Optional resize
    .avif({
      quality: 60,
      effort: 4,
      chromaSubsampling: '4:2:0',
    })
    .toBuffer();

  const uploadParams = {
    Bucket: 'ecommerce-delente-dev',
    Key: fileKey,
    Body: compressedBuffer,
    ContentType: 'image/avif',
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    return `https://ecommerce-delente-dev.s3.ap-south-1.amazonaws.com/${fileKey}`;
  } catch (err) {
    console.error('S3 Upload Failed:', err);
    throw new Error('Failed to upload image to S3');
  }
}
