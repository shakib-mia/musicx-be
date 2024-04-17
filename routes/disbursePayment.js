const express = require("express");
const router = express.Router();
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");
const multer = require("multer");
const { ObjectId } = require("mongodb");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// for history
router.get("/", async (req, res) => {
  const { paymentRequest } = await getCollections();

  const historyCursor = await paymentRequest.find({}).toArray();
  res.send(historyCursor);
});

// for getting specific data
router.get("/:_id", async (req, res) => {
  const { withdrawalRequest } = await getCollections();

  const { _id } = req.params;

  const data = await withdrawalRequest.findOne({ _id: new ObjectId(_id) });

  // console.log(data);
  res.send(data);
});

// for disbursement
router.put("/:_id", async (req, res) => {
  const { _id } = req.params;
  const updatedDoc = req.body;
  delete updatedDoc._id;
  updatedDoc.disbursed = true;
  // console.log(updatedDoc);

  const { paymentHistory, withdrawalRequest, clientsCollection } =
    await getCollections();

  const client = await clientsCollection.findOne({
    emailId: updatedDoc.emailId,
  });

  client.lifetimeDisbursed =
    (client.lifetimeDisbursed || 0) + client.lifetimeRevenue;
  console.log(client);

  const deleteCursor = await withdrawalRequest.deleteOne({
    _id: new ObjectId(_id),
  });

  const addedCursor = await paymentHistory.insertOne(updatedDoc);
  const updatedDocument = await clientsCollection.updateOne(
    { emailId: client.emailId },
    { $set: { ...client } },
    { upsert: false }
  );

  res.send({ deleteCursor, addedCursor, updatedDocument });
});

// for declining
router.post("/:_id", async (req, res) => {
  const { _id } = req.params;
  const { paymentHistory, withdrawalRequest } = await getCollections();

  const deleteCursor = await withdrawalRequest.deleteOne({
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
