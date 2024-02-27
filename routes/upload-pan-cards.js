const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

// Ensure the directory exists before setting up the multer storage
const uploadDir = "uploads/pan-cards/";
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Now that the directory is guaranteed to exist, we can set it as the destination
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.use("/uploads/pan-cards", express.static("uploads/pan-cards"));

router.post("/", upload.single("file"), (req, res) => {
  console.log(req.file, "pan");
  res.send({ url: `${req.protocol}://${req.get("host")}/${req.file.path}` });
});

module.exports = router;
