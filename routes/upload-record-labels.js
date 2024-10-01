const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const verifyJWT = require("../verifyJWT");
const { getCollections } = require("../constants");

// Ensure the directory exists before setting up the multer storage
const uploadDir = "uploads/record-labels/";
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Now that the directory is guaranteed to exist, we can set it as the destination
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const { token } = req.headers;
    // console.log(req.headers);
    const { email } = jwt.decode(token);
    cb(
      null,
      file.fieldname +
        "-" +
        email.split("@")[0] +
        "-" +
        Date.now() +
        "-" +
        file.originalname.split(" ").join("-")
    );
  },
});

const upload = multer({ storage: storage });

router.use(
  "/uploads/record-labels",
  express.static("uploads/record-labels"),
  cors({
    origin: "*", // Allows access from any origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Optional: Specify allowed methods
    allowedHeaders: "Content-Type,Authorization", // Optional: Specify allowed headers
  })
);

router.post("/", verifyJWT, upload.single("file"), (req, res) => {
  // console.log(req.file, "aadhar");
  // console.log(req.protocol);
  res.send({ url: `https://${req.get("host")}/${req.file?.path}` });
});

router.get("/", async (req, res) => {
  const { recordLabelFilesCollection } = await getCollections();

  const recordLabelsFiles = await recordLabelFilesCollection.find({}).toArray();
  res.send(recordLabelsFiles);
});

router.post("/details", async (req, res) => {
  const { recordLabelFilesCollection } = await getCollections();

  const insertCursor = await recordLabelFilesCollection.insertOne(req.body);
  res.send(insertCursor);
});

module.exports = router;
