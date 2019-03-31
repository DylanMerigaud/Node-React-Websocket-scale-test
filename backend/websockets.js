const { PubSub } = require("@google-cloud/pubsub");

var WebsocketMessage = require("./libs/WebsocketMessage");
var Message = require("./models/Message");

module.exports = io => {
  var websocketClientCount = 0;

  const pubsub = new PubSub({ projectId: process.env.GOOGLE_PUBSUB_ID });

  const topic = pubsub.topic(process.env.GOOGLE_PUBSUB_TOPIC);

  topic.get({ autoCreate: true }).then(data => {
    const topic = data[0];
    const subscription = topic.subscription(
      process.env.GOOGLE_PUBSUB_SUBSCRIPTION
    );
    subscription
      .get({
        autoCreate: true
      })
      .then(data => {
        const subscription = data[0];
        subscription.on("message", onMessage);
        console.log(
          `Looking for new messages at "${
            process.env.GOOGLE_PUBSUB_SUBSCRIPTION
          }" Subscription from "${process.env.GOOGLE_PUBSUB_TOPIC}" Topic`
        );

        // Uncomment to test Sending messages

        // topic.publish(
        //   new WebsocketMessage("test", { sample: "data" }).toBuffer(),
        //   (err, messageId) => console.log(`Message ${messageId} published.`)
        // );
      });

    const onMessage = message => {
      const websocketMessage = WebsocketMessage.fromBuffer(message.data);
      console.log(`Message ${message.id} received : ${websocketMessage}`);
      io.emit(websocketMessage.eventName, websocketMessage.payload);
      message.ack();
    };

    io.on("connection", socket => {
      websocketClientCount += 1;
      console.log(`A user connected (total: ${websocketClientCount})`);

      socket.on("message", data => {
        console.log(
          `Received new Message from client: ${JSON.stringify(data)}`
        );
        const message = new Message(data);
        message.save().then(savedMessage => {
          topic.publish(
            new WebsocketMessage("newMessage", savedMessage).toBuffer(),
            (err, messageId) => console.log(`Message ${messageId} published.`)
          );
        });
      });

      socket.on("clearMessages", () => {
        Message.remove({}).then(() => {
          topic.publish(
            new WebsocketMessage("clearMessages").toBuffer(),
            (err, messageId) => console.log(`Message ${messageId} published.`)
          );
        });
      });

      socket.on("getMessages", () => {
        Message.find({}).then(messages => {
          socket.emit("messages", messages);
        });
      });

      socket.on("disconnect", () => {
        websocketClientCount -= 1;
        console.log(`A user disconnected (total: ${websocketClientCount})`);
      });
    });
  });
};
