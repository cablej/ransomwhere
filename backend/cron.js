const mongoose = require('mongoose');
const ReportModel = require('./model/Report.js');
const AddressModel = require('./model/Address.js');
const axios = require('axios');
const lodash = require('lodash');

mongoose.set('useFindAndModify', false);

CHUNK_SIZE = 50;

// Fetch all report addresses, deduplicate, and fetch bitcoin balances
module.exports.update = async event => {
  mongoose.connect(process.env.MONGO_URI);
  reports = await ReportModel.find({
    approved: true
  });

  let addressesMap = {};
  for (let report of reports) {
    for (let address of report.addresses) {
      if (
        address in addressesMap &&
        addressesMap[address].variant != report.variant
      ) {
        console.warn(
          'Same address associated with mutliple variants: ' + address
        );
        continue;
      }
      addressesMap[address] = report;
    }
  }
  let chunks = lodash.chunk(Object.keys(addressesMap), CHUNK_SIZE);
  for (let chunk of chunks) {
    let res;
    try {
      res = await axios.get(
        'https://blockchain.info/multiaddr?active=' + chunk.join('|'),
        {
          headers: { 'X-API-Token': process.env.BLOCKCHAIN_API_KEY }
        }
      );
    } catch (e) {
      console.error(e);
      continue;
    }
    for (let addressResp of res.data.addresses) {
      balance = addressResp.total_received;
      address = addressResp.address;
      report = addressesMap[address];
      await AddressModel.findOneAndUpdate(
        { address },
        {
          address,
          variant: report.variant,
          blockchain: report.blockchain,
          balance
        },
        {
          upsert: true
        }
      );
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(
    'Successfully updated ' + Object.keys(addressesMap).length + ' addresses.'
  );

  mongoose.connection.close();
};

module.exports.import = async event => {
  let limit = 100;
  let page = 0;
  let results = [];
  while (true) {
    try {
      res = await axios.get(
        `https://otx.alienvault.com/otxapi/indicators/?type=BitcoinAddress` +
          `&include_inactive=0&limit=${limit}&page=${page}`,
        {
          headers: { 'X-OTX-API-KEY': process.env.OTX_API_KEY }
        }
      );
      results = results.concat(res.data.results);
      console.log(results.length);
      for (let result of res.data.results) {
        res2 = await axios.get(
          `https://otx.alienvault.com/otxapi/indicators/bitcoin-address/general/${
            result.indicator
          }`,
          {
            headers: { 'X-OTX-API-KEY': process.env.OTX_API_KEY }
          }
        );
        console.log(JSON.stringify(res2.data, null, 2));
        break;
      }
      if (res.data.next == null) break;
    } catch (e) {
      console.error(e);
      break;
    }
    page += 1;
    break;
  }
};
