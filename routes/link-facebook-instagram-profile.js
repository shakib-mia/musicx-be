const express = require("express");
const router = express.Router();
const verifyJWT = require("../verifyJWT"); // Make sure to provide the correct path
const getCollections = require("../constants");

// Your /users route logic
router.post("/", verifyJWT, async (req, res) => {
  const { fbInstaProfile } = await getCollections();

  const fields = [
    "link_facebook_insta_song_name",
    "link_facebook_insta_song_isrc",
    "link_facebook_insta_song_email",
    "link_facebook_insta_song_url",
    "link_facebook_insta_song_insta",
  ];

  function objectIncludesAllFields(obj) {
    return fields.every((field) => field in obj);
  }

  if (objectIncludesAllFields(req.body)) {
    const insertCursor = await fbInstaProfile.insertOne(req.body);

    res.send(insertCursor);
  } else {
    res.status(400).json({
      error: "Bad Request",
      message: "One or more fields are invalid or unexpected.",
    });
  }
});

module.exports = router;
