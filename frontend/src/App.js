import React, { useState, useCallback, useEffect, useRef } from "react";

import io from "socket.io-client";

const socket = io(process.env.REACT_APP_BACKEND_TARGET);

var stringToColour = str => {
  var hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = "#";
  for (let i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
};

const App = () => {
  const [messageValue, setMessageValue] = useState("");
  const [usernameValue, setUsernameValue] = useState(
    `anonymous-${Math.random()
      .toString(36)
      .substr(2, 6)}`
  );
  const [messages, setMessages] = useState([]);

  const handleMessageInputChange = useCallback(e => {
    setMessageValue(e.target.value);
  }, []);
  const handleUsernameInputChange = useCallback(e => {
    setUsernameValue(e.target.value);
  }, []);
  const handleSubmit = useCallback(
    e => {
      e.preventDefault();
      socket.emit("message", {
        content: messageValue,
        author: usernameValue,
        date: Date.now()
      });
      setMessageValue("");
    },
    [messageValue, usernameValue]
  );

  const handleNewMessageFromWS = useCallback(
    newMessage => {
      setMessages([...messages, newMessage].sort(message => message.date));
    },
    [messages]
  );
  socket.on("newMessage", handleNewMessageFromWS);

  const handleMessagesFromWS = useCallback(messages => {
    setMessages((messages || []).sort(message => message.date));
  }, []);
  socket.on("messages", handleMessagesFromWS);

  const handleClearMessagesFromWS = useCallback(messages => {
    setMessages([]);
  }, []);
  socket.on("clearMessages", handleClearMessagesFromWS);

  const handleClear = useCallback(e => {
    socket.emit("clearMessages");
  }, []);

  useEffect(() => {
    socket.emit("getMessages");
  }, []);

  const messageInputRef = useRef();
  useEffect(() => {
    messageInputRef.current.focus();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 10
        }}
      >
        {messages.map(message => {
          const messageFromUser = message.author === usernameValue;
          return (
            <div
              style={{
                color: stringToColour(message.author),
                alignSelf: messageFromUser ? "flex-end" : "flex-start"
              }}
              key={message._id}
            >{`${message.author}: ${message.content}`}</div>
          );
        })}
      </div>
      <div style={{ display: "flex", width: "100%" }}>
        <input value={usernameValue} onChange={handleUsernameInputChange} />
        <form onSubmit={handleSubmit} style={{ display: "flex", flexGrow: 1 }}>
          <input
            value={messageValue}
            onChange={handleMessageInputChange}
            ref={messageInputRef}
            style={{
              flexGrow: 1
            }}
          />
          <button type="submit">Send Message</button>
        </form>
        <button onClick={handleClear}>Clear Messages</button>
      </div>
    </div>
  );
};

export default App;
