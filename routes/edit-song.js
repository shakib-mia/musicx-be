const express = require("express");
const { getCollections } = require("../constants");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../verifyJWT");
const router = express.Router();

router.post("/", verifyJWT, async (req, res) => {
  const { body } = req;
  const { songUpdateRequestCollection } = await getCollections();
  const newBody = { ...body };
  delete newBody._id;

  const insertCursor = await songUpdateRequestCollection.insertOne(newBody);
  // console.log("requested");
  res.send(insertCursor);
});

router.get("/", verifyJWT, async (req, res) => {
  const { songUpdateRequestCollection } = await getCollections();

  const insertCursor = await songUpdateRequestCollection.find({}).toArray();
  res.send(insertCursor);
});

router.put("/new/:_id", async (req, res) => {
  const {
    recentUploadsCollection,
    songUpdateRequestCollection,
    notificationsCollections,
  } = await getCollections();
  // delete req.body
  const newBody = { ...req.body };
  delete newBody._id;

  const updateCursor = await recentUploadsCollection.updateOne(
    { _id: new ObjectId(req.params._id) },
    { $set: newBody },
    { upsert: false }
  );

  const updateCursor2 = await songUpdateRequestCollection.deleteOne({
    _id: new ObjectId(req.body._id),
  });

  const timeStamp = Math.floor(new Date().getTime() / 1000);

  const notification = {
    email: req.body.emailId,
    message: `Your Update Request for ${newBody.songName} has been approved`,
    date: timeStamp,
  };
  console.log(notification);
  const notificationCursor = await notificationsCollections.insertOne(
    notification
  );

  res.send({ updateCursor, updateCursor2, notification });
});

/**
 *
 *
 * for old songs use the collections `songs`
 *
 *
 * */

router.put("/old/:_id", async (req, res) => {
  const { _id } = req.params;

  // console.log(_id);

  const {
    songs,
    songUpdateRequestCollection,
    recentUploadsCollection,
    newSongs,
    notificationsCollections,
  } = await getCollections();
  const song = await songs.findOne({ ISRC: req.body.ISRC });
  if (req.body.S) {
    delete req.body.S;
  }

  console.log(song);

  const updateCursor = await songs.updateOne(
    { _id: song._id },
    { $set: req.body },
    { upsert: false }
  );

  await songUpdateRequestCollection.deleteOne({ _id: new ObjectId(_id) });
  const timeStamp = Math.floor(new Date().getTime() / 1000);

  const notification = {
    email: req.body.emailId,
    message: `Your Update Request for ${song.Song} has been approved`,
    date: timeStamp,
  };
  const notificationCursor = await notificationsCollections.insertOne(
    notification
  );
  // console.log(song);
  res.send(updateCursor);
});

module.exports = router;
