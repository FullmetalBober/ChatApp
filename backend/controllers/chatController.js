const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

exports.accessChat = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError('Please provide a user id', 400));
  }

  let isChat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user.id, userId] },
  }).populate({
    path: 'users latestMessage.sender',
    select: 'name pic email',
  });

  if (isChat) {
    return res.status(200).json({
      status: 'success',
      data: isChat,
    });
  } else {
    let ChatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(ChatData);

    const FullChat = await Chat.findById(createdChat._id).populate('users');

    res.status(201).json({
      status: 'success',
      data: FullChat,
    });
  }
});

exports.fetchChats = asyncHandler(async (req, res, next) => {
  const result = await Chat.find({ users: req.user._id })
    .populate('users groupAdmin')
    .populate({
      path: 'latestMessage',
      populate: { path: 'sender', select: 'name pic email' },
    })
    .sort({ updatedAt: -1 });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.createGroupChat = asyncHandler(async (req, res, next) => {
  if (!req.body.users || !req.body.name)
    return next(new AppError('Please provide a name and users', 400));

  let { users } = req.body;

  if (users.length < 2) {
    return next(new AppError('Please provide at least 2 users', 400));
  }

  users.push(req.user);

  const groupChat = await Chat.create({
    chatName: req.body.name,
    users: users,
    isGroupChat: true,
    groupAdmin: req.user,
  });

  const fullGroupChat = await Chat.findOne({ _id: groupChat._id }).populate(
    'users groupAdmin'
  );

  res.status(201).json({
    status: 'success',
    data: fullGroupChat,
  });
});

exports.renameGroup = asyncHandler(async (req, res, next) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate('users groupAdmin');

  if (!updatedChat) {
    return next(new AppError('Chat not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: updatedChat,
  });
});

exports.addToGroup = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate('users groupAdmin');

  if (!updatedChat) {
    return next(new AppError('Chat not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: updatedChat,
  });
});

exports.removeFromGroup = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate('users groupAdmin');

  if (!removed) {
    return next(new AppError('Chat not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: removed,
  });
});
