const mongoose = require('mongoose');
const validator = require('validator');

const model = mongoose.model(
  'Address',
  new mongoose.Schema(
    {
      address: {
        type: String,
        required: true,
        unique: true,
        index: true,
        validate: {
          validator(address) {
            return validator.isAlphanumeric(address);
          }
        }
      },
      family: String,
      balance: Number,
      blockchain: String,
      transactions: [
        {
          hash: String,
          time: Number,
          amount: Number
        }
      ]
    },
    { timestamps: true }
  )
);

module.exports = model;
