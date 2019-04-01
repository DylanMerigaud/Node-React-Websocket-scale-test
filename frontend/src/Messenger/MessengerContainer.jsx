import React, { useState, useCallback, useEffect } from "react";
import io from "socket.io-client";
import shortid from "shortid";

import Messenger from "./Messenger";

const socket = io(process.env.REACT_APP_BACKEND_TARGET);

const removeDuplicateMessages = messages => {
  var obj = {};

  for (var i = 0, len = messages.length; i < len; i++)
    obj[messages[i]["id"] || messages[i]["tempId"]] = messages[i];

  messages = [];
  for (var key in obj) messages.push(obj[key]);

  return messages;
};

const sortMessages = messages =>
  messages.sort((a, b) => new Date(a.date) - new Date(b.date));

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
        date: new Date().toISOString(),
        tempId: shortid.generate()
      };
      const { tempId, ...mesage } = temporaryMessage;
      socket.emit("message", mesage, { tempId });
      setMessages(prevMessages => [...prevMessages, temporaryMessage]);
      setMessage("");
    },
    [message, userUsername]
  );

  const handleNewMessageFromWS = useCallback(
    (newMessage, callbackAdditionalData) => {
      const removeMessageWithSameTempId = message =>
        message.tempId !== callbackAdditionalData.tempId;
      setMessages(prevMessages =>
        sortMessages(
          removeDuplicateMessages([
            ...(callbackAdditionalData.tempId
              ? prevMessages.filter(removeMessageWithSameTempId)
              : prevMessages),
            { ...newMessage, tempId: callbackAdditionalData.tempId }
          ])
        )
      );
    },
    []
  );

  const handleMessagesFromWS = useCallback(remoteMessages => {
    setMessages(prevMessages =>
      sortMessages(
        removeDuplicateMessages([...prevMessages, ...(remoteMessages || [])])
      )
    );
  }, []);

  const handleClearMessagesFromWS = useCallback(() => {
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
