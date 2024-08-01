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

router.get("/", verifyJWT, async (req, res) => {
  const { email } = jwt.decode(req.headers.token);
  const { songs, clientsCollection } = await getCollections();

  // console.log(email);
  // const songs = await recentUploadsCollection
  //   .find({ userEmail: email })
  //   .toArray();

  const user = await clientsCollection.findOne({ emailId: email });
  // console.log(user);
  const isrcs = user.isrc.split(",");
  // console.log(isrcs);

  const songsArray = await songs.find({ ISRC: { $in: isrcs } }).toArray();
  // console.log(songsArray);

  res.send(songsArray);
});

router.put("/:_id", async (req, res) => {
  const { _id } = req.params;
  // const { recentUploadsCollection } = await getCollections();
  const { recentUploadsCollection } = await getCollections();

  // for adding paid in song
  // const data = await recentUploadsCollection.findOne({
  //   _id: new ObjectId(_id),
  // });

  // data.paymentStatus = "paid";

  const updateCursor = await recentUploadsCollection.updateOne(
    { _id: new ObjectId(_id) },
    { $set: { ...req.body } },
    { upsert: true }
  );

  res.send(updateCursor);
});

router.get("/by-order-id/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { recentUploadsCollection } = await getCollections();

  const song = await recentUploadsCollection.findOne({ orderId });
  res.send(song);
});

router.put("/by-order-id/:orderId", async (req, res) => {
  const { orderId } = req.params;
  // const { recentUploadsCollection } = await getCollections();
  const { recentUploadsCollection } = await getCollections();

  const data = await recentUploadsCollection.findOne({ orderId });
  const updated = req.body;
  updated.paymentStatus = "paid";

  delete updated._id;

  // console.log({ data, req: req.body, updated });

  console.log(updated);

  const updateCursor = await recentUploadsCollection.updateOne(
    { _id: data._id },
    { $set: updated },
    { upsert: false }
  );

  res.send(updateCursor);
});

module.exports = router;
