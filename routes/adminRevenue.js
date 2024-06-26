const express = require("express");
const router = express.Router();
const getCollections = require("../constants");

router.get("/:isrc", async (req, res) => {
  const { revenueCollections } = await getCollections();
  const pipeline = [
    {
      $match: { isrc: req.params.isrc },
    },
    {
      $project: {
        _id: 0,
        isrc: 1,
        royality: 1,
      },
    },
  ];

  const royalties = await revenueCollections.aggregate(pipeline).toArray();
  res.send({ royalties });
});

module.exports = router;
