const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@cluster0.i4vpazx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const getCollections = async () => {
  const adminsCollection = await client
    .db("forevision-digital")
    .collection("admins"); // admins collection

  const clientsCollection = await client
    .db("forevision-digital")
    .collection("client-with-isrc-collection"); // users collection

  const demoClientsCollection = await client
    .db("forevision-digital")
    .collection("demo-clients"); // users collection

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

  const demoClients = await client
    .db("forevision-digital")
    .collection("demo-clients");

  const paymentHistory = await client
    .db("forevision-digital")
    .collection("payment-history");

  return {
    adminsCollection,
    clientsCollection,
    demoClients,
    isrcCollection,
    platformsCollection,
    revenueCollections,
    usersCollection,
    userDetails,
    demoClientsCollection,
    paymentHistory,
  };
};

module.exports = getCollections;
