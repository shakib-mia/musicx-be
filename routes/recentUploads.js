const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");
const jwt = require("jsonwebtoken");

router.get("/", verifyJWT, async (req, res) => {
  const { recentUploadsCollection, newSongs } = await getCollections();
  const { email } = jwt.decode(req.headers.token);
  // const recentUploads = await recentUploadsCollection
  //   .find({ userEmail: email })
  //   .toArray();
  const recentUploads = await recentUploadsCollection
    .find({ userEmail: email })
    .toArray();

  res.send(recentUploads);
});

router.get("/admin", async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  const recentUploads = await recentUploadsCollection.find({}).toArray();

  res.send(recentUploads);
});

router.post("/", verifyJWT, async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  const recentUploads = await recentUploadsCollection.insertOne(req.body);
  // console.log(req.body);

  res.send(recentUploads);
});

router.put("/:_id", async (req, res) => {});

module.exports = router;
