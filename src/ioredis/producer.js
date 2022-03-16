import redis from "ioredis";

const client = new redis();

const STREAMS_KEY = "weather_sensor:wind";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  // capture the paramter
  const args = process.argv
    .slice(2)
    .map((arg) => arg.split("="))
    .reduce((args, [value, key]) => {
      args[value] = key;
      return args;
    }, {});

  let sleep_time = 200;
  let loop_nb = 20;
  if (args && args.loop && !isNaN(args.loop)) {
    loop_nb = args.loop;
  }

  if (args && args.sleep && !isNaN(args.sleep)) {
    sleep_time = args.sleep;
  }

  console.log(
    `\nThis program will send ${loop_nb} messages, every ${sleep_time}ms`
  );

  for (let i = 0; i <= loop_nb; i++) {
    console.log(`\tSending message ${i}`);

    // create the message values:
    const speed = Math.round(Math.random() * 45);
    const direction = Math.round(Math.random() * 359);
    const ts = new Date().getTime();

    // produce the message
    client.xadd(
      STREAMS_KEY,
      "*",
      "speed",
      speed,
      "direction",
      direction,
      "timestamp",
      ts
    );

    await sleep(sleep_time);
  }
})();
