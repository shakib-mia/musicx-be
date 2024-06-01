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

router.get("/:couponCode", async (req, res) => {
  const { couponCode } = req.params;
  const { couponCodesCollection } = await getCollections();

  const couponCodeCursor = await couponCodesCollection.findOne({ couponCode });
  if (couponCodeCursor !== null) {
    // const date = new Date().getFullYear()+'-';
    // console.log(new Date().getMonth());
    const currentDate = new Date();
    const validFrom = new Date(couponCodeCursor.validFrom);
    const validTill = new Date(couponCodeCursor.validTill);

    if (currentDate >= validFrom && currentDate <= validTill) {
      res.send(couponCodeCursor);
    } else {
      res.status(410).send({ message: "Coupon Code Expired" });
    }
  } else {
    res.status(400).send({ message: "Invalid Coupon Code" });
  }
});

router.delete("/:id", verifyJWT, async (req, res) => {
  const { id } = req.params;

  console.log(object);
});

module.exports = router;
