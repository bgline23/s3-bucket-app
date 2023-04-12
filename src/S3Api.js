import { S3_BUCKET_NAME, S3_ACCESS_KEY, S3_KEY_ID, AWS_REGION } from "@env";
import {
  PutObjectCommand,
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: S3_KEY_ID,
    secretAccessKey: S3_ACCESS_KEY,
  },
});

const createPresignedUrl = async key => {
  const command = new PutObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

const fetchImages = async () => {
  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET_NAME,
    MaxKeys: 1,
  });

  let isTruncated = true;
  let contents = [];

  while (isTruncated) {
    const { Contents, IsTruncated, NextContinuationToken } = await client.send(command);
    if (!Contents) break;
    contents.push(...Contents);
    isTruncated = IsTruncated;
    command.input.ContinuationToken = NextContinuationToken;
  }

  return contents;
};

const downloadImage = async imageName => {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: imageName,
  });

  const imageUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

  return imageUrl;
};

export { fetchImages, downloadImage, createPresignedUrl };
