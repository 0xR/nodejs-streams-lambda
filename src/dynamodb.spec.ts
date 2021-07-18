import { getUsers } from './dynamodb';

it('should scan dynamodb', async () => {
  const result0 = await getUsers(10);
  expect(result0.users.length).toBeGreaterThan(0);
  const result1 = await getUsers(10, result0.lastKey);
  expect(result1.users.length).toBeGreaterThan(0);
  expect(result0.users[0].PK0).not.toEqual(result1.users[0].PK0);
});
