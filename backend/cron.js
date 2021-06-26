const mongoose = require("mongoose");
const validator = require("validator");
const ReportModel = require("./model/Report.js");
const AddressModel = require("./model/Address.js");
const axios = require("axios");

mongoose.set("useFindAndModify", false);

// Fetch all report addresses, deduplicate, and fetch bitcoin balances
module.exports.update = async (event) => {
  mongoose.connect(process.env.MONGO_URI);
  reports = await ReportModel.find({
    approved: true
  });
  for (let report of reports) {
    for (let address of report.addresses) {
      try {
        res = await axios.get("https://blockchain.info/rawaddr/" + address, {
          headers: { "X-API-Token": process.env.BLOCKCHAIN_API_KEY }
        });
      } catch (e) {
        continue;
      }
      balance = res.data.total_received;
      await AddressModel.findOneAndUpdate(
        { address },
        { address, variant: report.variant, blockchain: "bitcoin", balance },
        {
          upsert: true
        }
      );
      // Rate limit
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  mongoose.connection.close();
};
