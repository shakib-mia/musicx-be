const express = require("express");
const router = express.Router();
const verifyJWT = require("../verifyJWT"); // Make sure to provide the correct path
const jwt = require("jsonwebtoken");
const getCollections = require("../constants");

router.post("/", verifyJWT, async (req, res) => {
  const { withdrawalRequest } = await getCollections();
  const postCursor = await withdrawalRequest.insertOne(req.body);
  res.send(postCursor);
});

module.exports = router;
