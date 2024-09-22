const express = require("express");
const router = express.Router();
const verifyJWT = require("../verifyJWT"); // Make sure to provide the correct path
const { getCollections } = require("../constants");

// Your /users route logic
router.post("/", verifyJWT, async (req, res) => {
  const { fbInstaWhitelisting } = await getCollections();

  const fields = [
    "rfacebook_insta_whitelisting_uname",
    "rfacebook_insta_whitelisting_uemail",
    "rfacebook_insta_whitelisting_phone",
    "rfacebook_insta_whitelisting_record_label",
  ];

  function objectIncludesAllFields(obj) {
    return fields.every((field) => field in obj);
  }

  if (objectIncludesAllFields(req.body)) {
    const insertCursor = await fbInstaWhitelisting.insertOne(req.body);

    res.send(insertCursor);
  } else {
    res.status(400).json({
      error: "Bad Request",
      message: "One or more fields are invalid or unexpected.",
    });
  }
});

module.exports = router;
