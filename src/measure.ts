export function createMeasurer() {
  let timeStamp: null | number = null;
  let count = 0;

  setInterval(() => {
    if (!timeStamp) {
      if (!count) {
        console.log('No requests measured');
        return;
      }
      throw new Error(`Expected timestamp to be defined`);
    }

    const end = Date.now();
    const seconds = (end - timeStamp) / 1e3;
    const rate = count / seconds;
    console.log(
      `${new Date().toLocaleString('nl-NL')} Rate ${Math.round(rate)} r/s`,
    );

    timeStamp = Date.now();
    count = 0;
  }, 1e3);

  return () => {
    if (!timeStamp) {
      timeStamp = Date.now();
    }
    count++;
  };
}
