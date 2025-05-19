const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

router.get("/", verifyJWT, async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  const { email } = jwt.decode(req.headers.token);

  // Fetch documents where the "songs" key exists and matches the user's email
  const singleSongs = await recentUploadsCollection
    .find({ userEmail: email }) // Filter only documents with the "songs" key
    .sort({ status: { $eq: "streaming" } ? -1 : 1 }) // Sort by "streaming" status
    .toArray();

  console.log(singleSongs);

  res.send(singleSongs);
});

router.get("/album", verifyJWT, async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  // const album =await recentUploadsCollection.find({price: 99900, })
  const { email } = jwt.decode(req.headers.token);

  // console.log(email);
  const album = await recentUploadsCollection
    .find({
      userEmail: email,
      songs: { $type: "array" }, // filters where 'songs' is an array
    })
    .toArray();

  res.send(album);
});

router.get("/by-order-id/:_id", verifyJWT, async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  // const album =await recentUploadsCollection.find({price: 99900, })
  const { email } = jwt.decode(req.headers.token);

  // console.log(email);
  const album = await recentUploadsCollection.findOne({
    orderId: req.params._id,
  });
  res.send(album);
});

router.get("/album/:_id", verifyJWT, async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  // const album =await recentUploadsCollection.find({price: 99900, })
  const { email } = jwt.decode(req.headers.token);

  // console.log(email);
  const album = await recentUploadsCollection.findOne({
    _id: new ObjectId(req.params._id),
  });
  res.send(album);
});

router.get("/admin/album/live", verifyJWT, async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  const { email } = jwt.decode(req.headers.token);

  // Fetch the album where all songs have the "streaming" status
  const album = await recentUploadsCollection
    .find({
      price: 99900,
      songs: {
        $not: { $elemMatch: { status: { $ne: "streaming" } } }, // No song with a non-"streaming" status
      },
    })
    .toArray();
  console.log("finding live...");
  console.log(album);
  res.send(album);
});

router.get("/admin", async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  const recentUploads = await recentUploadsCollection.find({}).toArray();

  // console.log(recentUploads.length);
  res.send(recentUploads);
});

router.get("/admin/album", async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  // const { email } = jwt.decode(req.headers.token);

  // Fetch all albums based on price and user email
  const albums = await recentUploadsCollection
    .find({
      price: 99900,
      // userEmail: email,
    })
    .toArray();

  // Filter out albums where all songs have the status "streaming"
  const filteredAlbums = albums.filter(
    (album) => !album.songs?.every((song) => song.status === "streaming")
  );

  res.send(filteredAlbums);
});

router.post("/", verifyJWT, async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  const { email } = jwt.decode(req.headers.token);

  req.body.emailId = email;

  const recentUploads = await recentUploadsCollection.insertOne(req.body);
  // console.log(req.body);

  res.send(recentUploads);
});

router.put("/:_id", async (req, res) => {
  const { body } = req;
  const { recentUploadsCollection } = await getCollections();

  delete body._id;

  const updateCursor = await recentUploadsCollection.updateOne(
    { _id: new ObjectId(req.params._id) },
    { $set: body },
    { upsert: false }
  );

  res.send(updateCursor);
  // console.log(body);
});

module.exports = router;
