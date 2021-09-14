const mongoose = require('mongoose');

const model = mongoose.model(
  'ApiKey',
  new mongoose.Schema(
    {
      lastUsed: Date,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      hashedKey: String,
      lastFour: String
    },
    { timestamps: true }
  )
);

module.exports = model;
