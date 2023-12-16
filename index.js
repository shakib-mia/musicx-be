require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@cluster0.i4vpazx.mongodb.net/?retryWrites=true&w=majority`;
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyJWT = require("./verifyJWT");
const bodyParser = require("body-parser");

// console.log(uri);
app.use(express());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const port = process.env.port || 5000;

app.get("/", (req, res) => {
  res.send(`from port ${port}`);
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const adminsCollection = await client
      .db("forevision-digital")
      .collection("admins"); // admins collection

    const clientsCollection = await client
      .db("forevision-digital")
      .collection("client-with-isrc-collection"); // users collection

    const isrcCollection = await client
      .db("forevision-digital")
      .collection("isrc-with-id"); // ISRC collection

    const platformsCollection = await client
      .db("forevision-digital")
      .collection("platform-name"); // platform-name

    const revenueCollections = await client
      .db("forevision-digital")
      .collection("demo-revenue"); // demo-revenue
    const usersCollection = await client
      .db("forevision-digital")
      .collection("user-credentials-db");

    /**
     *
     * Getting all users
     *
     * */
    app.get("/users", verifyJWT, async (req, res) => {
      const usersCursor = await clientsCollection.find({});
      const users = await usersCursor.toArray();

      res.send(users);
    });

    /**
     *
     * Register Section
     *
     *
     * **/

    app.post("/register", async (req, res) => {
      const userExist = await adminsCollection.findOne({
        email: req.body.email,
      });

      // if user doesn't exist
      if (userExist === null) {
        // encrypting
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const user = {
          email: req.body.email,
          password: hash,
        };

        const registerCursor = await adminsCollection.insertOne(user);
        res.send(registerCursor);
      } else {
        // if user exists
        res.send("user already exist");
      }
    });

    app.get("/dashboard", verifyJWT, async (req, res) => {
      const usersCursor = await clientsCollection.find({});
      const users = await usersCursor.toArray();
      const isrcCursor = await isrcCollection.find({});
      const isrc = await isrcCursor.toArray();
      const revenueCursor = await revenueCollections.find({});
      const revenues = await revenueCursor.toArray();
      // console.log(users);

      const topContributor = users.reduce(
        (max, obj) =>
          obj.isrc.split(",").length > max.isrc.split(",").length ? obj : max,
        users[0]
      );

      const topSong = revenues.reduce(
        (max, obj) => (obj[" Royalty "] > max[" Royalty "] ? obj : max),
        revenues[0]
      );

      // console.log(topSong);

      res.send({
        usersCount: users.length,
        isrcCount: isrc.length,
        topContributor,
        topSong,
      });
    });

    app.get("/platforms", verifyJWT, async (req, res) => {
      const platformsCursor = await platformsCollection.find({});
      const platforms = await platformsCursor.toArray();

      res.send(platforms);
    });

    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      const admin = await adminsCollection.findOne({ email });

      if (bcrypt.compareSync(password, admin.password)) {
        const token = jwt.sign({ email }, process.env.access_token_secret, {
          expiresIn: "1h",
        });

        res.send({ token });
      }
    });

    app.post("/revenue-upload", verifyJWT, async (req, res) => {
      const data = req.body;

      const uploadCursor = await revenueCollections.insertMany(data);

      res.send(uploadCursor);
      // console.log(data);
    });

    app.get("/revenue", verifyJWT, async (req, res) => {
      const revenueCursor = await revenueCollections.find({});

      const revenues = await revenueCursor.toArray();

      res.send(revenues);
    });

    app.delete(
      "/revenue/:month/:year/:platform",
      verifyJWT,
      async (req, res) => {
        const revenueCursor = await revenueCollections.find({
          platformName: req.params.platform,
        });

        const revenues = await revenueCursor.toArray();
        revenues.filter((item) => item.date.split("-")[1] === req.body.date);

        // console.log(revenues);
        await revenues.map((item) => {
          const deleteCursor = revenueCollections.deleteOne({
            _id: new ObjectId(item._id),
          });
        });
      }
    );

    app.post("/user-login", async (req, res) => {
      const { email, password } = req.body;
      const userCursor = await usersCollection.findOne({ user_email: email });
      // console.log(userCursor);
      if (userCursor !== null) {
        if (userCursor.password === password) {
          // res.send({ message: "success" });
          const token = jwt.sign({ email }, process.env.access_token_secret, {
            expiresIn: "1h",
          });

          res.send({ token });
        } else {
          res.send({ message: "incorrect password" });
        }
      } else {
        res.send({ message: "no user found" });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => console.log("listening on port", port));
