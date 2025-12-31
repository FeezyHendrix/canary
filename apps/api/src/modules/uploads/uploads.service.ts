import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../../lib/env';
import { AppError } from '../../lib/errors';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_5MB, type UploadResponse } from './uploads.schema';
import { nanoid } from 'nanoid';
import { ERROR_CODES } from '@canary/shared';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) {
    throw new AppError(ERROR_CODES.S3_NOT_CONFIGURED, 'S3 storage is not configured', 503);
  }

  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
      forcePathStyle: true,
    });
  }

  return s3Client;
}

function getPublicUrl(key: string): string {
  if (env.S3_PUBLIC_URL) {
    return `${env.S3_PUBLIC_URL}/${key}`;
  }
  return `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${key}`;
}

export async function uploadImage(
  teamId: string,
  file: {
    buffer: Buffer;
    filename: string;
    mimetype: string;
  }
): Promise<UploadResponse> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw new AppError(
      ERROR_CODES.INVALID_FILE_TYPE,
      `File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      400
    );
  }

  if (file.buffer.length > MAX_FILE_SIZE_5MB) {
    throw new AppError(
      ERROR_CODES.FILE_TOO_LARGE,
      `File size exceeds maximum allowed size of ${MAX_FILE_SIZE_5MB / 1024 / 1024}MB`,
      400
    );
  }

  const client = getS3Client();
  const extension = file.filename.split('.').pop() || 'jpg';
  const key = `${teamId}/${nanoid()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  });

  await client.send(command);

  return {
    url: getPublicUrl(key),
    key,
    filename: file.filename,
    contentType: file.mimetype,
    size: file.buffer.length,
  };
}

export async function deleteImage(key: string): Promise<void> {
  const client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
  });

  await client.send(command);
}

export function isS3Configured(): boolean {
  return !!(env.S3_ENDPOINT && env.S3_ACCESS_KEY && env.S3_SECRET_KEY);
}
