const mongoose = require("mongoose");
const validator = require("validator");
const ReportModel = require("./model/Report.js");

mongoose.connect(process.env.mongo_uri);

module.exports.list = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        result: await ReportModel.find()
      },
      null,
      2
    )
  };
};

module.exports.submit = async (event) => {
  await ReportModel.create({
    name: "testing"
  });
};
