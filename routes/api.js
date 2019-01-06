const express = require("express");
const bodyParser = require("body-parser");
const dns = require("dns");
const { check, validationResult } = require("express-validator/check");
const Url = require("url");
const db = require("../db");

const dnsLookup = url => {
  const hostname = Url.parse(url).host;
  return new Promise((resolve, reject) =>
    dns.lookup(hostname, (err, address) => {
      if (err) {
        reject(err);
      } else if (!address) {
        reject(new Error("Bad DNS lookup"));
      } else {
        resolve(address);
      }
    })
  );
};

const jsonParser = bodyParser.json({ type: "application/json" });
const router = express.Router();

router.post("/shorturl/new", jsonParser, [check("url").isURL()], async (req, res, next) => {
  if (!req.body.url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: "Please provide a valid URL" });
  }

  try {
    const ip = await dnsLookup(req.body.url);
    const result = await db.raw("INSERT INTO urls (original_url) values (?) RETURNING id", req.body.url);
    const { id } = result.rows[0];
    res.status(200).json({ original_url: req.body.url, short_url: id });
  } catch (err) {
    res.status(400).json({ error: "Bad DNS lookup" });
  }
});

router.get("/shorturl/:id", async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ error: "Invalid short URL" });
  }

  const isId = /^\d+$/.test(req.params.id);
  if (!isId) {
    return res.status(422).json({ error: "Invalid short URL" });
  }

  try {
    const result = await db.raw("SELECT original_url FROM urls WHERE id = ?", req.params.id);
    const { original_url: originalUrl } = result.rows[0];
    res.redirect(originalUrl);
  } catch (e) {
    res.status(404).json({ error: "URL not found" });
  }
});

module.exports = router;
