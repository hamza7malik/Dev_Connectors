const express = require ('express');
const connectDB = require('./config/db');

app = express();

//connectDB
connectDB();

app.get('/', (req,res) => res.send('API up and Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server Started on Port ' + PORT));