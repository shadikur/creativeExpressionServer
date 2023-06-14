require("dotenv").config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
const categories = appDB.collection("categories");
const classes = appDB.collection("classes");
const payments = appDB.collection("payments");

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a ssccessful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // create user to users collection
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await users.insertOne(newUser);
            console.log(result);
            res.json(result);
        });

        // get all users from users collection
        app.get('/users', async (req, res) => {
            const cursor = users.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

        // Delete user by id
        app.delete('/deleteuser/:id', async (req, res) => {
            const userId = req.params.id;
            console.log((userId));
            try {
                const result = await users.deleteOne({ _id: new ObjectId(userId) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'User not found' });
                }
                res.json({ message: 'User deleted successfully' });
                console.log('Deleted user with id:', userId);
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        });

        // update user role by id
        // Update user's role in users collection
        app.put('/updaterole/:id', async (req, res) => {
            const userId = req.params.id;
            const { role } = req.body;

            try {
                const result = await users.updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: { role } }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: 'User not found' });
                }
                res.json({ message: 'User role updated successfully' });
            } catch (error) {
                console.error('Error updating user role:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });

        // Get user by email
        app.get('/users/:email', async (req, res) => {
            const userEmail = req.params.email;
            console.log(userEmail);
            const cursor = users.find({ email: userEmail });
            const result = await cursor.toArray();
            res.json(result);
        });

        // Add category to categories collection
        app.post('/categories', async (req, res) => {
            const newCategory = req.body;
            const result = await categories.insertOne(newCategory);
            console.log(result);
            res.json(result);
        });

        // get all categories from categories collection
        app.get('/categories', async (req, res) => {
            const cursor = categories.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

        // delete category by id
        app.delete('/categories/:id', async (req, res) => {
            const categoryId = req.params.id;
            console.log((categoryId));
            try {
                const result = await categories.deleteOne({ _id: new ObjectId(categoryId) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Category not found' });
                }
                res.json({ message: 'Category deleted successfully' });
                console.log('Deleted category with id:', categoryId);
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        });

        // update category name, description, image by id
        app.put('/categories/:id', async (req, res) => {
            const categoryId = req.params.id;
            const { name, description, image } = req.body;

            try {
                const result = await categories.updateOne(
                    { _id: new ObjectId(categoryId) },
                    { $set: { name, description, image } }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: 'Category not found' });
                }
                res.json({ message: 'Category updated successfully' });
            }
            catch (error) {
                console.error('Error updating category:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });

        // Update deny / approve status in classes collection
        app.put('/classstatus/:id', async (req, res) => {
            const classId = req.params.id;
            const { status } = req.body;

            try {
                const result = await classes.updateOne(
                    { _id: new ObjectId(classId) },
                    { $set: { status } }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: 'Class not found' });
                }
                res.json({ message: 'Class status updated successfully' });
            } catch (error) {
                console.error('Error updating class status:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });


        // Add class to classes collection
        app.post('/classes', async (req, res) => {
            const newClass = req.body;
            console.log(newClass);
            const result = await classes.insertOne(newClass);
            console.log(result);
            res.json(result);
        });

        // get all classes from classes collection
        app.get('/classes', async (req, res) => {
            const cursor = classes.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

        // get only approved classes from classes collection
        app.get('/approvedclasses', async (req, res) => {
            const cursor = classes.find({ status: "approved" });
            const result = await cursor.toArray();
            res.json(result);
        });

        // delete class by id
        app.delete('/classes/:id', async (req, res) => {
            const classId = req.params.id;
            console.log((classId));
            try {
                const result = await classes.deleteOne({ _id: new ObjectId(classId) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Class not found' });
                }
                res.json({ message: 'Class deleted successfully' });
                console.log('Deleted class with id:', classId);
            } catch (error) {
                console.error('Error deleting class:', error);
            }
        });

        // Popular 6 classes based on number of enrollments
        app.get('/popularclasses', async (req, res) => {
            const cursor = classes.find({}).sort({ enrollments: -1 }).limit(6);
            const result = await cursor.toArray();
            res.json(result);
        });

        // Popular top 6 instructors based on number of enrollments of their classes
        app.get('/popularinstructors', async (req, res) => {
            const cursor = users.find({ role: "Instructor" }).sort({ enrollments: -1 }).limit(6);
            const result = await cursor.toArray();
            res.json(result);
        });

        // Add event to events collection
        app.post('/events', async (req, res) => {
            const newEvent = req.body;
            console.log(newEvent);
            const result = await events.insertOne(newEvent);
            console.log(result);
            res.json(result);
        });

        // get all events from events collection
        app.get('/events', async (req, res) => {
            const cursor = events.find({});
            const result = await cursor.toArray();
            res.json(result);
        });


        // stripe payment
        app.post('/create-checkout-session', async (req, res) => {
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                        price: '{{PRICE_ID}}',
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${YOUR_DOMAIN}?success=true`,
                cancel_url: `${YOUR_DOMAIN}?canceled=true`,
            });

            res.redirect(303, session.url);
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
app.post('/auth', (req, res) => {
    const { email } = req.body;
    const accessToken = jwt.sign({ id: email }, process.env.JWT_SECRET, { expiresIn: 300 });
    res.json({ auth: true, accessToken: accessToken });
});


// Listen
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});