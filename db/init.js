const fs = require("fs");
const knex = require("./index");

const sql = fs.readFileSync(`${__dirname}/db.sql`, "utf8");

knex.raw(sql);
