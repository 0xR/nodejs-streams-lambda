export function getRate(start: number, stop: number, count) {
  const end = Date.now();
  const seconds = (end - start) / 1e3;
  return count / seconds;
}

export function createMeasurer(name: string) {
  let timeStamp: null | number = null;
  let count = 0;

  const intervalId = setInterval(() => {
    if (!timeStamp) {
      if (!count) {
        console.log('No requests measured');
        return;
      }
      throw new Error(`Expected timestamp to be defined`);
    }

    const end = Date.now();
    const rate = getRate(timeStamp, end, count);

    console.log(
      `[${new Date().toLocaleTimeString('nl-NL')}] ${name} - Rate ${Math.round(
        rate,
      )} r/s`,
    );

    timeStamp = Date.now();
    count = 0;
  }, 1e3);

  return {
    measure: () => {
      if (!timeStamp) {
        timeStamp = Date.now();
      }
      count++;
    },
    stop() {
      clearInterval(intervalId);
    },
  };
}
