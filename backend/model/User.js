const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');

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
      apiKey: {
        type: String,
        default: function() {
          return crypto.randomBytes(32).toString('base64');
        }
      },
      lastUsed: Date
    },
    { timestamps: true }
  )
);

module.exports = model;
