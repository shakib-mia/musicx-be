const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");
const jwt = require("jsonwebtoken");

router.get("/", verifyJWT, async (req, res) => {
  const { splitRoyalties } = await getCollections();

  const splits = await splitRoyalties.find({}).toArray();
  res.send(splits);
});

router.post("/", async (req, res) => {
  const { splitRoyalties } = await getCollections();

  const postCursor = await splitRoyalties.insertOne(req.body);
  res.send(postCursor);
});

module.exports = router;
