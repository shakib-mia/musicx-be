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
const nodemailer = require("nodemailer");

app.use(express());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "Outlook", // e.g., 'Gmail', 'SMTP'
  auth: {
    user: process.env.emailAddress,
    pass: process.env.emailPass,
  },
});

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

    const userDetails = await client
      .db("forevision-digital")
      .collection("user-details");

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

      const topContributor = users.reduce(
        (max, obj) =>
          obj.isrc?.split(",").length > max.isrc?.split(",").length ? obj : max,
        users[0]
      );

      const topSong = revenues.reduce(
        (max, obj) => (obj[" Royalty "] > max[" Royalty "] ? obj : max),
        revenues[0]
      );

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
    });

    app.get("/revenue", verifyJWT, async (req, res) => {
      const revenueCursor = await revenueCollections.find({});

      const revenues = await revenueCursor.toArray();

      res.send(revenues);
    });

    app.get("/user-revenue", verifyJWT, async (req, res) => {
      const { email } = jwt.decode(req.headers.token);
      // console.log(email);
      const clientsCursor = await clientsCollection.findOne({
        user_email: email,
      });

      // const

      const isrcs = [];

      clientsCursor.content_isrc
        .split(",")
        .map((item) => isrcs.push(item.trim()));

      // isrcs.map((isrc) => {
      //   const revenueCursor = revenueCollections.findOne({ isrc });
      //   console.log(revenueCursor);
      // });
      const revenues = [];
      for (const isrc of isrcs) {
        const revenueCursor = await revenueCollections.findOne({ isrc });
        revenueCursor !== null && revenues.push(revenueCursor);
      }

      console.log(revenues.length);
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

      if (userCursor !== null) {
        bcrypt.compare(password, userCursor.user_password, (err, result) => {
          if (result) {
            // res.send({ message: "success" });
            const token = jwt.sign({ email }, process.env.access_token_secret, {
              expiresIn: "1h",
            });

            res.send({ token });
          } else {
            res.status(401).send({ message: "incorrect password" });
          }
        });
      } else {
        res.status(401).send({ message: "no user found" });
      }
    });

    app.post("/reset-password", async (req, res) => {
      const { user_email } = req.body;
      const usersCursor = await usersCollection.findOne({ user_email });

      if (usersCursor.password) {
        var message = {
          from: "abdullahalsamad@outlook.com",
          to: user_email,
          subject: "Reset Password",
          // text: "Plaintext version of the message",
          html: `<div>
          Your Password new is 
          <h1>${usersCursor.password}</h1>
          </div>`,
        };

        transporter.sendMail(message, (error, info) => {
          if (error) {
            console.error(error);
            res.status(500).send("Error sending email");
          } else {
            res.send("Email sent successfully");
          }
        });
      } else {
        function generatePassword() {
          var length = 8,
            charset =
              "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
          for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
          }
          return retVal;
        }

        const newPassword = generatePassword();

        var message = {
          from: "abdullahalsamad@outlook.com",
          to: user_email,
          subject: "Reset Password",
          // text: "Plaintext version of the message",
          html: `<div>
          Your Password new is 
          <h1>${newPassword}</h1>
          </div>`,
        };

        transporter.sendMail(message, (error, info) => {
          if (error) {
            console.error(error);
            res.status(500).send("Error sending email");
          } else {
            res.send("Email sent successfully");
          }
        });

        const user = await usersCollection.findOne({ user_email });

        const updateCursor = await usersCollection.updateOne(
          { user_email },
          { $set: { ...user, password: newPassword } },
          { $upsert: true }
        );

        res.send({ updateCursor });
      }
    });

    app.get("/getUserData", async (req, res) => {
      const { token } = req.headers;
      if (jwt.decode(token) !== null) {
        const { email } = jwt.decode(token);

        const data = await userDetails.findOne({ user_email: email });
        // console.log(data);
        res.send({ data });
      }
    });

    app.post("/user-signup", async (req, res) => {
      const reqBody = req.body;
      const userExist = await usersCollection.findOne({
        email: reqBody.email,
      });

      // if user doesn't exist
      if (userExist === null) {
        bcrypt.hash(reqBody.password, 10, async function (err, hash) {
          // Store hash in your password DB.
          if (hash.length) {
            const user = {
              user_email: reqBody.email,
              user_password: hash,
            };

            const registerCursor = await usersCollection.insertOne(user);
            res.send(registerCursor);
          }
        });
      } else {
        // if user exists
        res.send("user already exist");
      }
    });

    app.post("/post-user-details", async (req, res) => {
      const { user_email } = req.body;
      const foundUserDetails = await userDetails.findOne({ user_email });
      if (foundUserDetails === null) {
        const userDetailsCursor = await userDetails.insertOne(req.body);

        res.send(userDetailsCursor);
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => console.log("listening on port", port));
