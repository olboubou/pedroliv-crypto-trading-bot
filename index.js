
// var request = require('request');

const Binance = require("node-binance-api")

const express = require('express')
const app = express()
const port = 3000

const binance = new Binance().options({
  APIKEY: "xiQdwrcjcpbaWRMHq9mkDgPNBq1CNneB1bUfvN5SiO893INqoK0e68KiGwkCjOBQ",
  APISECRET: "92BEPStLPpE7OMbPmVs50ZaZeqMrgB8tV5L892ADDKXXpSnVGcFDfVIe5KTLrQZo",
});


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



app.get('/', async(req, res) => {
  let fprices = await futur_prices()
  res.setHeader('Content-Type', 'application/json');
  res.end("Pedro Oliv trading bot: " + JSON.stringify(fprices, null, 2));
})

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function futur_prices() {
  console.log("Futur prices:")
  var fprices = await binance.futuresPrices()
  return fprices
}

// Getting latest price of a symbol
// binance.prices(function (error, ticker) {
//   console.log("prices()", ticker);
//   console.log("Price of BNB: ", ticker.BNBBTC);
// });

// Get bid/ask prices
//binance.allBookTickers(function(error, json) {
//  console.log("allBookTickers",json);
//});

// Getting list of current balances
// binance.balance(function (error, balances) {
//   console.log("balances()", balances);
//   if (typeof balances.ETH !== "undefined") {
//     console.log("ETH balance: ", balances.ETH.available);
//   }
// });

// Getting bid/ask prices for a symbol
//binance.bookTickers(function(error, ticker) {
//	console.log("bookTickers()", ticker);
//	console.log("Price of BNB: ", ticker.BNBBTC);
//});

// Get market depth for a symbol
//binance.depth("SNMBTC", function(error, json) {
//	console.log("market depth",json);
//});

// Getting list of open orders
//binance.openOrders("ETHBTC", function(error, json) {
//	console.log("openOrders()",json);
//});

// Check an order's status
//let orderid = "7610385";
//binance.orderStatus("ETHBTC", orderid, function(error, json) {
//	console.log("orderStatus()",json);
//});

// Cancel an order
//binance.cancel("ETHBTC", orderid, function(error, response) {
//	console.log("cancel()",response);
//});

// Trade history
//binance.trades("SNMBTC", function(error, json) {
//  console.log("trade history",json);
//});

// Get all account orders; active, canceled, or filled.
//binance.allOrders("ETHBTC", function(error, json) {
//	console.log(json);
//});

//Placing a LIMIT order
//binance.buy(symbol, quantity, price);
//binance.buy("ETHBTC", 1, 0.0679);
//binance.sell("ETHBTC", 1, 0.069);

//Placing a MARKET order
//binance.buy(symbol, quantity, price, type);
//binance.buy("ETHBTC", 1, 0, "MARKET")
//binance.sell(symbol, quantity, 0, "MARKET");

// Periods: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
// binance.candlesticks("BNBBTC", "5m", function (error, ticks) {
//   console.log("candlesticks()", ticks);
//   let last_tick = ticks[ticks.length - 1];
//   let [
//     time,
//     open,
//     high,
//     low,
//     close,
//     volume,
//     closeTime,
//     assetVolume,
//     trades,
//     buyBaseVolume,
//     buyAssetVolume,
//     ignored,
//   ] = last_tick;
//   console.log("BNBBTC last close: " + close);
// });

// Maintain Market Depth Cache Locally via WebSocket
// binance.websockets.depthCache(["BNBBTC"], function (symbol, depth) {
//   let max = 10; // Show 10 closest orders only
//   let bids = binance.sortBids(depth.bids, max);
//   let asks = binance.sortAsks(depth.asks, max);
//   console.log(symbol + " depth cache update");
//   console.log("asks", asks);
//   console.log("bids", bids);
//   console.log("ask: " + binance.first(asks));
//   console.log("bid: " + binance.first(bids));
// });
