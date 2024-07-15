const express = require("express");
const verifyJWT = require("../verifyJWT");
const getCollections = require("../constants");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

router.post("/", verifyJWT, async (req, res) => {
  const { isrc } = req.body;
  const { songs } = await getCollections();
  const isrcs = isrc?.split(",");

  let songArray = [];

  for (const isrc of isrcs) {
    // console.log(isrc);
    const songData = await songs.findOne({ ISRC: isrc });
    // console.log(songData);
    if (songData !== null) {
      songArray.push(songData);
    }
  }

  console.log(songArray);

  res.send(songArray);
});

router.get("/", async (req, res) => {
  const { email } = jwt.decode(req.headers.token);
  const { recentUploadsCollection } = await getCollections();

  // console.log(email);
  const songs = await recentUploadsCollection
    .find({ userEmail: email })
    .toArray();

  res.send(songs);
});

router.get("/:_id", async (req, res) => {
  const { _id } = req.params;
  const { recentUploadsCollection } = await getCollections();

  // for adding paid in song
  const data = await recentUploadsCollection.findOne({
    _id: new ObjectId(_id),
  });

  data.paymentStatus = "paid";

  const updateCursor = await recentUploadsCollection.updateOne(
    { _id: new ObjectId(_id) },
    { $set: { ...data } },
    { upsert: true }
  );

  res.send(updateCursor);
});

module.exports = router;
