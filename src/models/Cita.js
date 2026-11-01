// Modelo Cita: representa la tabla "citas"
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cita = sequelize.define('Cita', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  paciente_nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  paciente_identidad: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  paciente_telefono: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  paciente_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: { isEmail: true }
  },
  especialidad: {
    type: DataTypes.ENUM('medicina_general', 'pediatria', 'odontologia', 'ginecologia', 'cardiologia'),
    allowNull: false
  },
  doctor: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fecha_cita: {
    type: DataTypes.DATEONLY, // DATE en MySQL (solo fecha)
    allowNull: false
  },
  hora_cita: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duracion_minutos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30
  },
  motivo_consulta: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'atendida', 'cancelada'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  costo_consulta: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      mayorQueCero(valor) {
        if (Number(valor) <= 0) throw new Error('costo_consulta debe ser mayor que 0');
      }
    }
  },
  forma_pago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'seguro'),
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Campo VIRTUAL: no existe en la tabla, es un alias de createdAt
  fecha_registro: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('createdAt');
    }
  }
}, {
  tableName: 'citas',
  timestamps: true // crea createdAt y updatedAt automáticamente
});

module.exports = Cita;
