const mongoose = require('mongoose');
const validator = require('validator');
const ReportModel = require('./model/Report.js');
const AddressModel = require('./model/Address.js');
const AWS = require('aws-sdk');

mongoose.connect(process.env.MONGO_URI);

module.exports.list = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      result: await AddressModel.find()
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  };
};

module.exports.reports = async event => {
  state = 'accepted';
  if (event.queryStringParameters && event.queryStringParameters.state)
    state = event.queryStringParameters.state;
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

module.exports.getS3 = async event => {
  console.log(event);
  let type = event.queryStringParameters.type;
  let name = event.queryStringParameters.name;
  const s3 = new AWS.S3();
  var putParams = {
    Bucket: 'ransomwhere',
    Key: name,
    Expires: 60 * 5,
    ContentType: type,
    ACL: 'public-read',
    Body: '',
    ContentMD5: ''
  };
  let url = await s3.getSignedUrl('putObject', putParams);

  return {
    statusCode: 200,
    body: JSON.stringify({
      result: {
        awsAccessKeyId: process.env.accessKeyId,
        s3bucket: 'ransomwhere',
        s3key: name,
        // s3policy: s3policy.policy,
        // s3signature: s3policy.signature,
        url: url
      }
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  };
};
