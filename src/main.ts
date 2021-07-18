import { Readable } from 'stream';
import { getUsers, Key } from './dynamodb';
import { writeToS3 } from './s3';
import { toXml } from './xml';
import { createMeasurer } from './measure';

const userMeasurer = createMeasurer('users');

function createReadable(): Readable {
  let startKey: Key | undefined = undefined;
  let i = 0;
  const max = 10e3;
  return new Readable({
    async read(size) {
      try {
        i > 0 && console.timeEnd('fetchIdleness');
        const userResult = await getUsers(size, startKey);
        if (i === 0) {
          this.push('<users>\n');
        }
        startKey = userResult.lastKey;
        for (const user of userResult.users) {
          if (i > max) {
            this.push('</users>');
            break;
          }
          var xmlString = toXml('user', user);
          this.push(xmlString + '\n');
          userMeasurer.measure();
          i++;
        }
        console.time('fetchIdleness');
      } catch (e) {
        this.emit('error', e);
      } finally {
        userMeasurer.stop();
        this.push(null);
      }
    },
    highWaterMark: 1e3,
  });
}

export async function handler() {
  console.time('runtime')
  const readable = createReadable();
  await writeToS3(readable);
  console.timeEnd('runtime')
  return {
    result: 'done',
  };
}
