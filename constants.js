const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@cluster0.i4vpazx.mongodb.net/?retryWrites=true&w=majority`;
const uri2 = `mongodb+srv://${process.env.user_db}:${process.env.user_db_pass}@cluster0.ynlqa8v.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const client2 = new MongoClient(uri2, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const getCollections = async () => {
  const userProfileCollection = await client2
    .db("forevision-digital")
    .collection("user-profile-data");

  const adminsCollection = await client
    .db("forevision-digital")
    .collection("admins"); // admins collection

  const clientsCollection = await client
    .db("forevision-digital")
    .collection("client-with-isrc-collection"); // users collection

  const demoClientsCollection = await client
    .db("forevision-digital")
    .collection("demo-clients"); // users collection

  const isrcWithIDCollection = await client
    .db("forevision-digital")
    .collection("all-isrcs"); // ISRC collection
  const recordLabelsCollection = await client2
    .db("forevision-digital")
    .collection("record-labels");

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

  const demoClients = await client
    .db("forevision-digital")
    .collection("demo-clients");

  const paymentHistory = await client
    .db("forevision-digital")
    .collection("payment-history");

  const isrcCollection = await client
    .db("forevision-digital")
    .collection("isrcs");

  const paymentRequest = await client2
    .db("forevision-digital")
    .collection("withdrawal-request");

  const fbInstaWhitelisting = await client2
    .db("forevision-digital")
    .collection("fb-insta-whitelisting");

  const fbInstaProfile = await client2
    .db("forevision-digital")
    .collection("fb-insta-profile");
  const withdrawalRequest = await client2
    .db("forevision-digital")
    .collection("withdrawal-request");
  const songsCollection = await client2
    .db("forevision-digital")
    .collection("mother-isrc-collection");
  const couponCodesCollection = await client2
    .db("forevision-digital")
    .collection("coupon-codes");
  const notificationsCollections = await client2
    .db("forevision-digital")
    .collection("notifications");

  function customLog(...messages) {
    const err = new Error();
    const stackLine = err.stack.split("\n")[2]; // Adjust this line number based on where the error stack points to the correct caller
    const matchResult = stackLine.match(/at (.*)\s+\((.*):(\d*):(\d*)\)/);
    if (matchResult) {
      const [, , filePath, line, column] = matchResult;
      const fileAndLine = `${filePath}:${line}:${column}`;
      console.log(fileAndLine, ...messages);
    } else {
      console.log(...messages);
    }
  }

  return {
    adminsCollection,
    clientsCollection,
    demoClients,
    isrcCollection,
    platformsCollection,
    revenueCollections,
    usersCollection,
    userProfileCollection,
    userDetails,
    demoClientsCollection,
    paymentHistory,
    paymentRequest,
    fbInstaWhitelisting,
    fbInstaProfile,
    withdrawalRequest,
    songsCollection,
    customLog,
    isrcWithIDCollection,
    recordLabelsCollection,
    couponCodesCollection,
    notificationsCollections,
  };
};

module.exports = getCollections;
