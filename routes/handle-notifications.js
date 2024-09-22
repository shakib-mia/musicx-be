const express = require("express");
const { getCollections } = require("../constants");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyJWT = require("../verifyJWT");
const { ObjectId } = require("mongodb");

router.get("/", verifyJWT, async (req, res) => {
  const { notificationsCollections } = await getCollections();
  // console.log(req.headers.token);

  const { email } = jwt.decode(req.headers.token);
  const notifications = await notificationsCollections
    .find({ email })
    .toArray();

  res.send(notifications);
});

router.put("/:_id", async (req, res) => {
  const { notificationsCollections } = await getCollections();

  const updateCursor = await notificationsCollections.updateOne(
    { _id: new ObjectId(req.params._id) },
    { $set: { ...req.body } },
    { upsert: false }
  );

  res.send(updateCursor);
});

module.exports = router;
