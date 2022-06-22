
// var request = require('request');

const Binance = require("node-binance-api")
const express = require('express')
const cors = require('cors');
require('dotenv').config()

const app = express()
app.use(cors())
const port = 3000

const binance = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET,
});


app.get('/', async(req, res) => {
  let fprices = await futur_prices()
  res.setHeader('Content-Type', 'application/json');
  res.end("Pedro Oliv trading bot: " + JSON.stringify(fprices, null, 2));
})

app.get('/bitcoin', async(req, res) => {
  console.log()
  let fprices = await futur_prices()
  bitcoin_price = fprices.BTCUSDT
  res.setHeader('Content-Type', 'application/json');
  bitcoin_price_list = [
    {
      "prix": bitcoin_price
    },
    {
      "prix": bitcoin_price
    },
    {
      "prix": bitcoin_price
    }
  ]
  res.end(JSON.stringify(bitcoin_price_list));
  return JSON.stringify(bitcoin_price_list)
})

app.get('/monargent', async(req, res) => {
  mon_argent = [
    {
      "prix": 1000
    }
  ]
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(mon_argent));
  return JSON.stringify(mon_argent)
})

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function futur_prices() {
  var fprices = await binance.futuresPrices()
  return fprices
}


// var options = {
//   'method': 'GET',
//   'url': 'https://api.binance.com/sapi/v1/capital/config/getall?timestamp=1650369896000&signature=5510819d6a46dcf9be9bcbcf7922edc92d66f34e1d867a9f298b47a0b641c888',
//   'headers': {
//     'X-MBX-APIKEY': 'xiQdwrcjcpbaWRMHq9mkDgPNBq1CNneB1bUfvN5SiO893INqoK0e68KiGwkCjOBQ'
//   }
// };
// request(options, function (error, response) {
//   if (error) throw new Error(error);
//   console.log(response.body);
// });