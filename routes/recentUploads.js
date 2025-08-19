const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

router.get("/", verifyJWT, async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  const { email } = jwt.decode(req.headers.token);

  // Streaming গানগুলো
  const streamingSongs = await recentUploadsCollection
    .find({ userEmail: email, status: "streaming" })
    .toArray();

  // Not streaming গানগুলো (status "streaming" না)
  const notStreamingSongs = await recentUploadsCollection
    .find({ userEmail: email, status: { $ne: "streaming" } })
    .toArray();

  // console.log({ streamingSongs });

  res.send({ streamingSongs, notStreamingSongs });
});

router.get("/album", verifyJWT, async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  // const album =await recentUploadsCollection.find({price: 99900, })
  const { email } = jwt.decode(req.headers.token);

  // console.log(email);
  const streamingAlbum = await recentUploadsCollection
    .find({
      userEmail: email,
      songs: { $type: "array" }, // filters where 'songs' is an array
      status: "streaming",
    })
    .toArray();

  const notStreamingAlbum = await recentUploadsCollection
    .find({
      userEmail: email,
      songs: { $type: "array" }, // filters where 'songs' is an array
      status: { $ne: "streaming" },
    })
    .toArray();

  res.send({ streamingAlbum, notStreamingAlbum });
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
