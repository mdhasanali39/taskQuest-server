import express from 'express';
import cors from 'cors'
import 'dotenv/config'

const app = express();
const port = process.env.PORT || 5000;

// test api end point 
app.get('/', (req,res)=>{
    res.send('taskQuest server running well')
})

app.listen(port, ()=>{
    console.log(`taskQuest server running on port ${port}`)
})