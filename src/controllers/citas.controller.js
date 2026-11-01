// Lógica de cada endpoint de citas
const { Op } = require('sequelize');
const Cita = require('../models/Cita');

const ESPECIALIDADES = ['medicina_general', 'pediatria', 'odontologia', 'ginecologia', 'cardiologia'];
const ESTADOS = ['pendiente', 'confirmada', 'atendida', 'cancelada'];

// Horario de atención de la clínica (para calcular disponibilidad)
const HORA_APERTURA = '08:00';
const HORA_CIERRE = '17:00';
const INTERVALO_MINUTOS = 30;

// ---------- Funciones de ayuda ----------
function esFechaValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const d = new Date(fecha + 'T00:00:00Z');
  return !isNaN(d) && d.toISOString().slice(0, 10) === fecha;
}

function aMinutos(hora) {            // "09:30:00" -> 570
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function aHora(minutos) {            // 570 -> "09:30"
  const h = String(Math.floor(minutos / 60)).padStart(2, '0');
  const m = String(minutos % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// ---------- GET /api/citas ----------
const obtenerCitas = async (req, res) => {
  try {
    const { fecha, especialidad, doctor, estado, paciente_identidad } = req.query;
    const where = {};

    if (fecha) {
      if (!esFechaValida(fecha)) {
        return res.status(400).json({ mensaje: 'Formato de fecha inválido. Use YYYY-MM-DD' });
      }
      where.fecha_cita = fecha;
    }
    if (especialidad) {
      if (!ESPECIALIDADES.includes(especialidad)) {
        return res.status(400).json({ mensaje: 'Especialidad no válida', valores_permitidos: ESPECIALIDADES });
      }
      where.especialidad = especialidad;
    }
    if (estado) {
      if (!ESTADOS.includes(estado)) {
        return res.status(400).json({ mensaje: 'Estado no válido', valores_permitidos: ESTADOS });
      }
      where.estado = estado;
    }
    if (doctor) where.doctor = { [Op.like]: `%${doctor}%` }; // búsqueda parcial
    if (paciente_identidad) where.paciente_identidad = paciente_identidad;

    const citas = await Cita.findAll({
      where,
      order: [['fecha_cita', 'ASC'], ['hora_cita', 'ASC']]
    });

    res.json({ total: citas.length, citas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las citas', error: error.message });
  }
};

// ---------- GET /api/citas/:id ----------
const obtenerCitaPorId = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id);
    if (!cita) {
      return res.status(404).json({ mensaje: `No existe una cita con id ${req.params.id}` });
    }
    res.json(cita);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la cita', error: error.message });
  }
};

// ---------- GET /api/citas/disponibilidad/:fecha ----------
const obtenerDisponibilidad = async (req, res) => {
  try {
    const { fecha } = req.params;
    if (!esFechaValida(fecha)) {
      return res.status(400).json({ mensaje: 'Formato de fecha inválido. Use YYYY-MM-DD' });
    }

    // Opcional: ?doctor=... o ?especialidad=... para ver disponibilidad de uno solo
    const where = { fecha_cita: fecha, estado: { [Op.ne]: 'cancelada' } };
    if (req.query.doctor) where.doctor = { [Op.like]: `%${req.query.doctor}%` };
    if (req.query.especialidad) where.especialidad = req.query.especialidad;

    const citas = await Cita.findAll({ where, order: [['hora_cita', 'ASC']] });

    const horarios_ocupados = citas.map(c => {
      const inicio = aMinutos(c.hora_cita);
      return {
        id: c.id,
        hora_inicio: aHora(inicio),
        hora_fin: aHora(inicio + c.duracion_minutos),
        doctor: c.doctor,
        especialidad: c.especialidad,
        estado: c.estado
      };
    });

    // Recorremos el horario de la clínica en bloques de 30 min
    // y sugerimos los bloques que no chocan con ninguna cita.
    const horarios_disponibles = [];
    for (let t = aMinutos(HORA_APERTURA); t + INTERVALO_MINUTOS <= aMinutos(HORA_CIERRE); t += INTERVALO_MINUTOS) {
      const choca = citas.some(c => {
        const ini = aMinutos(c.hora_cita);
        const fin = ini + c.duracion_minutos;
        return t < fin && t + INTERVALO_MINUTOS > ini;
      });
      if (!choca) horarios_disponibles.push(aHora(t));
    }

    res.json({
      fecha,
      horario_atencion: `${HORA_APERTURA} - ${HORA_CIERRE}`,
      total_ocupados: horarios_ocupados.length,
      horarios_ocupados,
      total_disponibles: horarios_disponibles.length,
      horarios_disponibles
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar disponibilidad', error: error.message });
  }
};

// ---------- DELETE /api/citas/:id (soft delete) ----------
const cancelarCita = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id);
    if (!cita) {
      return res.status(404).json({ mensaje: `No existe una cita con id ${req.params.id}` });
    }
    if (cita.estado !== 'pendiente') {
      return res.status(400).json({
        mensaje: `Solo se pueden cancelar citas en estado 'pendiente'. Esta cita está '${cita.estado}'`
      });
    }

    cita.estado = 'cancelada'; // no se borra el registro, solo cambia el estado
    await cita.save();

    res.json({ mensaje: 'Cita cancelada correctamente', cita });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cancelar la cita', error: error.message });
  }
};

module.exports = { obtenerCitas, obtenerCitaPorId, obtenerDisponibilidad, cancelarCita };
