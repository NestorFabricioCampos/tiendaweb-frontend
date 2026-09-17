const express = require('express');
const articulosRoutes = require('./routes/articulosRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');
const empleadosRoutes = require('./routes/empleadosRoutes');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./db/init');
const {
  corsOptions,
  apiLimiter,
  writeLimiter,
  helmetMiddleware,
  mongoSanitizeMiddleware
} = require('./middleware/security');

connectDB();

const app = express();

app.disable('x-powered-by');
app.use(helmetMiddleware);
app.use(require('cors')(corsOptions));
app.use(express.json({ limit: '100kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '100kb', parameterLimit: 100 }));
app.use(mongoSanitizeMiddleware);
app.use('/api', apiLimiter);
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) return writeLimiter(req, res, next);
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'API de tienda web activa',
    endpoints: ['/api/auth/login', '/api/articulos', '/api/clientes', '/api/pedidos', '/api/empleados']
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/articulos', articulosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/empleados', empleadosRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'La solicitud es demasiado grande' });
  }

  if (err instanceof SyntaxError && err.status === 400 && err.body) {
    return res.status(400).json({ message: 'El cuerpo JSON no es válido' });
  }

  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ message: 'Origen no permitido' });
  }

  res.status(err.statusCode || 500).json({
    message: err.statusCode ? err.message : 'Error interno del servidor'
  });
});

const cors = require('cors')

module.exports = app;
