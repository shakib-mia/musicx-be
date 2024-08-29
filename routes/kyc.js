const express = require("express");
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { kycCollection } = await getCollections();

  const insertCursor = await kycCollection.insertOne(req.body);

  res.send(insertCursor);
});

router.get("/", async (req, res) => {
  const { kycCollection } = await getCollections();
  const kycs = await kycCollection.find({}).toArray();

  res.send(kycs);
});

module.exports = router;
