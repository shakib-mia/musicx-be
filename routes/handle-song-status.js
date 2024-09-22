const express = require("express");
const { getCollections } = require("../constants");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.put("/:_id", async (req, res) => {
  const { _id } = req.params;
  const { recentUploadsCollection } = await getCollections();
  const data = req.body;
  delete data._id;

  const updateCursor = await recentUploadsCollection.updateOne(
    {
      _id: new ObjectId(_id),
    },
    {
      $set: data,
    },
    {
      upsert: true,
    }
  );

  if (updateCursor.acknowledged) {
  }

  // console.log(updateCursor);
  res.send(updateCursor);
});

module.exports = router;
