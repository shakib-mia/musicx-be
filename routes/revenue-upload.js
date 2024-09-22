const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");

router.post("/", verifyJWT, async (req, res) => {
  const { revenueCollections } = await getCollections();
  const data = req.body;
  const uploadCursor = await revenueCollections.insertMany(data);

  res.send(uploadCursor);
});

module.exports = router;
