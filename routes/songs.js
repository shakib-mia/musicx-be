const express = require("express");
const verifyJWT = require("../verifyJWT");
const { getCollections, client } = require("../constants");
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

  console.log(req.body);

  const updateCursor = await clientsCollection.updateOne(
    { _id: user._id },
    { $set: newUser },
    { upsert: true }
  );

  const insertCursor = await newSongs.insertOne(song);

  res.send({ insertCursor, updateCursor });
});

router.get("/by-user-id/:user_id", async (req, res) => {
  const { songs, clientsCollection, newSongs } = await getCollections();

  const user = await clientsCollection.findOne({
    "user-id": req.params.user_id,
  });
  const isrcs = user?.isrc?.split(",");

  if (isrcs && isrcs.length) {
    const songsArray = await songs.find({ ISRC: { $in: isrcs } }).toArray();
    const newSongsArray = await newSongs
      .find({ isrc: { $in: isrcs } })
      .toArray();

    res.send([...songsArray, ...newSongsArray]);
  } else {
    res.send("no isrcs have been found");
  }
});

router.get("/all", async (req, res) => {
  const { songs, recentUploadsCollection } = await getCollections();

  const songsList = await songs.find({}).toArray();
  const recentSongs = await recentUploadsCollection
    .find({
      isrc: { $exists: true },
    })
    .toArray();

  res.send([...songsList, ...recentSongs]);
});

router.put("/:_id", async (req, res) => {
  const { clientsCollection } = await getCollections();
  const { _id } = req.params;
  console.log(_id);
  // const { recentUploadsCollection } = await getCollections();
  const { recentUploadsCollection } = await getCollections();
  delete req.body._id;
  // for adding paid in song
  // const data = await recentUploadsCollection.findOne({
  //   _id: new ObjectId(_id),
  // });

  // data.status = "paid";

  const foundIsrc = req.body.songs.find(
    (song) => song.status === "copyright-infringed"
  ).isrc;

  // console.log(req.body);
  const { emailId, userEmail } = req.body;

  const user = await clientsCollection.findOne({
    emailId: emailId || userEmail,
  });
  // console.log(user);
  // ;

  const updatedISRCList = user.isrc
    .split(",")
    .slice(0, user.isrc.split(",").length - 1);

  user.isrc = updatedISRCList.join(",");

  // console.log(user);
  const newUser = { ...user };

  delete newUser._id;

  console.log(newUser);

  // const updatedCursor = await
  await clientsCollection.updateOne(
    { _id: new ObjectId(user._id) },
    { $set: newUser },
    { upsert: true }
  );

  // console.log("songs.js 80");

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
  console.log(song);
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
  // console.log(object);
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
  const { songs, recentUploadsCollection } = await getCollections();

  // const song = await songs.findOne({ ISRC });

  // Case insensitive
  const song = await songs.findOne({
    ISRC: { $regex: `^${ISRC}$`, $options: "i" },
  });
  // console.log(song);
  // console.log(song);
  if (song === null) {
    const song2 = await recentUploadsCollection.findOne({
      isrc: ISRC,
    });
    console.log(song2);
    res.send(song2);
  } else {
    res.send(song);
  }
});

module.exports = router;
