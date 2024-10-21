const express = require("express");
const { getCollections } = require("../constants");
const router = express.Router();

router.get("/", async (req, res) => {
  const { plansCollection } = await getCollections();
  const plans = await plansCollection.find({}).toArray();
  res.send(plans);
});

module.exports = router;
