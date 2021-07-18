import { Readable, Transform } from 'stream';
import { getUsers, Key } from './dynamodb';
import { writeToS3 } from './s3';
import { toXml } from './xml';
import { createMeasurer, getRate } from './measure';

const userMeasurer = createMeasurer('users');

const userCount = 100e3;

function createReadable(): Readable {
  let startKey: Key | undefined = undefined;
  let i = 0;
  return new Readable({
    objectMode: true,
    async read(size) {
      try {
        const userResult = await getUsers(size, startKey);
        startKey = userResult.lastKey;
        for (const user of userResult.users) {
          if (i > userCount) {
            userMeasurer.stop();
            this.push(null);
            return;
          }
          this.push(user);
          userMeasurer.measure();
          i++;
        }
      } catch (e) {
        this.emit('error', e);
        userMeasurer.stop();
        this.push(null);
      }
    },
    // Determines size of buffer and size of DynamoDB limit
    // Should be larger than a dynamodb result size without limit
    highWaterMark: 10e3,
  });
}

function createXmlTransform() {
  let firstChunk = true;
  const transform = new Transform({
    writableObjectMode: true,
    transform(user, encoding, callback) {
      if (firstChunk) {
        this.push('<users>\n');
        firstChunk = false;
      }
      var xmlString = toXml('user', user);
      this.push(xmlString + '\n');
      callback();
      return;
    },
  });
  transform._flush = function (callback) {
    this.push('</users>');
    callback();
  };
  return transform;
}

export async function handler() {
  const start = Date.now();
  const xmlStream = createReadable().pipe(createXmlTransform());
  await writeToS3(xmlStream);
  const rate = getRate(start, Date.now(), userCount);
  return {
    result: 'done',
    rate: Math.round(rate),
    secondsFor100k: Math.round(100e3 / rate),
  };
}
