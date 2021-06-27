const mongoose = require("mongoose");
const validator = require("validator");

const model = mongoose.model(
  "Report",
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
            return addresses.every((a) => validator.isAlphanumeric(a));
          }
        }
      },
      variant: String,
      amount: Number,
      screenshot: String,
      approved: Boolean,
      source: String,
      notes: String
    },
    { timestamps: true }
  )
);

module.exports = model;
