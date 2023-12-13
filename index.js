require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@cluster0.i4vpazx.mongodb.net/?retryWrites=true&w=majority`;
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyJWT = require("./verifyJWT");

// console.log(uri);
app.use(express());
app.use(cors());
app.use(express.json());

const port = process.env.port;

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
      // console.log(users);

      const topContributor = users.reduce(
        (max, obj) =>
          obj.isrc.split(",").length > max.isrc.split(",").length ? obj : max,
        users[0]
      );

      // console.log(topContributor);

      res.send({
        usersCount: users.length,
        isrcCount: isrc.length,
        topContributor,
      });
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
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => console.log("listening on port", port));
