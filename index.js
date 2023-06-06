require("dotenv").config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Verify JWT Token
const verifyJWT = (req, res, next) => {
    const token = req.headers["authorization"];
    const accessToken = token && token.split(" ")[1];
    if (!accessToken) {
        res.status(401).send({ auth: false, message: "Unauthorized Access" });
    } else {
        jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(403).json({ auth: false, message: "Access Forbidden!" });
            } else {
                req.userId = decoded.id;
                next();
            }
        });
    }
};



// Routes
app.get('/', (req, res) => {
    res.send({ 'status': 'API Server is running' });
});




// Listen
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});