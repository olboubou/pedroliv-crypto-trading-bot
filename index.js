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

const db = mysql.createConnection({
  host: "sql11.freesqldatabase.com",
  user: "sql11501919",
  password: "Nju7PD33bb",
  database: "sql11501919",
});

db.removeAllListeners();

db.connect(function (err) {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL!");
});

db.promise = (sql) => {
  console.log("db.promise");
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log("Error");
        reject(new Error());
      } else {
        console.log("No error");
        resolve(result);
      }
    });
  }).catch(() => {
    console.log("Promise errored");
  });
};

async function connection(query) {
  const result = await db.promise(query);
  return result;
}

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/", async (req, res) => {
  val_bitcoin = await valeur_actuelle_bictoin();
  val_bitcoin = val_bitcoin.BTCUSDT;
  // console.log("bitcoin_price : " + val_bitcoin)
  res.setHeader("Content-Type", "application/json");
  res.end("Pedro Oliv trading bot: " + JSON.stringify(val_bitcoin, null, 2));
});

app.get("/mes_bitcoins", async (req, res) => {
  mes_bitcoins = await connection(
    "SELECT * FROM `mes_bitcoins` ORDER BY `mes_bitcoins`.`date` DESC LIMIT 24"
  );
  mes_bitcoins = Object.values(JSON.parse(JSON.stringify(mes_bitcoins)));
  // console.log(mes_bitcoins)
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(mes_bitcoins));
  return mes_bitcoins;
});

app.get("/mes_euros", async (req, res) => {
  mes_euros = await connection(
    "SELECT * FROM `mes_euros` ORDER BY `mes_euros`.`date` DESC LIMIT 24"
  );
  mes_euros = Object.values(JSON.parse(JSON.stringify(mes_euros)));
  // console.log(mes_euros)
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(mes_euros));
  return mes_euros;
});

app.get("/bitcoins_cours", async (req, res) => {
  bitcoins_cours = await connection(
    "SELECT * FROM `bitcoins_cours` ORDER BY `bitcoins_cours`.`date` DESC LIMIT 24"
  );
  bitcoins_cours = Object.values(JSON.parse(JSON.stringify(bitcoins_cours)));

  // console.log(bitcoins_cours)
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(bitcoins_cours));
  return bitcoins_cours;
});

app.post("/mes_bitcoins", jsonParser, async function (req, res) {
  console.log("Endpoint mes bitcoins");
  quantite_bitcoins_demande_a_vendre = req.body.quantite;
  mes_bitcoins = await connection(
    "SELECT * FROM `mes_bitcoins` ORDER BY `mes_bitcoins`.`date` DESC LIMIT 1"
  );
  mes_bitcoins = Object.values(JSON.parse(JSON.stringify(mes_bitcoins)));
  nouvelle_quantite_bitcoins =
    mes_bitcoins[0].quantite - quantite_bitcoins_demande_a_vendre;
  console.log(
    "🚀 ~ file: index.js ~ line 78 ~ nouvelle_quantite_bitcoins",
    nouvelle_quantite_bitcoins
  );

  bitcoins_cours = await connection(
    "SELECT * FROM `bitcoins_cours` ORDER BY `bitcoins_cours`.`date` DESC LIMIT 1"
  );
  bitcoins_cours = Object.values(JSON.parse(JSON.stringify(bitcoins_cours)));
  bitcoins_cours = bitcoins_cours[0].valeur;
  console.log("🚀 ~ file: index.js ~ line 83 ~ bitcoins_cours", bitcoins_cours);

  ancienn_quantite_euro = await connection(
    "SELECT * FROM `mes_euros` ORDER BY `mes_euros`.`date` DESC LIMIT 1"
  );
  ancienn_quantite_euro = Object.values(
    JSON.parse(JSON.stringify(ancienn_quantite_euro))
  )[0].quantite;
  nouvelle_quantite_euros =
    ancienn_quantite_euro +
    convert_bitcoins_to_euros(
      quantite_bitcoins_demande_a_vendre,
      bitcoins_cours
    );
  console.log(
    "🚀 ~ file: index.js ~ line 86 ~ nouvelle_quantite_euros",
    nouvelle_quantite_euros
  );

  console.log("🚀 ~ file: index.js ~ line 88 ~ req.body.date", req.body.date);
  db.query(
    "INSERT INTO `mes_euros` (`id`, `monnaie`, `quantite`, `date`) VALUES (NULL, '" +
      "euros" +
      "', '" +
      nouvelle_quantite_euros +
      "', '" +
      req.body.date +
      "')"
  );
  db.query(
    "INSERT INTO `mes_bitcoins` (`id`, `monnaie`, `quantite`, `date`) VALUES (NULL, '" +
      "bitcoins" +
      "', '" +
      nouvelle_quantite_bitcoins +
      "', '" +
      req.body.date +
      "')"
  );
  console.log("Base de donnée mise à jour avec succès !");
  res.sendStatus(200);
});

