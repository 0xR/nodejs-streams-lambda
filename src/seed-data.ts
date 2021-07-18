import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import faker from 'faker';
import { ulid } from 'ulid';
import { createMeasurer } from './measure';

const pLimit = require('p-limit');

const limit = pLimit(100);

const client = new DynamoDBClient({ region: 'eu-west-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const measureCreation = createMeasurer('seed dynamo');

async function addUser() {
  await ddbDocClient.send(
    new PutCommand({
      TableName: 'nodejs-streams-dev',
      Item: {
        PK0: ulid(),
        SK0: 'user',
        ...faker.helpers.userCard(),
      },
    }),
  );
  measureCreation();
}

(async () => {
  const count = 1e6;
  await Promise.all(
    Array(count)
      .fill(0)
      .map(() => limit(addUser)),
  );
})();
