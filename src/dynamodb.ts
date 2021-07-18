import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { tableName } from './env';
import UserCard = Faker.UserCard;

const client = new DynamoDBClient({ region: 'eu-west-1' });
const docClient = DynamoDBDocumentClient.from(client);

export interface Key {
  PK0: string;
  SK0: string;
}

export type User = UserCard & Key;

export async function getUsers(
  limit?: number,
  startKey?: Key,
): Promise<{
  users: User[];
  lastKey: Key | undefined;
}> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: tableName,
      Limit: limit,
      ExclusiveStartKey: startKey,
    }),
  );

  return {
    users: (result.Items ?? []) as User[],
    lastKey: result.LastEvaluatedKey as Key | undefined,
  };
}
