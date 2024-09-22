const cors = require("cors");
const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");

router.post("/", cors(), async (req, res) => {
  const { revenueCollections } = await getCollections();
  const { isrcs } = req.body;

  const songs = await revenueCollections
    .find({ isrc: { $in: isrcs } })
    .toArray();
  res.send(songs);
});

module.exports = router;

// app.post("/songs-for-isrc", async (req, res) => {
//     const { isrcs } = req.body;

// const songs = await revenueCollections
//   .find({ isrc: { $in: isrcs } })
//   .toArray();
// res.send(songs);
//   });
