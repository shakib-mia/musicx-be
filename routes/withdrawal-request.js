const express = require("express");
const router = express.Router();
const verifyJWT = require("../verifyJWT"); // Make sure to provide the correct path
const getCollections = require("../constants");
const multer = require("multer");
const path = require("path");

// Set storage engine (from Step 2)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/gst-certificates");
  },
  filename: function (req, file, cb) {
    // console.log(object);
    cb(
      null,
      file.originalname.split(".")[0] +
        "-" +
        Date.now() +
        "." +
        file.originalname.split(".")[1]
    );
  },
});

// Initialize upload variable
const upload = multer({ storage: storage, limits: { fileSize: 1000000 } });

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { withdrawalRequest } = await getCollections();
  console.log("http://localhost:4000/file/" + req.file.filename);
  //   const postCursor = await withdrawalRequest(req.body);

  //   res.send(postCursor);
});

module.exports = router;
