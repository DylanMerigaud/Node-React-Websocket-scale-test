var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

require("dotenv").config();

var app = express();

app.use(logger("debug"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const { PubSub } = require("@google-cloud/pubsub");

const pubsub = new PubSub({ projectId: process.env.GOOGLE_PUBSUB_ID });

const topic = pubsub.topic("my-topic");
const origin = `instance-${process.env.PORT || "3000"}`;
const subscription = topic.subscription(origin);

const dataBuffer = Buffer.from("Hello, world!");

subscription
  .get({
    autoCreate: true
  })
  .then(data => {
    const subscription = data[0];
    subscription.on("message", onMessage);

    const apiResponse = data[1];
  });

// Register a listener for `message` events.
function onMessage(message) {
  // Called every time a message is received.
  // message.id = ID of the message.
  // message.ackId = ID used to acknowledge the message receival.
  // message.data = Contents of the message.
  // message.attributes = Attributes of the message.
  // message.publishTime = Date when Pub/Sub received the message.
  // Ack the message:
  message.ack();
  console.log(
    `Message${message.attributes.origin === origin ? " from you" : ""} ${
      message.id
    } received : ${message.data}`
  );
  // This doesn't ack the message, but allows more messages to be retrieved
  // if your limit was hit or if you don't want to ack the message.
  // message.nack();
}

topic.publish(dataBuffer, { origin }, (err, messageId) =>
  console.log(`Message ${messageId} published.`)
);

module.exports = app;
