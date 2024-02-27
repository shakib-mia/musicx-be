const express = require("express");
const router = express.Router();
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  const { paymentRequest } = await getCollections();

  const historyCursor = await paymentRequest.find({}).toArray();
  res.send(historyCursor);
});

// router.post("/", upload.array("uploads/gst-certificates"), async (req, res) => {
//   const { paymentRequest } = await getCollections();
//   console.log(req);

//   // const insertCursor = await paymentRequest.insertOne(req.body);

//   // res.send(insertCursor);
// });

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
