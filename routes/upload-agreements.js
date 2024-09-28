const express = require("express");
// const {getCollections }= require("../constants");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const jwt = require("jsonwebtoken");

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
    artWorkUrl: `${req.protocol}://${req.get("host")}/${fileName}`,
  });
});

module.exports = router;
