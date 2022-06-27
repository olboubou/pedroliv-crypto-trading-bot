const Binance = require("node-binance-api")
const express = require("express")
const mysql = require("mysql")
const cors = require("cors")
const util = require("util")
require("dotenv").config()

const app = express()
app.use(cors())

const port = 3000

const binance = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET,
})

const db = mysql.createConnection({
  host: "sql11.freesqldatabase.com",
  user: "sql11501919",
  password: "Nju7PD33bb",
  database: "sql11501919",
})

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`)
})

db.connect(function (err) {
  if (err) throw err
  console.log("Connecté à la base de données MySQL!")
})

app.get("/", async (req, res) => {
  val_bitcoin = await valeur_actuelle_bictoin()
  val_bitcoin = val_bitcoin.BTCUSDT
  // console.log("bitcoin_price : " + val_bitcoin)
  res.setHeader("Content-Type", "application/json")
  res.end("Pedro Oliv trading bot: " + JSON.stringify(val_bitcoin, null, 2))
})

app.get("/mes_bitcoins", async (req, res) => {
  mes_bitcoins = await connection("SELECT * FROM `mes_bitcoins` ORDER BY `mes_bitcoins`.`date` DESC LIMIT 10")
  mes_bitcoins = Object.values(JSON.parse(JSON.stringify(mes_bitcoins)))
  console.log(mes_bitcoins)
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(mes_bitcoins))
  return mes_bitcoins
})

app.get("/mes_euros", async (req, res) => {
  mes_euros = await connection("SELECT * FROM `mes_euros` ORDER BY `mes_euros`.`date` DESC LIMIT 10")
  mes_euros = Object.values(JSON.parse(JSON.stringify(mes_euros)))
  console.log(mes_euros)
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(mes_euros))
  return mes_euros
})

app.get("/bitcoins_cours", async (req, res) => {
  bitcoins_cours = await connection("SELECT * FROM `bitcoins_cours` ORDER BY `bitcoins_cours`.`date` DESC LIMIT 10")
  bitcoins_cours = Object.values(JSON.parse(JSON.stringify(bitcoins_cours)))

  console.log(bitcoins_cours)
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(bitcoins_cours))
  return bitcoins_cours
})

async function valeur_actuelle_bictoin() {
  var fprices = await binance.futuresPrices()
  return fprices
}

db.promise = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) {
        reject(new Error())
      } else {
        resolve(result)
      }
    })
  })
}

async function connection(query) {
  const result = await db.promise(query)
  return result
}

function save_mes_euros_to_db(monnaie, quantite, date) {
  db.query("INSERT INTO `mes_euros` (`id`, `monnaie`, `quantite`, `date`) VALUES (NULL, '" + monnaie + "', '" + quantite + "', '" + date + "')")
  console.log("Mes euros : " + monnaie + " " + quantite + " " + date + " inséré!")
}

function save_mes_bitcoins_to_db(monnaie, quantite, date) {
  db.query("INSERT INTO `mes_bitcoins` (`id`, `monnaie`, `quantite`, `date`) VALUES (NULL, '" + monnaie + "', '" + quantite + "', '" + date + "')")
  console.log("Mes bitcoins : " + monnaie + " " + quantite + " " + date + " inséré!")
}

function save_bitcoin_cours_to_db(valeur, date) {
  db.query("INSERT INTO `bitcoins_cours` (`valeur`, `date`) VALUES ('" + valeur + "',  '" + date + "')")
  console.log("Cours du bitcoin : " + valeur + " " + date + " inséré!")
}

const save_all_in_db = async function () {
  date_now = new Date().toISOString().slice(0, 19).replace("T", " ")
  console.log("Oui bonsoir execute à : " + date_now)
  const res = await valeur_actuelle_bictoin()
  valeur_bitcoin = res.BTCUSDT

  save_mes_euros_to_db("euros", 1102, date_now)
  save_mes_bitcoins_to_db("bitcoins", 0.6, date_now)
  save_bitcoin_cours_to_db(valeur_bitcoin, date_now)
}

async function runFunction() {
  const t = setInterval(async function () {
    if (new Date().getMinutes() % 15 === 0) {
      await save_all_in_db()
      console.log("efin quart heure")
    } else {
      console.log("pas quart heure : " + new Date().getMinutes())
    }
  }, 60000)
}

runFunction()
