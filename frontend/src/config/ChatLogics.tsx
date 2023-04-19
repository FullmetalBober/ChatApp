export const getSender = (loggedUser: any, users: any) => {
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};

export const getSenderFull = (loggedUser: any, users: any) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const isSameSender = (
  messages: any,
  message: any,
  index: number,
  userId: any
) => {
  return (
    index < messages.length - 1 &&
    (messages[index + 1].sender._id !== message.sender._id ||
      messages[index + 1].sender._id === undefined) &&
    messages[index].sender._id !== userId
  );
};

export const isLastMessage = (messages: any, index: number, userId: any) => {
  return (
    index === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameSenderMargin = (
  messages: any,
  message: any,
  index: number,
  userId: any
) => {
  if (
    index < messages.length - 1 &&
    messages[index + 1].sender._id === message.sender._id &&
    messages[index].sender._id !== userId
  )
    return 35;
  else if (
    (index < messages.length - 1 &&
      messages[index + 1].sender._id !== message.sender._id &&
      messages[index].sender._id !== userId) ||
    (index === messages.length - 1 && messages[index].sender._id !== userId)
  )
    return 0;
  else return 'auto';
};

export const isSameUser = (messages: any, message: any, index: number) => {
  return index > 0 && messages[index - 1].sender._id === message.sender._id;
};
