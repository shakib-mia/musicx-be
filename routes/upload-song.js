const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const verifyJWT = require("./../verifyJWT");

// Ensure the directory exists before setting up the multer storage
const uploadDir = "uploads/songs/";
const tempDir = "uploads/temp/songs/";
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Now that the directory is guaranteed to exist, we can set it as the destination
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const { token } = req.headers;
    // console.log(req.headers);
    // console.log(file);

    const fileName = file.originalname?.includes(" ")
      ? file.originalname?.split(" ").join("_")
      : file.originalname;

    const { email } = jwt.decode(token);
    cb(
      null,
      file.fieldname +
        "-" +
        email.split("@")[0] +
        "-" +
        Date.now() +
        "-" +
        fileName
    );
  },
});

const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Now that the directory is guaranteed to exist, we can set it as the destination
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const { token } = req.headers;
    // console.log(req.headers);

    const fileName = file.originalname?.includes(" ")
      ? file.originalname?.split(" ").join("_")
      : file.originalname;

    const { email } = jwt.decode(token);
    cb(
      null,
      file.fieldname +
        "-" +
        email.split("@")[0] +
        "-" +
        Date.now() +
        "-" +
        fileName
    );
  },
});

const upload = multer({ storage: storage });
const tempUpload = multer({ storage: tempStorage });

router.use(
  "/uploads/songs",
  express.static("uploads/songs"),
  cors({
    origin: "*",
  })
);

router.post("/", verifyJWT, tempUpload.single("file"), (req, res) => {
  // console.log(req.file, "aadhar");
  const fileName = req.file?.path?.includes(" ")
    ? req.file?.path?.split(" ").join("_")
    : req.file?.path;
  res.send({
    songUrl: `${req.protocol}://${req.get("host")}/${fileName}`,
  });
});

router.post("/delete/:fileName", (req, res) => {
  const { fileName } = req.params;
  // console.log(`Received request to delete file: ${fileName}`);
  const dir =
    "/" +
    __dirname
      .split("/")
      .slice(1, __dirname.split("/").length - 1)
      .join("/");
  // console.log(dir);

  if (!fileName) {
    return res.status(400).send("File name is required");
  }

  // Prevent directory traversal attacks
  const sanitizedFileName = path.basename(fileName);
  const filePath = path.join(dir, "uploads", "temp/songs", sanitizedFileName);

  // console.log(`Sanitized file name: ${sanitizedFileName}`);
  // console.log(`File path to delete: ${filePath}`);

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found at path: ${filePath}`);
      console.error(err);
      return res.status(404).send("File not found");
    }

    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file at path: ${filePath}`);
        console.error(err);
        return res.status(500).send("Error deleting file");
      }

      // console.log(`File deleted successfully at path: ${filePath}`);
      res.send("File deleted successfully");
    });
  });
});

module.exports = router;
