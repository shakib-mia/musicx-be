const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyJWT = require("../verifyJWT");
const { decode } = require("jsonwebtoken");

router.get("/", verifyJWT, async (req, res) => {
  const { token } = req.headers;
  const data = decode(token);

  res.send(data);
});

module.exports = router;
