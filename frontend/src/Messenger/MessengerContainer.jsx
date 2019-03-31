import React, { useState, useCallback, useEffect } from "react";
import io from "socket.io-client";
import shortid from "shortid";

import Messenger from "./Messenger";

const socket = io(process.env.REACT_APP_BACKEND_TARGET);

const MessengerContainer = () => {
  const [message, setMessage] = useState("");
  const [userUsername, setUserUsername] = useState(
    `anonymous-${Math.random()
      .toString(36)
      .substr(2, 6)}`
  );
  const [messages, setMessages] = useState([]);

  const handleMessageChange = useCallback(e => {
    setMessage(e.target.value);
  }, []);
  const handleUsernameChange = useCallback(e => {
    setUserUsername(e.target.value);
  }, []);
  const handleMessageSubmit = useCallback(
    e => {
      e.preventDefault();
      const temporaryMessage = {
        content: message,
        author: userUsername,
        date: Date.now(),
        tempId: shortid.generate()
      };
      const { tempId, ...mesage } = temporaryMessage;
      socket.emit("message", mesage, { tempId });
      setMessages([...messages, temporaryMessage]);
      setMessage("");
    },
    [message, userUsername]
  );

  const handleNewMessageFromWS = useCallback(
    (newMessage, callbackAdditionalData) => {
      let replacedAtLeastOnce = false;
      const replaceMessageCb = message => {
        if (message.tempId === callbackAdditionalData.tempId) {
          replacedAtLeastOnce = true;
          return newMessage;
        } else return message;
      };
      const replacedMessages = messages.map(replaceMessageCb);
      const resultMessages = replacedAtLeastOnce
        ? replacedMessages
        : [...messages, newMessage];
      setMessages(resultMessages.sort(message => message.date));
    },
    [messages]
  );

  const handleMessagesFromWS = useCallback(messages => {
    setMessages((messages || []).sort(message => message.date));
  }, []);

  const handleClearMessagesFromWS = useCallback(messages => {
    setMessages([]);
  }, []);

  const handleClearMessages = useCallback(e => {
    socket.emit("clearMessages");
  }, []);

  useEffect(() => {
    socket.emit("getMessages");
  }, []);

  useEffect(() => {
    socket.on("newMessage", handleNewMessageFromWS);
    return () => {
      socket.removeListener("newMessage", handleNewMessageFromWS);
    };
  }, [handleNewMessageFromWS]);
  useEffect(() => {
    socket.on("messages", handleMessagesFromWS);
    return () => {
      socket.removeListener("messages", handleMessagesFromWS);
    };
  }, [handleMessagesFromWS]);
  useEffect(() => {
    socket.on("clearMessages", handleClearMessagesFromWS);
    return () => {
      socket.removeListener("clearMessages", handleClearMessagesFromWS);
    };
  }, [handleClearMessagesFromWS]);

  return (
    <Messenger
      message={message}
      handleMessageChange={handleMessageChange}
      handleClearMessages={handleClearMessages}
      messages={messages}
      userUsername={userUsername}
      handleMessageSubmit={handleMessageSubmit}
      handleUsernameChange={handleUsernameChange}
    />
  );
};

export default MessengerContainer;
