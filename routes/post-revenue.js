const express = require("express");
const router = express.Router();
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");
const jwt = require("jsonwebtoken");

router.post("/", verifyJWT, async (req, res) => {
  const { page, currentPage } = req.body;
  const { revenueCollections } = await getCollections();
  const revenueCursor = await revenueCollections.find({}).limit(100);
  const revenues = await revenueCursor.toArray();
  // const data = revenues.splice(currentPage * 50, 50);
  const data = revenues;

  res.send({ data, count: revenues.length });
});

module.exports = router;
