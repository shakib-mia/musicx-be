const express = require("express");
const verifyJWT = require("../verifyJWT");
const getCollections = require("../constants");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

router.post("/", verifyJWT, async (req, res) => {
  const song = req.body;
  const { newSongs, clientsCollection } = await getCollections();
  delete song._id;

  const user = await clientsCollection.findOne({ emailId: song.userEmail });
  // console.log(user);
  const isrcs = user.isrc.split(",");
  isrcs.push(song.isrc);

  user.isrc = isrcs.join(",");

  const newUser = { ...user };
  delete newUser._id;

  const updateCursor = await clientsCollection.updateOne(
    { _id: user._id },
    { $set: newUser },
    { upsert: true }
  );

  const insertCursor = await newSongs.insertOne(song);

  res.send({ insertCursor, updateCursor });
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

router.get("/all", verifyJWT, async (req, res) => {
  const { songs } = await getCollections();

  const songsList = await songs.find({}).toArray();
  res.send(songsList);
});

router.put("/:_id", async (req, res) => {
  const { _id } = req.params;
  // const { recentUploadsCollection } = await getCollections();
  const { recentUploadsCollection } = await getCollections();

  // for adding paid in song
  // const data = await recentUploadsCollection.findOne({
  //   _id: new ObjectId(_id),
  // });

  // data.status = "paid";

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
  updated.status = "paid";

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

router.get("/:_id", async (req, res) => {
  const { songs, recentUploadsCollection } = await getCollections();
  const { _id } = req.params;

  try {
    // Search in the 'songs' collection first
    let song = await songs.findOne({ _id: new ObjectId(_id) });

    // If not found, search in the 'recentUploadsCollection'
    if (!song) {
      song = await recentUploadsCollection.findOne({ _id: new ObjectId(_id) });
    }

    console.log(song);

    // If the song is found in either collection, send it back
    if (song) {
      res.status(200).send(song);
    } else {
      res.status(404).send({ message: "Song not found" });
    }
  } catch (error) {
    console.error("Error finding song:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/by-isrc/:ISRC", async (req, res) => {
  const { ISRC } = req.params;
  const { songs } = await getCollections();

  // const song = await songs.findOne({ ISRC });

  // Case insensitive
  const song = await songs.findOne({
    ISRC: { $regex: `^${ISRC}$`, $options: "i" },
  });
  // console.log(song);

  res.send(song);
});

module.exports = router;
