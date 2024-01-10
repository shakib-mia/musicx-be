const express = require("express");
const router = express.Router();
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");

router.get("/", verifyJWT, async (req, res) => {
  const { platformsCollection } = await getCollections();
  const platformsCursor = await platformsCollection.find({});
  const platforms = await platformsCursor.toArray();

  res.send(platforms);
});

module.exports = router;
