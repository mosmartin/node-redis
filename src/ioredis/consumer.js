import { forever } from "async";
import redis from "ioredis";

const client = new redis();

const STREAMS_KEY = "weather_sensor:wind";
const APPLICATION_ID = "iot_application:node_1";
const CONSUMER_ID = "consumer:1";

// create the group
client.xgroup("CREATE", STREAMS_KEY, APPLICATION_ID, "$", (err) => {
  if (err) {
    if (err.code == "BUSYGROUP") {
      console.log(`Group ${APPLICATION_ID} already exists`);
    } else {
      console.error(err);
      process.exit();
    }
  }
});

forever(
  (next) => {
    client.xreadgroup(
      "GROUP",
      APPLICATION_ID,
      CONSUMER_ID,
      "BLOCK",
      500,
      "STREAMS",
      STREAMS_KEY,
      ">",
      (err, stream) => {
        if (err) {
          console.error(err);
          next(err);
        }

        if (stream) {
          const messages = stream[0][1];
          // print all messages
          messages.forEach((message) => {
            // convert the message into a JSON Object
            const id = message[0];
            const values = message[1];
            const msgObject = { id: id };
            for (let i = 0; i < values.length; i = i + 2) {
              msgObject[values[i]] = values[i + 1];
            }
            console.log("Message: " + JSON.stringify(msgObject));
          });
        } else {
          // No message in the consumer buffer
          console.log("No new message...");
        }

        next();
      }
    );
  },
  (err) => {
    console.log(" ERROR " + err);
    process.exit();
  }
);
