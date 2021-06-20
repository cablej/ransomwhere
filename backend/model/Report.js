const mongoose = require("mongoose");
const validator = require("validator");

const model = mongoose.model("Report", {
  name: {
    type: String,
    required: true,
    validate: {
      validator(name) {
        return validator.isAlphanumeric(name);
      }
    }
  }
});

module.exports = model;
