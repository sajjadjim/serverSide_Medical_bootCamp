const { getDB } = require("../config/db");

// GET all camps
const getAllCamps = async (_req, res) => {
  try {
    const db = getDB()
    const camps = await db.collection('camps').find({}).toArray();
    res.json(camps);
  } catch (error) {
    console.error("Error fetching camps:", error);
    res.status(500).json({ message: "Failed to fetch camps" });
  }
};

        const getCampByID = async (req, res) => {
        const id = req.params.id;
        try {
            const db = getDB();
            const camp = await db.collection('camps').findOne({ _id: new ObjectId(id) });
            if (!camp) {
                return res.status(404).json({ message: "Camp not found" });
            }
            res.json(camp);
        } catch (error) {
            console.error("Error fetching camp by ID:", error);
            res.status(500).json({ message: "Failed to fetch camp" });
        }
    }

// POST new camp
const createCamp = async (req, res) => {
  try {
    const db = getDB();
    const campData = req.body;

    // Basic validation
    if (!campData.name || !campData.description) {
      return res.status(400).json({ message: "Missing name or description" });
    }

    const result = await db.collection('camps').insertOne(campData);
    res.status(201).json({ message: "Camp created", id: result.insertedId });
  } catch (error) {
    console.error("Error creating camp:", error);
    res.status(500).json({ message: "Failed to create camp" });
  }
};

module.exports = {
  getAllCamps,
  createCamp,
  getCampByID
};
