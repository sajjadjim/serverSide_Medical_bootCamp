const { getDB } = require('../config/db');

// GET users
const getAllUsers = async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users').find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST create user
const createUser = async (req, res) => {
  try {
    const db = getDB();
    const userData = req.body;

    // You could validate here
    if (!userData.name || !userData.email) {
      return res.status(400).json({ message: "Missing name or email" });
    }

    const result = await db.collection('users').insertOne(userData);
    res.status(201).json({ message: "User created", id: result.insertedId });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

module.exports = {
  getAllUsers,
  createUser
};
