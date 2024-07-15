const express = require("express");
const getCollections = require("../constants");

async function getNextOrderId() {
  const { songs } = await getCollections();

  // Find the maximum existing orderId and extract the numeric part
  const latestSong = await songs
    .find({ orderId: { $regex: /^FVDO\d{5}$/ } })
    .sort({ orderId: -1 })
    .limit(1)
    .toArray();
  const maxOrderId =
    latestSong.length > 0 ? parseInt(latestSong[0].orderId.slice(4), 10) : 0;

  // Increment the orderId
  const nextOrderId = maxOrderId + 1;

  // Pad the orderId to ensure it is 5 digits long and add the prefix
  const paddedOrderId = nextOrderId.toString().padStart(5, "0");

  return `FVDO${paddedOrderId}`;
}

async function generateUniqueOrderId() {
  const { songs } = await getCollections();

  let orderId;
  let orderExists = true;

  while (orderExists) {
    // Generate the next orderId
    orderId = await getNextOrderId();
    orderExists = await songs.findOne({ orderId });
    // if (orderExists) {
    //   console.log(`Order ID ${orderId} already exists. Generating a new one.`);
    // }
  }

  // Store the orderId in songs collection
  // await songs.insertOne({ orderId });

  return orderId;
}

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const uniqueOrderId = await generateUniqueOrderId();
    res.send({ orderId: uniqueOrderId });
  } catch (error) {
    console.error("Error generating unique order ID:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
