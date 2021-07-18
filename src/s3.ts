import { S3 } from 'aws-sdk';
import { bucketName } from './env';

export async function writeToS3(body: S3.Body) {
  const managedUpload = new S3.ManagedUpload({
    params: {
      Bucket: bucketName,
      Key: `output-${new Date().toISOString()}.xml`,
      Body: body,
    },
  });
  managedUpload.on('httpUploadProgress', (progress) => {
    console.log(`[${new Date().toLocaleString('nl-NL')}]`, progress);
  });
  await managedUpload.promise();
}
