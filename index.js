const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use('/users', require('./routers/user.routes'));
app.use('/camps', require('./routers/camp.routes'));

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Bootcamp Server</title></head>
      <body><h1>Bootcamp Server Running!</h1></body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
