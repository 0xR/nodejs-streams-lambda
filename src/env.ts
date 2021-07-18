function getEnv(name: string): string {
  const result = process.env[name];
  if (!result) {
    throw new Error(`Expected env var "${name}"`);
  }
  return result;
}

export const bucketName = getEnv('S3_BUCKET');
export const tableName = getEnv('DYNAMODB_TABLE');
