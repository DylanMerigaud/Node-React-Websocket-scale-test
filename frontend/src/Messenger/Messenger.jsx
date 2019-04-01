import React, { useCallback, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/styles";

import Message from "./Message";

const Messenger = props => {
  const {
    message,
    handleMessageChange,
    handleClearMessages,
    messages,
    userUsername,
    handleMessageSubmit,
    handleUsernameChange
  } = props;
  const classes = useStyles();

  const messageInputRef = useRef();
  useEffect(() => {
    messageInputRef.current.focus();
  }, []);

  const messagesWrapperRef = useRef();
  useEffect(() => {
    messagesWrapperRef.current.scrollTop =
      messagesWrapperRef.current.scrollHeight;
  }, [messages]);

  const handleWindowVisibilityChange = useCallback(e => {
    if (!document.hidden) messageInputRef.current.focus();
  }, []);
  useEffect(() => {
    window.addEventListener(
      "visibilitychange",
      handleWindowVisibilityChange,
      true
    );
    return () => {
      window.removeEventListener(
        "visibilitychange",
        handleWindowVisibilityChange,
        true
      );
    };
  }, []);
  return (
    <div className={classes.root}>
      <div className={classes.messagesWrapper} ref={messagesWrapperRef}>
        {messages.map(message => {
          const messageFromUser = message.author === userUsername;
          return (
            <Message
              userUsername={userUsername}
              message={message}
              style={{
                alignSelf: messageFromUser ? "flex-end" : "flex-start"
              }}
              key={message.tempId || message.id}
            />
          );
        })}
      </div>
      <div className={classes.actionsWrapper}>
        <input value={userUsername} onChange={handleUsernameChange} />
        <form onSubmit={handleMessageSubmit} className={classes.messageForm}>
          <input
            value={message}
            onChange={handleMessageChange}
            ref={messageInputRef}
            className={classes.messageInput}
            required
          />
          <button type="submit">Send Message</button>
        </form>
        <button onClick={handleClearMessages}>Clear Messages</button>
      </div>
    </div>
  );
};

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  messagesWrapper: {
    "&>*:first-child": {
      marginTop: "auto"
    },
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    padding: 10,
    overflowY: "auto"
  },
  actionsWrapper: {
    display: "flex",
    width: "100%"
  },
  messageForm: { display: "flex", flexGrow: 1 },
  messageInput: { flexGrow: 1 }
});

export default React.memo(Messenger);
