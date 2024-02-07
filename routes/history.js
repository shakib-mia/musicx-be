const { Router } = require("express");
const getCollections = require("../constants");

const router = Router();

router.get("/", async (req, res) => {
  const { paymentHistory } = await getCollections();

  const historyCursor = await paymentHistory.find({}).toArray();

  res.send(historyCursor);
});

module.exports = router;
