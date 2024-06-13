const express = require("express");
const getCollections = require("../constants");

function generateOrderId() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}
async function generateUniqueOrderId() {
  let orderId;
  let orderExists = true;

  const { songs } = await getCollections();

  while (orderExists) {
    orderId = generateOrderId();
    orderExists = await songs.findOne({ orderId });
  }

  return orderId;
}

const router = express.Router();

router.get("/", async (req, res) => {
  const uniqueOrderId = await generateUniqueOrderId();

  res.send(uniqueOrderId);
});

module.exports = router;
