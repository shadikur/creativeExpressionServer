require("dotenv").config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



// Routes




// Listen
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});