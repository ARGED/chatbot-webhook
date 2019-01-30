'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const API_KEY = require('./apiKey');

const server = express();
server.use(bodyParser.urlencoded({
  extended: true
}));

server.use(bodyParser.json());

server.post('/get-customer-data', (req, res) => {

  const dataToGet = req.body.result && req.body.result.parameters && req.body.result.parameters.energy ? req.body.result.parameters.energy : 'Error';
  const reqUrl = `https://api-kth.azurewebsites.net/api/${dataToGet}?id=00002&code=${API_KEY}`;
  https.get(reqUrl, (responseFromAPI) => {
    let completeResponse = '';
    responseFromAPI.on('data', (chunk) => {
      completeResponse += chunk;
    });
    responseFromAPI.on('end', () => {
      const customer = JSON.parse(completeResponse);
      let dataToSend = dataToGet === 'Error' ? 'Oh dear, something seem to have gone wrong.\n' : '';
      dataToSend += `${customer.Id} is a(n) ${customer.BuildingType} and the contract ends in ${customer.ContractEndsUtc}`;

      return res.json({
        speech: dataToSend,
        displayText: dataToSend,
        source: 'get-customer-data'
      });
    });
  }, (error) => {
    return res.json({
      speech: 'Something went wrong!',
      displayText: 'Something went wrong!',
      source: 'get-customer-data'
    });
  });
});

server.listen((process.env.PORT || 8000), () => {
  console.log("Server is up and running...");
});
