const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Load environment variables from .env file
dotenv.config();
const stripe = require('stripe')(process.env.PAYMENT_GATEWAY_KEY);
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
        // await client.connect();
        const userCollection_BootCamp = client.db("BootCamp").collection("users");
        const collection_BootCamp = client.db("BootCamp").collection("camps");
        const feedBack_Collection = client.db("BootCamp").collection("feedbacks");
        const registration_collection_bootcamp = client.db("BootCamp").collection("registrations");
        const payment_collection_bootCamps = client.db("BootCamp").collection("payments");


        app.post('/registrations', async (req, res) => {
            const registration = req.body;

            try {
                // Insert the registration data
                const result = await registration_collection_bootcamp.insertOne(registration);

                console.log("Camp name  registration :", registration.campName)

                // Update the bootCamp's totalCount by +1 using bootCamp name
                const updateResult = await collection_BootCamp.updateOne(
                    { campName: registration.campName }, // Make sure this field matches in both collections
                    { $inc: { totalCount: 1 } }
                );

                if (updateResult.modifiedCount === 0) {
                    return res.status(404).send({
                        message: 'Registration saved, but bootcamp not found to update count.'
                    });
                }

                res.send({
                    message: 'Registration successful and bootcamp count updated.',
                    registrationResult: result,
                    countUpdateResult: updateResult
                });

            } catch (error) {
                console.error('Registration error:', error);
                res.status(500).send({ message: 'Failed to register user', error: error.message });
            }
        });
        // Get all registrations
        app.get('/registrations', async (req, res) => {
            const query = {};
            const cursor = registration_collection_bootcamp.find(query);
            const registrations = await cursor.toArray();
            res.send(registrations);
        });

        // Get registration by specific ID
        app.get('/registrations/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const registration = await registration_collection_bootcamp.findOne({ _id: new ObjectId(id) });
                if (!registration) {
                    return res.status(404).send({ message: 'Registration not found' });
                }
                res.send(registration);
            } catch (error) {
                res.status(400).send({ message: 'Invalid ID format' });
            }
        });
        //---------------------------------------------------------------------------------------------------------
        // this is the registration for a specific camp here the count how many user registered for a specific camp
        // and how many paid and unpaid the registration bootCamp 
        app.get("/registrations/stats/:campName", async (req, res) => {
            const campName = req.params.campName;
            try {
                const total = await registration_collection_bootcamp.countDocuments({ campName });
                const paid = await registration_collection_bootcamp.countDocuments({
                    campName,
                    payment_status: "paid"
                });

                res.json({
                    campName,
                    totalRegistrations: total,
                    paidRegistrations: paid
                });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Server error" });
            }
        });

        app.get('/registrations/byEmail/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            if (!email) {
                return res.status(400).send({ message: 'Email parameter is required in the URL.' });
            }

            try {
                const registrations = await registration_collection_bootcamp
                    .find({ participantEmail: email })
                    .toArray();

                res.send(registrations);
            } catch (error) {
                res.status(500).send({ message: 'Failed to fetch registrations', error: error.message });
            }
        });

        app.delete('/registrations/:id', async (req, res) => {
            const id = req.params.id;
            // console.log("object" , id)
            try {
                const result = await registration_collection_bootcamp.deleteOne({ _id: new ObjectId(id) });
                res.send(result);
            } catch (err) {
                res.status(500).send({ error: 'Failed to delete registration' });
            }
        });


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
        app.post('/camps', async (req, res) => {
            const camp = req.body;
            try {
                const result = await collection_BootCamp.insertOne(camp);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Failed to add camp', error: error.message });
            }
        });

        app.get('/camps', async (req, res) => {
            const query = {};
            const cursor = collection_BootCamp.find(query);
            const camps = await cursor.toArray();
            res.send(camps);
        });

        // Find a single camp by id
        app.get('/camps/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
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

        // Get camps created by a specific email (created_by field) by Organizer email by
        app.get('/camps/created-by/:email', async (req, res) => {
            const email = req.params.email;
            try {
                const camps = await collection_BootCamp.find({ created_by: email }).toArray();
                res.send(camps);
            } catch (error) {
                res.status(500).send({ message: 'Failed to fetch camps', error: error.message });
            }
        });

        // ✅ Update a camp
        app.put("/camps/update-camp/:id", async (req, res) => {
            const id = req.params.id;
            const updatedCamp = req.body;

            try {
                const result = await collection_BootCamp.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            campName: updatedCamp.campName,
                            image: updatedCamp.image,
                            campFees: updatedCamp.campFees,
                            dateTime: updatedCamp.dateTime,
                            location: updatedCamp.location,
                            healthcareProfessional: updatedCamp.healthcareProfessional,
                            description: updatedCamp.description,
                        },
                    }
                );
                res.send(result);
            } catch (error) {
                console.error("Update error:", error);
                res.status(500).send({ error: "Failed to update camp" });
            }
        });
        // Delete a parcel by ID
        app.delete('/camps/:id', async (req, res) => {
            const id = req.params.id;
            console.log("Deleting camp with ID:", id);
            try {
                const result = await collection_BootCamp.deleteOne({ _id: new ObjectId(id) });
                res.send(result);
            } catch (error) {
                res.status(400).send({ error: 'Invalid ID format' });
            }
        });

        //--------------------------------------------=-----------------====
        // Payment code here
        //---------------------------------------------------------
        //Payment code here 
        //---------------------------------------------------------

        app.get('/payments', async (req, res) => {
            try {
                const userEmail = req.query.email;

                // console.log("Decoded Token Info:", req.decoded);
                // if (req.decoded.email !== userEmail) {
                //   {
                //     return res.status(403).send({ message: 'Forbidden access' });
                //   }
                // }

                const query = userEmail ? { email: userEmail } : {};
                const options = { sort: { paid_at: -1 } }; // Latest first

                const payments = await payment_collection_bootCamps.find(query, options).toArray();
                res.send(payments);
            } catch (error) {
                console.error('Error fetching payment history:', error);
                res.status(500).send({ message: 'Failed to get payments' });
            }
        });


        // app.get('/allPayments', async (req, res) => {
        //     try {
        //         const payments = await payment_collection_bootCamps.find({}).sort({ paid_at: -1 }).toArray();
        //         res.send(payments);
        //     } catch (error) {
        //         console.error('Error fetching all payments:', error);
        //         res.status(500).send({ message: 'Failed to get all payments' });
        //     }
        // });

        // POST: Record payment and update parcel status
        // create a payments collection in MongoDB

        app.post('/payments', async (req, res) => {
            try {
                const { campId, campName, email, amount, paymentMethod, transactionId } = req.body;
                // 1. Update parcel's payment_status
                const updateResult = await registration_collection_bootcamp.updateOne(
                    { _id: ObjectId.createFromHexString(campId) },
                    {
                        $set: {
                            payment_status: 'paid'
                        }
                    }
                );

                if (updateResult.modifiedCount === 0) {
                    return res.status(404).send({ message: 'Parcel not found or already paid' });
                }
                // 2. Insert payment record
                const paymentDoc = {
                    campId,
                    campName,
                    email,
                    amount,
                    paymentMethod,
                    transactionId,
                    paid_at_string: new Date().toISOString(),
                    paid_at: new Date(),
                };
                const paymentResult = await payment_collection_bootCamps.insertOne(paymentDoc);

                res.status(201).send({
                    message: 'Payment recorded and parcel marked as paid',
                    insertedId: paymentResult.insertedId,
                });

            } catch (error) {
                console.error('Payment processing failed:', error);
                res.status(500).send({ message: 'Failed to record payment' });
            }
        });

        // POST: Record payment and update parcel status
        app.post('/create-payment-intent', async (req, res) => {
            const amountInCents = req.body.amountInCents
            console.log(amountInCents, "amountInCents")
            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amountInCents, // Amount in cents
                    currency: 'usd',
                    automatic_payment_methods: { enabled: true },
                });

                res.json({ clientSecret: paymentIntent.client_secret });
            } catch (error) {
                res.status(500).json({ error: error.message });
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