app.post("/mes_euros", jsonParser, async function (req, res) {
  console.log("Endpoint mes euros");
  quantite_euros_demande_a_vendre = req.body.quantite;
  mes_euros = await connection(
    "SELECT * FROM `mes_euros` ORDER BY `mes_euros`.`date` DESC LIMIT 1"
  );
  mes_euros = Object.values(JSON.parse(JSON.stringify(mes_euros)));
  nouvelle_quantite_euros =
    mes_euros[0].quantite - quantite_euros_demande_a_vendre;
  console.log(
    "🚀 ~ file: index.js ~ line 96 ~ nouvelle_quantite_euros",
    nouvelle_quantite_euros
  );

  bitcoins_cours = await connection(
    "SELECT * FROM `bitcoins_cours` ORDER BY `bitcoins_cours`.`date` DESC LIMIT 1"
  );
  bitcoins_cours = Object.values(JSON.parse(JSON.stringify(bitcoins_cours)));
  bitcoins_cours = bitcoins_cours[0].valeur;
  console.log(
    "🚀 ~ file: index.js ~ line 101 ~ bitcoins_cours",
    bitcoins_cours
  );

  ancienne_qantite_bitcoins = await connection(
    "SELECT * FROM `mes_bitcoins` ORDER BY `mes_bitcoins`.`date` DESC LIMIT 1"
  );
  ancienne_qantite_bitcoins = Object.values(
    JSON.parse(JSON.stringify(ancienne_qantite_bitcoins))
  )[0].quantite;

  nouvelle_quantite_bitcoins =
    ancienne_qantite_bitcoins +
    convert_euros_to_bitcoins(quantite_euros_demande_a_vendre, bitcoins_cours);
  console.log(
    "🚀 ~ file: index.js ~ line 103 ~ nouvelle_quantite_bitcoins",
    nouvelle_quantite_bitcoins
  );

  console.log("🚀 ~ file: index.js ~ line 106 ~ req.body.date", req.body.date);
  db.query(
    "INSERT INTO `mes_euros` (`id`, `monnaie`, `quantite`, `date`) VALUES (NULL, '" +
      "euros" +
      "', '" +
      nouvelle_quantite_euros +
      "', '" +
      req.body.date +
      "')"
  );
  db.query(
    "INSERT INTO `mes_bitcoins` (`id`, `monnaie`, `quantite`, `date`) VALUES (NULL, '" +
      "bitcoins" +
      "', '" +
      nouvelle_quantite_bitcoins +
      "', '" +
      req.body.date +
      "')"
  );
  console.log("Base de donnée mise à jour avec succès !");
  res.sendStatus(200);
});

async function valeur_actuelle_bictoin() {
  var fprices = await binance.futuresPrices();
  return fprices;
}

function save_mes_euros_to_db(monnaie, quantite, date) {
  db.query(
    "INSERT INTO `mes_euros` (`id`, `monnaie`, `quantite`, `date`) VALUES (NULL, '" +
      monnaie +
      "', '" +
      quantite +
      "', '" +
      date +
      "')"
  );
  console.log(
    "Mes euros : " + monnaie + " " + quantite + " " + date + " inséré!"
  );
}

function save_mes_bitcoins_to_db(monnaie, quantite, date) {
  db.query(
    "INSERT INTO `mes_bitcoins` (`id`, `monnaie`, `quantite`, `date`) VALUES (NULL, '" +
      monnaie +
      "', '" +
      quantite +
      "', '" +
      date +
      "')"
  );
  console.log(
    "Mes bitcoins : " + monnaie + " " + quantite + " " + date + " inséré!"
  );
}

function save_bitcoin_cours_to_db(valeur, date) {
  db.query(
    "INSERT INTO `bitcoins_cours` (`valeur`, `date`) VALUES ('" +
      valeur +
      "',  '" +
      date +
      "')"
  );
  console.log("Cours du bitcoin : " + valeur + " " + date + " inséré!");
}

const save_all_in_db = async function () {
  date_now = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  console.log("Oui bonsoir execute à : " + date_now);
  const res = await valeur_actuelle_bictoin();
  valeur_bitcoin = res.BTCUSDT;

  mes_euros = await connection(
    "SELECT * FROM `mes_euros` ORDER BY `mes_euros`.`date` DESC LIMIT 1"
  );
  mes_euros = Object.values(JSON.parse(JSON.stringify(mes_euros)));

  mes_bitcoins = await connection(
    "SELECT * FROM `mes_bitcoins` ORDER BY `mes_bitcoins`.`date` DESC LIMIT 1"
  );
  mes_bitcoins = Object.values(JSON.parse(JSON.stringify(mes_bitcoins)));

  save_mes_euros_to_db("euros", mes_euros[0].quantite, date_now);
  save_mes_bitcoins_to_db("bitcoins", mes_bitcoins[0].quantite, date_now);
  save_bitcoin_cours_to_db(valeur_bitcoin, date_now);
};

async function runFunction() {
  const t = setInterval(async function () {
    if (new Date().getMinutes() % 15 === 0) {
      const db = mysql.createConnection({
        host: "sql11.freesqldatabase.com",
        user: "sql11501919",
        password: "Nju7PD33bb",
        database: "sql11501919",
      });

      db.connect(function (err) {
        if (err) throw err;
        console.log("Connecté à la base de données MySQL!");
      });
      console.log("efin quart heure" + new Date().getMinutes());
      await save_all_in_db();
    } else {
      console.log("pas quart heure : " + new Date().getMinutes());
    }
  }, 60000);
}

runFunction();

function convert_euros_to_bitcoins(quantite_euros, bitcoins_cours) {
  return quantite_euros / bitcoins_cours;
}

function convert_bitcoins_to_euros(quantite_bitcoin, bitcoins_cours) {
  return bitcoins_cours * quantite_bitcoin;
}
