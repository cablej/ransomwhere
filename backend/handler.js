const mongoose = require("mongoose");
const validator = require("validator");
const ReportModel = require("./model/Report.js");

mongoose.connect(process.env.mongo_uri);

module.exports.submit = async (event) => {
  console.log(event);

  await ReportModel.create({
    name: "testing"
  });

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
