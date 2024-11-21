const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

router.get("/", verifyJWT, async (req, res) => {
  const { recentUploadsCollection, newSongs } = await getCollections();
  const { email } = jwt.decode(req.headers.token);
  // const recentUploads = await recentUploadsCollection
  //   .find({ userEmail: email })
  //   .toArray();
  const recentUploads = await recentUploadsCollection
    .find({ userEmail: email })
    .sort({ status: { $eq: "streaming" } ? -1 : 1 }) // Sort by "streaming" status first
    .toArray();

  res.send(recentUploads);
});

router.get("/album", verifyJWT, async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  // const album =await recentUploadsCollection.find({price: 99900, })
  const { email } = jwt.decode(req.headers.token);

  // console.log(email);
  const album = await recentUploadsCollection
    .find({
      price: 99900,
      userEmail: email,
    })
    .toArray();
  res.send(album);
});

router.get("/album/:_id", verifyJWT, async (req, res) => {
  const { recentUploadsCollection } = await getCollections();
  // const album =await recentUploadsCollection.find({price: 99900, })
  const { email } = jwt.decode(req.headers.token);

  // console.log(email);
  const album = await recentUploadsCollection.findOne({
    price: 99900,
    userEmail: email,
    _id: new ObjectId(req.params._id),
  });
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
  const recentUploads = await recentUploadsCollection
    .find({ price: 99900 })
    .toArray();

  // console.log(recentUploads.length);
  res.send(recentUploads);
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
