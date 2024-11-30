const express = require("express");

const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

// middle ware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("server running");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.SERVER}:${process.env.PASS}@cluster0.ekjpf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const database = client.db("shohel");
const tanvir = database.collection("tanvir");

const userDatabase = client.db("shohel");
const userCollection = userDatabase.collection("authentication");
async function run() {
  try {
    await client.connect();

    app.get("/", (req, res) => {
      res.send("server running");
    });

    app.get("/coffees", async (req, res) => {
      const filter = await tanvir.find();
      const result = await filter.toArray();
      res.send(result);
    });

    app.get("/coffees/:id", async (req, res) => {
      const { id } = req.params;

      // Validate the ObjectId format
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid ID format" });
      }

      try {
        const query = { _id: new ObjectId(id) };
        const result = await tanvir.findOne(query);

        if (!result) {
          return res.status(404).send({ error: "Coffee not found" });
        }

        res.send(result);
      } catch (error) {
        console.error("Error fetching coffee by ID:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateOne = {
        $set: req.body,
      };
      const result = await tanvir.updateOne(query, updateOne, options);
      res.send(result);
    });

    app.post("/coffee", async (req, res) => {
      const id = req.body;
      const result = await tanvir.insertOne(id);
      // console.log("insert succcesfully", result)
      res.send(result);
    });

    app.delete("/coffees/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await tanvir.deleteOne(query);
      res.send(result);
    });


    

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(port);
});
