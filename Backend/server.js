const express = require('express');
const mongoose = require('mongoose');
const app = express();

const port = 3000

const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI)
.then(()=>console.log('Connected to database!'))
.catch((err)=>console.error('There was a error in connecting the database: ',err));

app.get('/',(req,res)=>{
    res.send("Hello!");
})

app.listen(port,(req,res)=>{
    console.log(`The website is running on http://localhost:${port}`)
})