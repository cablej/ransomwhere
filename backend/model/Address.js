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
      variant: String,
      balance: Number,
      blockchain: String,
      balances: [],
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
