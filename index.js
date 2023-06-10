require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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


// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@creativeexpressions.w7kftro.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// MongoDB Collection
const appDB = client.db(process.env.DB_NAME);
const users = appDB.collection("users");
const events = appDB.collection("events");
const classes = appDB.collection("classes");
const payments = appDB.collection("payments");

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // create user to users collection
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await users.insertOne(newUser);
            console.log(result);
            res.json(result);
        });

        app.get('/users', async (req, res) => {
            const cursor = users.find({});
            const result = await cursor.toArray();
            res.json(result);
        });



    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);




// Routes
app.get('/', (req, res) => {
    res.send({ 'status': 'API Server is running' });
});

app.get('/jwt-test', verifyJWT, (req, res) => {
    res.send({ 'status': 'API Server is running' });
});

// JWT Token
app.post('/jwt', (req, res) => {
    const { email } = req.body;
    const accessToken = jwt.sign({ id: email }, process.env.JWT_SECRET, { expiresIn: 300 });
    res.json({ auth: true, accessToken: accessToken });
});


// Listen
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});