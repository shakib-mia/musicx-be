const express = require("express");
const { getCollections } = require("../constants");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const { crbtCodes } = await getCollections();
  const { ISRC } = req.params;

  const code = await crbtCodes.find({}).toArray();

  res.send(code);
});

router.get("/:ISRC", async (req, res) => {
  const { crbtCodes } = await getCollections();
  const { ISRC } = req.params;

  const code = await crbtCodes.find({ ISRC }).toArray();

  res.send(code);
});

module.exports = router;
