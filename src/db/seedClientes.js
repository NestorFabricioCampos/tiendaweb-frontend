require('dotenv').config();
const connectDB = require('./init');
const Cliente = require('../models/Cliente');

const clientes = [
  {
    nombre: 'Ana',
    apellido: 'García',
    email: 'ana.garcia@example.com',
    telefono: '3001234567',
    direccion: 'Calle 10 # 15-20',
    ciudad: 'Bogotá',
    documento: '1012345678',
    fechaNacimiento: '1992-04-18T00:00:00.000Z',
    activo: true
  },
  {
    nombre: 'Carlos',
    apellido: 'Martínez',
    email: 'carlos.martinez@example.com',
    telefono: '3012345678',
    direccion: 'Carrera 8 # 25-10',
    ciudad: 'Medellín',
    documento: '1023456789',
    fechaNacimiento: '1988-09-12T00:00:00.000Z',
    activo: true
  },
  {
    nombre: 'Laura',
    apellido: 'Pérez',
    email: 'laura.perez@example.com',
    telefono: '3023456789',
    direccion: 'Avenida 7 # 30-50',
    ciudad: 'Cali',
    documento: '1034567890',
    fechaNacimiento: '1995-11-03T00:00:00.000Z',
    activo: true
  },
  {
    nombre: 'Diego',
    apellido: 'Torres',
    email: 'diego.torres@example.com',
    telefono: '3034567890',
    direccion: 'Transversal 12 # 44-88',
    ciudad: 'Barranquilla',
    documento: '1045678901',
    fechaNacimiento: '1987-02-22T00:00:00.000Z',
    activo: true
  },
  {
    nombre: 'María',
    apellido: 'López',
    email: 'maria.lopez@example.com',
    telefono: '3045678901',
    direccion: 'Diagonal 14 # 18-40',
    ciudad: 'Cartagena',
    documento: '1056789012',
    fechaNacimiento: '1991-07-09T00:00:00.000Z',
    activo: true
  },
  {
    nombre: 'Javier',
    apellido: 'Ramírez',
    email: 'javier.ramirez@example.com',
    telefono: '3056789012',
    direccion: 'Calle 22 # 66-15',
    ciudad: 'Bucaramanga',
    documento: '1067890123',
    fechaNacimiento: '1985-12-15T00:00:00.000Z',
    activo: true
  },
  {
    nombre: 'Sofía',
    apellido: 'Hernández',
    email: 'sofia.hernandez@example.com',
    telefono: '3067890123',
    direccion: 'Cra 50 # 80-30',
    ciudad: 'Pereira',
    documento: '1078901234',
    fechaNacimiento: '1993-05-21T00:00:00.000Z',
    activo: true
  },
  {
    nombre: 'Andrés',
    apellido: 'Sánchez',
    email: 'andres.sanchez@example.com',
    telefono: '3078901234',
    direccion: 'Calle 5 # 35-90',
    ciudad: 'Manizales',
    documento: '1089012345',
    fechaNacimiento: '1989-08-05T00:00:00.000Z',
    activo: true
  },
  {
    nombre: 'Valentina',
    apellido: 'Castro',
    email: 'valentina.castro@example.com',
    telefono: '3089012345',
    direccion: 'Avenida 11 # 12-44',
    ciudad: 'Ibagué',
    documento: '1090123456',
    fechaNacimiento: '1996-03-17T00:00:00.000Z',
    activo: true
  },
  {
    nombre: 'Mateo',
    apellido: 'Ruiz',
    email: 'mateo.ruiz@example.com',
    telefono: '3090123456',
    direccion: 'Carrera 15 # 67-12',
    ciudad: 'Tunja',
    documento: '1101234567',
    fechaNacimiento: '1990-10-30T00:00:00.000Z',
    activo: true
  }
];

connectDB()
  .then(async () => {
    try {
      const resultado = await Cliente.insertMany(clientes);
      console.log(`Se insertaron ${resultado.length} clientes de ejemplo.`);
      process.exit(0);
    } catch (error) {
      console.error('Error al insertar clientes:', error.message);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Error de conexión:', error.message);
    process.exit(1);
  });
