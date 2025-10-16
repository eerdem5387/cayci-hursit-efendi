import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const required = (key: string, v: string | undefined) => {
  if (!v) throw new Error(`Missing env ${key}`);
  return v;
};

export const s3 = new S3Client({
  region: required("S3_REGION", process.env.S3_REGION),
  credentials: {
    accessKeyId: required("S3_ACCESS_KEY_ID", process.env.S3_ACCESS_KEY_ID),
    secretAccessKey: required("S3_SECRET_ACCESS_KEY", process.env.S3_SECRET_ACCESS_KEY),
  },
});

export async function uploadBufferToS3(params: {
  bucket: string;
  key: string;
  contentType: string;
  bytes: Buffer;
  acl?: string;
}) {
  const { bucket, key, contentType, bytes, acl } = params;
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      ACL: acl as any,
    })
  );
  const endpoint = process.env.S3_PUBLIC_BASE_URL || `https://${bucket}.s3.${process.env.S3_REGION}.amazonaws.com`;
  return `${endpoint}/${key}`;
}


