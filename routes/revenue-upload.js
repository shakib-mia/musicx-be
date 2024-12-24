const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");

router.post("/", verifyJWT, async (req, res) => {
  const { revenueCollections, cutPercentages } = await getCollections();
  const data = req.body;

  for (const item of data) {
    const foundCut = await cutPercentages.findOne({ isrc: item.isrc });
    if (foundCut !== null) {
      item["final revenue"] =
        item["after tds revenue"] -
        item["after tds revenue"] * ((foundCut?.cut_percentage || 0) / 100);

      item["forevision cut"] = foundCut.cut_percentage;
    }
  }

  const uploadCursor = await revenueCollections.insertMany(data);

  res.send(uploadCursor);
});

module.exports = router;
