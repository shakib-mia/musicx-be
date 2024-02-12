const express = require("express");
const router = express.Router();
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");

router.get("/", async (req, res) => {
  const { paymentRequest } = await getCollections();

  const historyCursor = await paymentRequest.find({}).toArray();
  res.send(historyCursor);
});

router.post("/", async (req, res) => {
  const { paymentRequest } = await getCollections();

  const insertCursor = await paymentRequest.insertOne(req.body);

  res.send(insertCursor);
});

router.put("/:_id", async (req, res) => {
  const { _id } = req.params;
  const updatedDoc = req.body;
  delete updatedDoc._id;
  updatedDoc.disbursed = true;

  const { paymentHistory, paymentRequest } = await getCollections();

  const deleteCursor = await paymentRequest.deleteOne({
    _id: new ObjectId(_id),
  });

  const addedCursor = await paymentHistory.insertOne(updatedDoc);

  res.send({ deleteCursor, addedCursor });
});

router.post("/:_id", async (req, res) => {
  const { _id } = req.params;
  const { paymentHistory, paymentRequest } = await getCollections();

  const deleteCursor = await paymentRequest.deleteOne({
    _id: new ObjectId(_id),
  });

  const data = req.body;
  data.declined = true;

  delete data._id;

  const addedCursor = await paymentHistory.insertOne(data);
  res.send({ deleteCursor, addedCursor });
});

// need to send notification to user

module.exports = router;
