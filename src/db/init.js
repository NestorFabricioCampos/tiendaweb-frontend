const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tiendaweb';

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(MONGO_URI);
    const colecciones = await connection.connection.db.listCollections({ name: 'pedidos' }).toArray();

    if (colecciones.length === 0) {
      await connection.connection.db.createCollection('pedidos');
    }

    console.log('MongoDB conectado correctamente');
    console.log('Colección pedidos disponible en la base tiendaweb');
  } catch (error) {
    console.error('Error al conectar MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
