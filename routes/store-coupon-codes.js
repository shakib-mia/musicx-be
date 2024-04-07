const express = require("express");
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/", verifyJWT, async (req, res) => {
  const { couponCodesCollection } = await getCollections();

  const insertCursor = await couponCodesCollection.insertOne(req.body);
  res.send(insertCursor);
});

router.get("/", verifyJWT, async (req, res) => {
  const { couponCodesCollection } = await getCollections();

  const coupons = await couponCodesCollection.find({}).toArray();

  res.send(coupons);
});

router.delete("/:id", verifyJWT, async (req, res) => {
  const { id } = req.params;

  console.log(object);
});

module.exports = router;
