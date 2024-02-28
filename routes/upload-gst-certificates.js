const express = require("express");
const router = express.Router();
const verifyJWT = require("../verifyJWT"); // Make sure to provide the correct path
const multer = require("multer");
const fs = require("fs");

// Ensure the directory exists before setting up the multer storage
const uploadDir = "uploads/gst-certificates/";
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Now that the directory is guaranteed to exist, we can set it as the destination
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // console.log(file);
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.use(
  "/uploads/gst-certificates",
  express.static("uploads/gst-certificates")
);

router.post("/", verifyJWT, async (req, res) => {
  console.log(req.file, "gst");
  res.send({ url: `${req.protocol}://${req.get("host")}/${req.file.path}` });
});
