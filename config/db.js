const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = `mongodb+srv://${process.env.BootCamp_Admin}:${process.env.BootCamp_Admin_Password}@sajjadjim15.ac97xgz.mongodb.net/?retryWrites=true&w=majority&appName=SajjadJim15`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

const connectDB = async () => {
  try {
    await client.connect();
    db = client.db("BootCamp");
    console.log("✅ MongoDB Connected successfully in BootCamp database");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

const getDB = () => db;

module.exports = connectDB;
module.exports.getDB = getDB;
