const { Router } = require("express");
const { getCollections } = require("../constants");
const { ObjectId } = require("mongodb");

const router = Router();

router.get("/", async (req, res) => {
  const { paymentRequest } = await getCollections();

  const historyCursor = await paymentRequest.find({}).toArray();
  res.send(historyCursor);
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

  // const updateCursor = await paymentHistory.updateOne(
  //   { _id: new ObjectId(_id) },
  //   { $set: updatedDoc },
  //   {
  //     upsert: true,
  //   }
  // );

  // res.send(updateCursor);

  // console.log(_id, req.body);
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

module.exports = router;
