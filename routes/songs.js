const express = require("express");
const verifyJWT = require("../verifyJWT");
const getCollections = require("../constants");
const router = express.Router();

router.post("/", verifyJWT, async (req, res) => {
  const { isrc } = req.body;
  const { songs } = await getCollections();
  const isrcs = isrc?.split(",");

  let songArray = [];

  for (const isrc of isrcs) {
    // console.log(isrc);
    const songData = await songs.findOne({ ISRC: isrc });
    // console.log(songData);
    if (songData !== null) {
      songArray.push(songData);
    }
  }

  console.log(songArray);

  res.send(songArray);
});

module.exports = router;
