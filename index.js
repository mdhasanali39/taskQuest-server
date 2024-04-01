import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// mongodb uri string
const uri = process.env.MONGODB_URI_STRING;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const taskCollection = client.db("taskQuestDB").collection("tasks");

    // get methods / api end points

    // get all tasks - user specific
    app.get("/task-quest/get-all/:email", async (req, res) => {
      try {
        const userEmail = req.params.email;
        const { pageSize, currentPage, taskStatus } = req.query;
        const skip = (parseInt(currentPage) - 1) * parseInt(pageSize);
        let todo, ongoing, completed;

        // lets get total task for todo, ongoing, and completed
        const totalTodoTasks = await taskCollection.countDocuments({
          status: "todo",
        });
        const totalOngoingTasks = await taskCollection.countDocuments({
          status: "ongoing",
        });
        const totalCompletedTasks = await taskCollection.countDocuments({
          status: "completed",
        });

        if(taskStatus){
          // get todo tasks
        if (taskStatus === "todo") {
          todo = await taskCollection
            .find({ userEmail: userEmail, status: "todo" })
            .limit(parseInt(pageSize))
            .skip(skip)
            .toArray();
          ongoing = await taskCollection
            .find({ userEmail: userEmail, status: "ongoing" })
            .limit(3)
            .toArray();
          completed = await taskCollection
            .find({ userEmail: userEmail, status: "completed" })
            .limit(3)
            .toArray();
         return res.status(200).json({
            status: true,
            message: "Tasks gotten successfully",
            tasks: {
              todo,
              ongoing,
              completed,
              totalTodoTasks,
              totalOngoingTasks,
              totalCompletedTasks,
            },
          });
        }

        // get ongoing tasks
        if (taskStatus === "ongoing") {
          ongoing = await taskCollection
            .find({ userEmail: userEmail, status: "ongoing" })
            .limit(parseInt(pageSize))
            .skip(skip)
            .toArray();
          todo = await taskCollection
            .find({ userEmail: userEmail, status: "todo" })
            .limit(3)
            .toArray();
          completed = await taskCollection
            .find({ userEmail: userEmail, status: "completed" })
            .limit(3)
            .toArray();
         return res.status(200).json({
            status: true,
            message: "Tasks gotten successfully",
            tasks: {
              todo,
              ongoing,
              completed,
              totalTodoTasks,
              totalOngoingTasks,
              totalCompletedTasks,
            },
          });
        }

        // get completed tasks
        if (taskStatus === "completed") {
          completed = await taskCollection
            .find({ userEmail: userEmail, status: "completed" })
            .limit(parseInt(pageSize))
            .skip(skip)
            .toArray();
          todo = await taskCollection
            .find({ userEmail: userEmail, status: "todo" })
            .limit(3)
            .toArray();
          ongoing = await taskCollection
            .find({ userEmail: userEmail, status: "ongoing" })
            .limit(3)
            .toArray();
           return res.status(200).json({
              status: true,
              message: "Tasks gotten successfully",
              tasks: {
                todo,
                ongoing,
                completed,
                totalTodoTasks,
                totalOngoingTasks,
                totalCompletedTasks,
              },
            });
        }

        // if taskStatus === ''
        if(taskStatus === 'all'){
          todo = await taskCollection
            .find({ userEmail: userEmail, status: "todo" })
            .limit(3)
            .toArray();
            ongoing = await taskCollection
            .find({ userEmail: userEmail, status: "ongoing" })
            .limit(3)
            .toArray();
            completed = await taskCollection
            .find({ userEmail: userEmail, status: "completed" })
            .limit(3)
            .toArray();
            res.status(200).json({
              status: true,
              message: "Tasks gotten successfully",
              tasks: {
                todo,
                ongoing,
                completed,
                totalTodoTasks,
                totalOngoingTasks,
                totalCompletedTasks,
              },
            });
        }
        }

      } catch (err) {
        res.status(500).json({
          status: false,
          message: `Internal server error ${err.message}`,
        });
      }
    });

    // post methods / api end points
    app.post("/task-quest/create-task", async (req, res) => {
      try {
        const taskInfo = req.body;
        const acknowledge = await taskCollection.insertOne(taskInfo);
        res.status(201).json({
          status: true,
          message: "Task inserted successfully",
          acknowledge,
        });
      } catch (err) {
        res.status(500).json({
          status: false,
          message: `Internal server error ${err.message}`,
        });
      }
    });

    // put, patch, and delete methods / api end points
    // update task
    app.put("/task-quest/update-task/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedTaskInfo = req.body;
        const acknowledge = await taskCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { ...updatedTaskInfo } },
          { upsert: false }
        );
        res.status(201).json({
          status: true,
          message: "Task updated successfully",
          acknowledge,
        });
      } catch (err) {
        res.status(500).json({
          status: false,
          message: `Internal server error ${err.message}`,
        });
      }
    });

    // update task status
    app.patch("/task-quest/update-task-status/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { status } = req.body;
        const acknowledge = await taskCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: status } }
        );
        res.status(201).json({
          status: true,
          message: "Task status updated successfully",
          acknowledge,
        });
      } catch (err) {
        res.status(500).json({
          status: false,
          message: `Internal server error ${err.message}`,
        });
      }
    });
    // delete task
    app.delete("/task-quest/delete-task/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const acknowledge = await taskCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.status(201).json({
          status: true,
          message: "Task deleted successfully",
          acknowledge,
        });
      } catch (err) {
        res.status(500).json({
          status: false,
          message: `Internal server error ${err.message}`,
        });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// test api end point
app.get("/", (req, res) => {
  res.send("taskQuest server running well");
});

app.listen(port, () => {
  console.log(`taskQuest server running on port ${port}`);
});
