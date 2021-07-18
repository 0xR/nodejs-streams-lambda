import { Readable } from 'stream';
import { getUsers, Key } from './dynamodb';
import { writeToS3 } from './s3';
import { toXml } from './xml';
import { createMeasurer, getRate } from './measure';

const userMeasurer = createMeasurer('users');

const userCount = 20e3;

function createReadable(): Readable {
  let startKey: Key | undefined = undefined;
  let i = 0;
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
          if (i > userCount) {
            this.push('</users>');
            userMeasurer.stop();
            this.push(null);
            return;
          }
          var xmlString = toXml('user', user);
          this.push(xmlString + '\n');
          userMeasurer.measure();
          i++;
        }
        console.time('fetchIdleness');
      } catch (e) {
        this.emit('error', e);
        userMeasurer.stop();
        this.push(null);
      }
    },
    highWaterMark: 1e3,
  });
}

export async function handler() {
  const start = Date.now();
  const readable = createReadable();
  await writeToS3(readable);
  const rate = getRate(start, Date.now(), userCount);
  return {
    result: 'done',
    rate: Math.round(rate),
    secondsFor100k: Math.round(100e3 / rate),
  };
}
