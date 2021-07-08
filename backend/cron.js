const mongoose = require('mongoose');
const ReportModel = require('./model/Report.js');
const AddressModel = require('./model/Address.js');
const axios = require('axios');
const lodash = require('lodash');
const fs = require('fs');
const { reduce } = require('lodash');

mongoose.set('useFindAndModify', false);

CHUNK_SIZE = 50;

// Fetch all report addresses, deduplicate, and fetch bitcoin balances
module.exports.update = async event => {
  mongoose.connect(process.env.MONGO_URI);
  reports = await ReportModel.find({
    state: 'accepted'
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
      addressesMap[address] = {
        variant: report.variant,
        blockchain: report.blockchain,
        report: report._id,
        transactions: []
      };
    }
  }
  let chunks = lodash.chunk(Object.keys(addressesMap), CHUNK_SIZE);
  for (let chunk of chunks) {
    let offset = 0;
    let limit = 100;
    let addresses;
    while (true) {
      let res;
      try {
        console.log('Fetching offset: ' + offset);
        res = await axios.get(
          `https://blockchain.info/multiaddr?active=${chunk.join(
            '|'
          )}&n=${limit}&offset=${offset}`,
          {
            headers: { 'X-API-Token': process.env.BLOCKCHAIN_API_KEY }
          }
        );
        // fs.writeFileSync('out.json', JSON.stringify(res.data));
        // console.log(res.data);
      } catch (e) {
        console.error(e);
        continue;
      }
      if (!addresses) {
        addresses = res.data.addresses;
      }
      if (res.data.txs.length == 0) break;
      for (let tx of res.data.txs) {
        for (let out of tx.out) {
          if (out['addr'] in addressesMap) {
            if (!('transactions' in addressesMap[out['addr']])) {
              addressesMap[out['addr']].transactions = [];
            }
            addressesMap[out['addr']].transactions.push({
              hash: tx.hash,
              time: tx.time,
              amount: out['value']
            });
          }
        }
      }
      offset += limit;
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    for (let addressResp of addresses) {
      let balance = addressResp.total_received;
      let address = addressResp.address;
      let report = addressesMap[address];
      await AddressModel.findOneAndUpdate(
        { address },
        {
          address,
          variant: report.variant,
          blockchain: report.blockchain,
          balance,
          transactions: report.transactions
        },
        {
          upsert: true
        }
      );
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(
    'Successfully updated ' + Object.keys(addressesMap).length + ' addresses.'
  );

  mongoose.connection.close();
};

module.exports.import = async event => {
  mongoose.connect(process.env.MONGO_URI);
  let limit = 100;
  let page = 0;
  reports = {};
  // reports = JSON.parse(fs.readFileSync('out.json', 'utf8'));
  while (true) {
    try {
      console.log(page);
      res = await axios.get(
        `https://otx.alienvault.com/otxapi/indicators/?type=BitcoinAddress` +
          `&include_inactive=0&limit=${limit}&page=${page}`,
        {
          headers: { 'X-OTX-API-KEY': process.env.OTX_API_KEY }
        }
      );
      for (let result of res.data.results) {
        res2 = await axios.get(
          `https://otx.alienvault.com/otxapi/indicators/bitcoin-address/general/${
            result.indicator
          }`,
          {
            headers: { 'X-OTX-API-KEY': process.env.OTX_API_KEY }
          }
        );
        malwareFamilies = res2.data.pulse_info.pulses
          .map(pulse =>
            pulse.malware_families.map(family => family.display_name)
          )
          .flat();
        for (let family of malwareFamilies) {
          if (!(family in reports)) reports[family] = [];
          reports[family].push(res2.data);
        }
      }
      if (res.data.next == null) break;
    } catch (e) {
      console.error(e);
      break;
    }
    page += 1;
    // fs.writeFileSync('out.json', JSON.stringify(reports));
  }
  // Vetted OTX mappings
  let mappings = {
    ZeroLocker: 'ZeroLocker',
    Ryuk: 'Ryuk',
    Cryptowall: 'Cryptowall',
    Qlocker: 'Qlocker',
    Kazuar: 'SynAck',
    'Black Kingdom': 'Black Kingdom',
    Egregor: 'Egregor',
    Filecry: 'Filecry'
  };
  for (let mapping in mappings) {
    addresses = new Set();
    reportObj = {
      variant: mappings[mapping],
      notes: ''
    };
    for (let report of reports[mapping]) {
      addresses.add(report.indicator);
      if (report.pulse_info.pulses.length > 0) {
        reportObj.source =
          'https://otx.alienvault.com/pulse/' + report.pulse_info.pulses[0].id;
      }
    }
    reportObj.addresses = Array.from(addresses);
    console.log(reportObj);
    await ReportModel.create(reportObj);
  }
  mongoose.connection.close();
};
