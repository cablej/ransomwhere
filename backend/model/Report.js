const mongoose = require('mongoose');
const validator = require('validator');

const model = mongoose.model(
  'Report',
  new mongoose.Schema(
    {
      addresses: {
        type: [
          {
            type: String
          }
        ],
        required: true,
        validate: {
          validator(addresses) {
            return addresses.every(a => validator.isAlphanumeric(a));
          }
        }
      },
      family: String,
      amount: Number,
      ransom_note_url: String,
      payment_page_url: String,
      state: {
        type: String,
        enum: ['accepted', 'new', 'rejected'],
        default: 'new'
      },
      source: String,
      notes: String,
      blockchain: { type: String, default: 'bitcoin' }
    },
    { timestamps: true }
  )
);

module.exports = model;
