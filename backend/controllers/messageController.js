const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');

exports.createMessage = asyncHandler(async (req, res, next) => {
  const { content, chatId } = req.body;

  let message = await Message.create({
    sender: req.user.id,
    content,
    chat: chatId,
  });

  message = await message.populate('sender');

  message = await message.populate({
    path: 'chat',
    populate: {
      path: 'users',
    },
  });

  await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

  res.status(201).json({
    status: 'success',
    data: { message },
  });
});

exports.getMessages = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({ chat: req.params.chatId }).populate(
    'sender chat'
  );

  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});
