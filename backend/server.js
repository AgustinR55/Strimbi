const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
require('./jobs/inactivityJob'); // Inicia el cron job


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/actions', require('./routes/actions'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Conectado'))
  .catch(err => console.log(err));

app.listen(process.env.PORT, () => console.log(`Servidor corriendo en puerto ${process.env.PORT}`));