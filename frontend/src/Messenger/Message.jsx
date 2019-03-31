import React, { useMemo } from "react";

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

const Message = props => {
  const {
    message: { author, content },
    userUsername,
    style,
    ...restProps
  } = props;

  const textColor = useMemo(() => stringToColour(author), [author]);

  return (
    <div
      style={{
        color: textColor,
        display: "block",
        ...style
      }}
      {...restProps}
    >{`${author}: ${content}`}</div>
  );
};

export default Message;
