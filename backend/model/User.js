const mongoose = require('mongoose');
const validator = require('validator');

const model = mongoose.model(
  'User',
  new mongoose.Schema(
    {
      email: String,
      role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
      },
      apiKeys: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ApiKey'
        }
      ]
    },
    { timestamps: true }
  )
);

module.exports = model;
