import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';

// Routes
import authRoutes from './routes/auth.js';
import restaurantsRoutes from './routes/restaurants.js';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Iniciando servidor...');

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Estado de la conexión
let dbConnected = false;

// Conectar a la base de datos
const initializeDB = async () => {
  try {
    await connectDB();
    dbConnected = true;
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando base de datos:', error.message);
    dbConnected = false;
  }
};

console.log('Cargando rutas...');

// Ruta de prueba básica
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend de MenUCA funcionando!',
    database: dbConnected ? 'Conectado' : 'Desconectado',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba específica para restaurantes
app.get('/api/restaurants-test', (req, res) => {
  res.json({ 
    message: 'Ruta de restaurantes funcionando',
    timestamp: new Date().toISOString()
  });
});

// Cargar rutas modularizadas
app.use('/api/auth', authRoutes);
console.log('Ruta /api/auth cargada');

app.use('/api/restaurants', restaurantsRoutes);
console.log('Ruta /api/restaurants cargada');

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Inicializar la aplicación
const startServer = async () => {
  console.log('Inicializando servidor...');
  
  await initializeDB();
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`Estado BD: ${dbConnected ? 'Conectado' : 'Desconectado'}`);
  });
};

startServer().catch(error => {
  console.error('Error fatal iniciando servidor:', error);
  process.exit(1);
});