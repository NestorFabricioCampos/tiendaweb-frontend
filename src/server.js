require('dotenv').config();
const app = require('./app');

const preferredPort = Number.parseInt(process.env.PORT, 10) || 3000;
const portsToTry = Array.from(
  new Set([
    preferredPort,
    3000,
    3001,
    4000,
    4001,
    5000,
    5001,
    7000,
    8000,
    8080
  ])
);

const startServer = (index = 0) => {
  const port = portsToTry[index];

  const server = app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${server.address().port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && index < portsToTry.length - 1) {
      console.warn(`Puerto ${port} ocupado. Probando ${portsToTry[index + 1]}...`);
      server.close();
      startServer(index + 1);
      return;
    }

    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  });
};

startServer();
