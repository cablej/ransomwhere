const mongoose = require("mongoose");
const validator = require("validator");
const ReportModel = require("./model/Report.js");
const AddressModel = require("./model/Address.js");

mongoose.connect(process.env.MONGO_URI);

module.exports.list = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      result: await AddressModel.find()
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    }
  };
};

module.exports.submit = async (event) => {
  body = JSON.parse(event.body);
  report = await ReportModel.create({
    addresses: body.addresses,
    variant: body.variant,
    amount: body.amount,
    approved: true,
    source: body.source,
    notes: body.notes
  });
  return {
    statusCode: 200,
    body: JSON.stringify({
      result: report
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    }
  };
};
