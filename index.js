const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Load environment variables from .env file
dotenv.config();

// const stripe = require('stripe')(process.env.PAYMENT_GATEWAY_KEY);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.BootCamp_Admin}:${process.env.BootCamp_Admin_Password}@sajjadjim15.ac97xgz.mongodb.net/?retryWrites=true&w=majority&appName=SajjadJim15`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const userCollection_BootCamp = client.db("BootCamp").collection("users");
        const collection_BootCamp = client.db("BootCamp").collection("camps");
        const feedBack_Collection = client.db("BootCamp").collection("feedbacks");
        const bootCamp_Registration_Collection = client.db("BootCamp").collection("registrations");


        //--------------------------------------------------------------
        // BootCamp Users all code Here 
        //--------------------------------------------------------------
        app.get('/registrations', async (req, res) => {
            const query = {};
            const cursor = bootCamp_Registration_Collection.find(query);
            const registrations = await cursor.toArray();
            res.send(registrations);
        })



        // --------------------------------------------------------------
        // users all code Here 
        //--------------------------------------------------------------

        // Get all users
        app.get('/users', async (req, res) => {
            const users = await userCollection_BootCamp.find({}).toArray();
            res.send(users);
        });

        // Get user by email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection_BootCamp.findOne({ email });
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.send(user);
        });


        //-------------------------------------------------------------------------------
        // BootCamps all function works here \
        // Create a new camp
        //-----------------------------------------------------------------------

        app.get('/camps', async (req, res) => {
            const query = {};
            const cursor = collection_BootCamp.find(query);
            const camps = await cursor.toArray();
            res.send(camps);
        });

        // Find a single camp by id
        app.get('/camps/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const camp = await collection_BootCamp.findOne({ _id: new ObjectId(id) });
                if (!camp) {
                    return res.status(404).send({ message: 'Camp not found' });
                }
                res.send(camp);
            } catch (error) {
                res.status(400).send({ message: 'Invalid ID format' });
            }
        });


        // feedBack store to the base and that show also 
        app.post('/feedbacks', async (req, res) => {
            const feedback = req.body;
            const result = await feedBack_Collection.insertOne(feedback);
            res.send(result);
        });
        app.get('/feedbacks', async (req, res) => {
            const query = {};
            const cursor = feedBack_Collection.find(query);
            const feedbacks = await cursor.toArray();
            res.send(feedbacks);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send(
        `<html>
      <head>
        <title>Bootcamp Server</title>
        <style>
          body {
            background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
            height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Arial, sans-serif;
          }
          .container {
            background: #fff;
            padding: 40px 60px;
            border-radius: 18px;
            box-shadow: 0 8px 32px rgba(60, 72, 88, 0.15);
            text-align: center;
          }
          h1 {
            color: #4f46e5;
            margin-bottom: 16px;
            font-size: 2.5rem;
            letter-spacing: 1px;
          }
          p {
            color: #374151;
            font-size: 1.1rem;
            margin: 10px 0;
          }

        </style>
      </head>
      <body>
        <div class="container">
          <h1>BootCamp is Always Ready for Users!</h1>
          <p><strong>BootCamp Server Running</strong></p>
          <p>This is a delivery server. Here, users can add and update tasks, and create accounts.</p>
        </div>
      </body>
    </html>`
    )
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})