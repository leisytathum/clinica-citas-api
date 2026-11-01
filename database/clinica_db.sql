-- =============================================
-- Base de datos: clinica_db
-- Sistema de Reservas de Citas Médicas
-- =============================================
 
CREATE DATABASE IF NOT EXISTS clinica_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
 
USE clinica_db;
SET NAMES utf8mb4;
 
DROP TABLE IF EXISTS citas;
 
CREATE TABLE citas (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  paciente_nombre    VARCHAR(100) NOT NULL,
  paciente_identidad VARCHAR(20)  NOT NULL,
  paciente_telefono  VARCHAR(15)  NOT NULL,
  paciente_email     VARCHAR(100) NULL,
  especialidad       ENUM('medicina_general','pediatria','odontologia','ginecologia','cardiologia') NOT NULL,
  doctor             VARCHAR(100) NOT NULL,
  fecha_cita         DATE         NOT NULL,
  hora_cita          TIME         NOT NULL,
  duracion_minutos   INT          NOT NULL DEFAULT 30,
  motivo_consulta    TEXT         NOT NULL,
  estado             ENUM('pendiente','confirmada','atendida','cancelada') NOT NULL DEFAULT 'pendiente',
  costo_consulta     DECIMAL(8,2) NOT NULL,
  forma_pago         ENUM('efectivo','tarjeta','transferencia','seguro') NULL,
  observaciones      TEXT         NULL,
  createdAt          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_costo_positivo CHECK (costo_consulta > 0)
);
-- Nota: fecha_registro es un campo VIRTUAL de Sequelize (alias de createdAt),
-- por eso no aparece como columna en la tabla.
 
-- =============================================
-- Datos de prueba
-- =============================================
INSERT INTO citas
(paciente_nombre, paciente_identidad, paciente_telefono, paciente_email, especialidad, doctor, fecha_cita, hora_cita, duracion_minutos, motivo_consulta, estado, costo_consulta, forma_pago, observaciones)
VALUES
('María López',     '0801-1990-12345', '9876-5432', 'maria@correo.com',  'medicina_general', 'Dr. Carlos Mejía',  '2026-11-15', '08:00:00', 30, 'Chequeo general',            'pendiente',  500.00, 'efectivo',      NULL),
('José Martínez',   '0801-1985-54321', '9988-7766', NULL,                'cardiologia',      'Dra. Ana Rivera',   '2026-11-15', '09:00:00', 60, 'Dolor en el pecho',          'confirmada', 1200.00, 'tarjeta',      'Traer electrocardiograma'),
('Lucía Fernández', '0501-2015-11111', '3344-5566', 'lucia@correo.com',  'pediatria',        'Dr. Pedro Castro',  '2026-11-15', '10:30:00', 30, 'Control de vacunas',         'pendiente',  600.00, 'seguro',        'Paciente menor de edad'),
('María López',     '0801-1990-12345', '9876-5432', 'maria@correo.com',  'odontologia',      'Dra. Sofía Reyes',  '2026-11-16', '14:00:00', 45, 'Limpieza dental',            'pendiente',  800.00, 'transferencia', NULL),
('Carlos Pineda',   '0101-1978-22222', '9123-4567', 'carlos@correo.com', 'ginecologia',      'Dra. Laura Gómez',  '2026-11-16', '11:00:00', 30, 'Consulta de rutina',         'atendida',   900.00, 'efectivo',      NULL),
('Andrea Torres',   '0801-2000-33333', '9555-1212', NULL,                'medicina_general', 'Dr. Carlos Mejía',  '2026-11-15', '15:00:00', 30, 'Fiebre y dolor de cabeza',   'cancelada',  500.00, NULL,            'Canceló por teléfono');
 