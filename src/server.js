// Punto de entrada de la aplicación
require('dotenv').config({ quiet: true });
const express = require('express');
const sequelize = require('./config/database');
const citasRoutes = require('./routes/citas.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Citas Médicas funcionando' });
});

app.use('/api/citas', citasRoutes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a MySQL (clinica_db)');
    await sequelize.sync(); // crea la tabla si no existe (no borra datos)
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
  }
}

iniciar();
