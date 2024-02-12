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
    // Replace spaces with underscores (or you could use hyphens)
    const sanitizedFilename = file.originalname.replace(/\s+/g, "_");
    // console.log(sanitizedFilename.split(".")[0]);
    cb(
      null,
      sanitizedFilename.split(".")[0] +
        "_" +
        Date.now() +
        path.extname(sanitizedFilename)
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
  //   console.log(req.file.filename);

  //   const filename

  res.send("https://api.forevisiondigital.in/file/" + req.file.filename);
  //   const postCursor = await withdrawalRequest(req.body);

  //   res.send(postCursor);
});

module.exports = router;
