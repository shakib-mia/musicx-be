const express = require("express");
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");
const router = express.Router();

router.post("/", verifyJWT, async (req, res) => {
  const { takedownRequestsCollection } = await getCollections();

  const body = req.body;

  const insertCursor = await takedownRequestsCollection.insertOne(body);

  res.send(insertCursor);

  //   console.log(body);
});

router.get("/", async (req, res) => {
  const { takedownRequestsCollection } = await getCollections();
  const requests = await takedownRequestsCollection.find({}).toArray();

  res.send(requests);
});

module.exports = router;
