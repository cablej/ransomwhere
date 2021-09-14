const mongoose = require('mongoose');
const validator = require('validator');
const ReportModel = require('./model/Report.js');
const AddressModel = require('./model/Address.js');
const UserModel = require('./model/Address.js');
const AWS = require('aws-sdk');
const axios = require('axios');
const qs = require('qs');
var jwt = require('jsonwebtoken');

// AWS.config = new AWS.Config();
// AWS.config.update({
//   accessKeyId: process.env.aws_access_key_id,
//   secretAccessKey: process.env.aws_secret_access_key,
//   region: 'us-east-1'
// });

mongoose.connect(process.env.MONGO_URI);

formatDate = date => {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

calculateValue = (transactions, prices, minimum, adjust) => {
  let usdTotal = 0;
  let btcTotal = 0;
  for (let tx of transactions) {
    if (tx.time < minimum) continue;
    date = formatDate(tx.time * 1000);
    if (!(date in prices)) continue;
    price = prices[date];
    let amount = adjust ? tx.amount / 1e8 : tx.amount;
    usdTotal += amount * price;
    btcTotal += amount;
  }
  return [usdTotal, btcTotal];
};

module.exports.list = async event => {
  let addresses = await AddressModel.find().select(
    '-_id -transactions._id -__v'
  );

  let res = await axios.get(
    'https://api.coindesk.com/v1/bpi/historical/close.json?start=2015-09-01&end=2022-09-05'
  );
  let prices = res.data.bpi;
  let range = event.queryStringParameters.range;

  let minimum = 0;
  if (range == 'day') {
    minimum = Date.now() / 1000 - 60 * 60 * 24;
  } else if (range == 'week') {
    minimum = Date.now() / 1000 - 60 * 60 * 24 * 7;
  } else if (range == 'month') {
    minimum = Date.now() / 1000 - 60 * 60 * 24 * 30;
  } else if (range == 'year') {
    minimum = Date.now() / 1000 - 60 * 60 * 24 * 365;
  }

  let transactions = addresses
    .map(address =>
      address.transactions.map(transaction => ({
        address: address.address,
        family: address.family,
        hash: transaction.hash,
        time: transaction.time,
        amount: transaction.amount / 1e8
      }))
    )
    .flat();

  let [usdTotal, btcTotal] = calculateValue(
    transactions,
    prices,
    minimum,
    false
  );

  mapping = {};
  for (let address of addresses) {
    if (!(address.family in mapping)) {
      mapping[address.family] = 0;
    }
    let [usdVal, btcVal] = calculateValue(
      address.transactions,
      prices,
      minimum,
      true
    );
    mapping[address.family] += usdVal;
  }
  keyValues = [];
  for (var key in mapping) {
    keyValues.push([key, mapping[key]]);
  }
  keyValues.sort((a, b) => b[1] - a[1]);
  keyValues = keyValues.slice(0, 10);

  return {
    statusCode: 200,
    body: JSON.stringify({
      usdTotal,
      btcTotal,
      // transactions: transactions.sort((a, b) => b.time - a.time).slice(0, 100),
      keyValues
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': '*'
    }
  };
};

module.exports.exportAll = async event => {
  let addresses = await AddressModel.find().select(
    '-_id -transactions._id -__v'
  );
  return {
    statusCode: 200,
    body: JSON.stringify({
      result: addresses
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': '*'
    }
  };
};

module.exports.reports = async event => {
  body = JSON.parse(event.body);
  state = 'accepted';
  if (body.state) state = body.state;
  return {
    statusCode: 200,
    body: JSON.stringify({
      result: await ReportModel.find({
        state
      })
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  };
};

module.exports.updateReport = async event => {
  id = event.pathParameters.id;
  body = JSON.parse(event.body);
  await ReportModel.findByIdAndUpdate(id, {
    state: body.state
  });
  return {
    statusCode: 204,
    body: JSON.stringify({}),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  };
};

module.exports.submit = async event => {
  body = JSON.parse(event.body);
  report = await ReportModel.create({
    addresses: body.addresses,
    family: body.family,
    amount: body.amount,
    source: body.source,
    notes: body.notes,
    payment_page_url: body.payment_page_url,
    ransom_note_url: body.ransom_note_url
  });
  return {
    statusCode: 200,
    body: JSON.stringify({
      result: report
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  };
};

module.exports.callback = async event => {
  if (!event.queryStringParameters || !event.queryStringParameters.code) {
    return {
      statusCode: 302,
      headers: {
        Location: 'https://ransomwhe.re'
      }
    };
  }
  let code = event.queryStringParameters.code;
  let auth = Buffer.from(
    `${process.env.cognito_client_id}:${process.env.cognito_client_secret}`,
    'utf8'
  ).toString('base64');
  let res = await axios.post(
    'https://ransomwhere.auth.us-east-1.amazoncognito.com/oauth2/token',
    qs.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.cognito_client_id,
      // client_secret: process.env.cognito_client_secret,
      // scope: 'email openid',
      code,
      redirect_uri: 'http://localhost:3000/dev/callback'
    }),
    {
      headers: {
        Authorization: `Basic ${auth}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    }
  );

  let userInfo = jwt.decode(res.data.id_token);

  if (!userInfo.email_verified) {
    return {
      statusCode: 403,
      body: ''
    };
  }
  userInfo.email = userInfo.email.toLowerCase();

  let user = await UserModel.findOne({
    email: userInfo.email
  });
  console.log(user);
};

module.exports.getS3 = async event => {
  body = JSON.parse(event.body);
  let type = body.type;
  let name = body.name;
  const s3 = new AWS.S3();
  var putParams = {
    Bucket: 'ransomwhere',
    Key: name,
    Expires: 60 * 60 * 24,
    ContentType: type,
    ACL: 'public-read'
  };
  let url = await s3.getSignedUrl('putObject', putParams);

  return {
    statusCode: 200,
    body: JSON.stringify({
      result: {
        awsAccessKeyId: process.env.aws_access_key_id,
        s3bucket: 'ransomwhere',
        s3key: name,
        url: url
      }
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  };
};
