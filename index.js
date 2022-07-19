const Binance = require("node-binance-api");
const express = require("express");
var bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const util = require("util");
require("dotenv").config();

const app = express();
var jsonParser = bodyParser.json();
app.use(cors());

const port = 3000;

const binance = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET,
});

function db_connection() {
  const db = mysql.createConnection({
    host: "sql11.freesqldatabase.com",
    user: "sql11506948",
    password: "DavwFu9DjL",
    database: "sql11506948",
  });

  db.removeAllListeners();

  db.connect(function (err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
  });

  db.promise = (sql) => {
    return new Promise((resolve, reject) => {
      db.query(sql, (err, result) => {
        if (err) {
          reject(new Error());
        } else {
          resolve(result);
        }
      });
    }).catch(() => {
      console.log("Promise errored");
    });
  };
  return db;
}

function db_deconnction(db) {
  db.removeAllListeners();
  db.end();
}

async function connection(query, db) {
  const result = await db.promise(query);
  return result;
}

app.listen(process.env.PORT || port, () => {
  console.log(`Listening on port ${port}`);
});

app.get("/", async (req, res) => {
  val_bitcoin = await valeur_actuelle_bictoin();
  val_bitcoin = val_bitcoin.BTCUSDT;
  console.log("bitcoin_price : " + val_bitcoin);
  res.setHeader("Content-Type", "application/json");
  res.end("Pedro Oliv trading bot: " + JSON.stringify(val_bitcoin, null, 2));
});

app.get("/mon_argent_url", async (req, res) => {
  const db = db_connection();
  mon_argent = await connection(
    "SELECT * FROM `mon_argent` ORDER BY `mon_argent`.`date` DESC LIMIT 24",
    db
  );
  db_deconnction(db);
  mon_argent = Object.values(JSON.parse(JSON.stringify(mon_argent)));
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(mon_argent));
  return mon_argent;
});

app.post("/mon_argent_url", jsonParser, async function (req, res) {
  const db = db_connection();
  db.query(
    "INSERT INTO `mon_argent` (`id`, `mes_euros`, `mes_bitcoins`, `bitcoin_cours`, `date`) VALUES (NULL, '" +
      req.body.mes_euros +
      "', '" +
      req.body.mes_bitcoins +
      "', '" +
      req.body.bitcoin_cours +
      "', '" +
      req.body.date +
      "')"
  );

  console.log(req.body.date, " Base de donnée mise à jour avec succès !");
  res.sendStatus(200);
});

async function valeur_actuelle_bictoin() {
  var fprices = await binance.futuresPrices();
  return fprices;
}

function save_mon_argent_to_db(mes_euros, mes_bitcoins, bitcoin_cours, date) {
  const db = db_connection();
  db.query(
    "INSERT INTO `mon_argent` (`id`, `mes_euros`, `mes_bitcoins`, `bitcoin_cours`, `date`) VALUES (NULL, '" +
      mes_euros +
      "', '" +
      mes_bitcoins +
      "', '" +
      bitcoin_cours +
      "', '" +
      date +
      "')"
  );
  db_deconnction(db);
  console.log(
    "Mon argent : " +
      mes_euros +
      " " +
      mes_bitcoins +
      " " +
      bitcoin_cours +
      " " +
      date +
      " insérés !"
  );
}

const save_all_in_db = async function () {
  date_now = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const res = await valeur_actuelle_bictoin();
  valeur_bitcoin = res.BTCUSDT;
  const db = db_connection();
  mon_argent = await connection(
    "SELECT * FROM `mon_argent` ORDER BY `mon_argent`.`date` DESC LIMIT 1",
    db
  );
  mon_argent = Object.values(JSON.parse(JSON.stringify(mon_argent)));

  db_deconnction(db);
  save_mon_argent_to_db(
    mon_argent[0].mes_euros,
    mon_argent[0].mes_bitcoins,
    valeur_bitcoin,
    date_now
  );
};

async function runFunction() {
  const t = setInterval(async function () {
    if (new Date().getMinutes() % 5 === 0) {
      const db = db_connection();
      console.log(new Date().getMinutes());
      await save_all_in_db();
      db_deconnction(db);
    } else {
      console.log(new Date().getMinutes());
    }
  }, 60000);
}

runFunction();
