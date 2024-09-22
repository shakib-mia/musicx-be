const express = require("express");
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");
const router = express.Router();

router.post("/", async (req, res) => {
  const { bulkUploadCollection } = await getCollections();
  const insertCursor = await bulkUploadCollection.insertOne(req.body);

  res.send(insertCursor);
});

module.exports = router;
