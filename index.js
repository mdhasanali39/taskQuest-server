import express from 'express';
import cors from 'cors'
import 'dotenv/config'
import { MongoClient, ServerApiVersion } from 'mongodb';


const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors())
app.use(express.json())


// mongodb uri string 
const uri = process.env.MONGODB_URI_STRING;

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

    const taskCollection = client.db("taskQuestDB").collection("tasks");

    // get methods / api end points 
    
    // post methods / api end points 
    app.post("/task-quest/create-task/:email", async(req,res)=>{
        try {
            const userEmail = req.params.email;
            const taskInfo = req.body;
            const acknowledge = await taskCollection.insertOne(taskInfo)
            res.status(201).json({
                status:true,
                message:'Task inserted successfully',
                acknowledge
            })
        } catch (err) {
            res.status(500).json({
                status:false,
                message:'Internal server error', err,
            })
        }

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// test api end point 
app.get('/', (req,res)=>{
    res.send('taskQuest server running well')
})

app.listen(port, ()=>{
    console.log(`taskQuest server running on port ${port}`)
})