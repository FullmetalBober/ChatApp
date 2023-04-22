const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { search } = req.query;
  const searchFilter = {};

  if (search) {
    searchFilter.$or = [
      {
        name: {
          $regex: search,
          $options: 'i',
        },
      },
      {
        email: {
          $regex: search,
          $options: 'i',
        },
      },
    ];
  }

  const users = await User.find({
    ...searchFilter,
    _id: { $ne: req.user._id },
  });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
  });
});
