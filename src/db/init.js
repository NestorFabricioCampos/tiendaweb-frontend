const mongoose = require('mongoose');

// Cargar variables de entorno si estás en desarrollo local (asegúrate de tener instalado 'dotenv')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  // Validación temprana para evitar caer en localhost por descuido en producción
  if (!MONGO_URI) {
    console.error('CRÍTICO: La variable de entorno MONGO_URI no está definida.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    
    // Acceso directo a la base de datos nativa desde la conexión global de mongoose
    const db = mongoose.connection.db;
    const colecciones = await db.listCollections({ name: 'pedidos' }).toArray();

    if (colecciones.length === 0) {
      await db.createCollection('pedidos');
      console.log('Colección "pedidos" creada correctamente.');
    }

    console.log(`MongoDB conectado correctamente a: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error al conectar MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;