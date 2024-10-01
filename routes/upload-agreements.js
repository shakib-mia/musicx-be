const express = require("express");
// const {getCollections }= require("../constants");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { getCollections } = require("../constants");

// Ensure the directory exists before setting up the multer storage
const uploadDir = "uploads/agreements/";
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Now that the directory is guaranteed to exist, we can set it as the destination
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const { authorization } = req.headers;
    // console.log(req.headers);
    const fileName = file.originalname?.includes(" ")
      ? file.originalname?.split(" ").join("_")
      : file.originalname;

    // console.log(file.originalname?.split(" "));

    cb(null, file.fieldname + "-" + Date.now() + "-" + fileName);
  },
});

const upload = multer({ storage: storage });

router.use(
  "/uploads/agreements",
  express.static("uploads/agreements"),
  cors({
    origin: "*",
  })
);

router.post("/", upload.single("file"), (req, res) => {
  const fileName = req.file?.path?.includes(" ")
    ? req.file?.path?.split(" ").join("_")
    : req.file?.path;

  res.send({
    agreementUrl: `${req.protocol}://${req.get("host")}/${fileName}`,
  });
});

router.post("/add-to-db", async (req, res) => {
  const { emailId, agreementUrl, isrc } = req.body;
  const data = { emailId, agreementUrl, isrc };

  const { agreementsCollection } = await getCollections();

  const insertCursor = await agreementsCollection.insertOne(data);
  res.send(insertCursor);
});

router.get("/", async (req, res) => {
  const { agreementsCollection } = await getCollections();

  const agreements = await agreementsCollection.find({}).toArray();

  res.send(agreements);
});

module.exports = router;
