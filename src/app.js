const express = require('express');
const cors = require('cors');
const articulosRoutes = require('./routes/articulosRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const connectDB = require('./db/init');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API de tienda web activa',
    endpoints: ['/api/articulos', '/api/clientes']
  });
});

app.use('/api/articulos', articulosRoutes);
app.use('/api/clientes', clientesRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: err.message
  });
});

module.exports = app;
