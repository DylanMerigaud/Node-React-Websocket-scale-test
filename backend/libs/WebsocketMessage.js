class WebsocketMessage {
  constructor(eventName, payload) {
    this.eventName = eventName;
    this.payload = payload;
  }

  toObject() {
    const { eventName, payload } = this;
    return { eventName, payload };
  }

  toString() {
    return JSON.stringify(this.toObject());
  }

  toBuffer() {
    return Buffer.from(JSON.stringify(this.toObject()));
  }

  static fromBuffer(buffer) {
    const { eventName, payload } = JSON.parse(buffer);
    return new WebsocketMessage(eventName, payload);
  }
}

module.exports = WebsocketMessage;
