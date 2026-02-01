import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// @ts-ignore
const ENDPOINT = import.meta.env.VITE_R2_ENDPOINT;
// @ts-ignore
const ACCESS_KEY = import.meta.env.VITE_R2_ACCESS_KEY;
// @ts-ignore
const SECRET_KEY = import.meta.env.VITE_R2_SECRET_KEY;
// @ts-ignore
const BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME;
// @ts-ignore
const PUBLIC_DOMAIN = import.meta.env.VITE_R2_PUBLIC_DOMAIN;

const R2 = new S3Client({
  region: "auto", // Cloudflare R2 için bu ayar zorunludur
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

export const uploadFile = async (file: File, folder?: string) => {
  try {
    // Dosya ismini güvenli hale getir ve benzersiz yap
    const cleanName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');

    // Eğer folder parametresi varsa path'i ayarla (örn: kayip-esya/dosya.jpg)
    const prefix = folder ? `${folder}/` : '';
    const fileName = `${prefix}${Date.now()}-${cleanName}`;

    // Convert File to ArrayBuffer then Uint8Array
    // This is the most stable way to handle uploads in browser environments with AWS SDK v3
    // to avoid stream reader errors.
    const arrayBuffer = await file.arrayBuffer();
    const fileBody = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileBody,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000, immutable', // 1 year cache for static assets
      // ContentLength is not strictly needed with Uint8Array but good practice
      // ContentDisposition: 'inline' 
    });

    await R2.send(command);

    // Domain sonunda / olup olmadığını kontrol et
    const baseUrl = PUBLIC_DOMAIN.endsWith('/') ? PUBLIC_DOMAIN.slice(0, -1) : PUBLIC_DOMAIN;

    return {
      url: `${baseUrl}/${fileName}`,
      key: fileName,
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    };
  } catch (error: any) {
    console.error("R2 Upload Error:", error);
    // Hata ayıklama için kullanıcıya detaylı mesaj göster
    throw new Error(`Dosya yüklenirken bir hata oluştu: ${error.message}`);
  }
};