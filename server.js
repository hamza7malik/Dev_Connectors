const express = require ('express');
const connectDB = require('./config/db');

app = express();

//connectDB
connectDB();

//init Middleware (body parser)
app.use(express.json({ extended:false }));

app.get('/', (req,res) => res.send('API up and Running'));

//Define routes

app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server Started on Port ' + PORT));