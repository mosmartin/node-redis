import { createClient } from "redis";

const client = createClient();

const STREAMS_KEY = "weather_sensor:wind";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// (async () => {
//   const client = createClient();

//   client.on("error", (err) => console.log("Redis Client Error", err));

//   await client.connect();

//   console.log("Redis Client Connected");

//   await client.set("key", "value");
//   const value = await client.get("key");
// })();

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
    client.xAdd(
      STREAMS_KEY,
      "*",
      "speed",
      speed,
      "direction",
      direction,
      "sensor_ts",
      ts,
      "loop_info",
      i,
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );

    await sleep(sleep_time);

    if (i == loop_nb) {
      process.exit();
    }
  }
})();
