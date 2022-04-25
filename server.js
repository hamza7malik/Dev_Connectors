const express = require ('express');

app = express();

app.get('/', (req,res) => res.send('API up and Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server Started on Port ' + PORT));