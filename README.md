# API REST - Sistema de Reservas de Citas Médicas

API REST desarrollada con **Node.js**, **Express**, **MySQL** y **Sequelize ORM** para gestionar las citas de una clínica médica.

## Tecnologías

- Node.js
- Express
- MySQL
- Sequelize (ORM) + mysql2
- dotenv
- nodemon (desarrollo)

## Estructura del proyecto

```
clinica-citas-api/
├── database/
│   └── clinica_db.sql            # Estructura de la BD + datos de prueba
├── postman/
│   └── citas-api.postman_collection.json
├── src/
│   ├── config/database.js        # Conexión a MySQL con Sequelize
│   ├── models/Cita.js            # Modelo de la tabla citas
│   ├── controllers/citas.controller.js
│   ├── routes/citas.routes.js
│   └── server.js                 # Punto de entrada
├── .env.example
├── package.json
└── README.md
```

## Instalación

1. Tener instalado **Node.js** (versión LTS) y **MySQL**.
2. Descomprimir o clonar el proyecto y entrar a la carpeta:
   ```bash
   cd clinica-citas-api
   ```
3. Instalar las dependencias:
   ```bash
   npm install
   ```
4. Crear la base de datos ejecutando el archivo `database/clinica_db.sql` en MySQL Workbench, o desde la terminal:
   ```bash
   mysql -u root -p < database/clinica_db.sql
   ```
   Esto crea la base `clinica_db`, la tabla `citas` y 6 citas de prueba.
5. Copiar `.env.example` como `.env` y poner los datos de tu MySQL.
6. Iniciar el servidor:
   ```bash
   npm run dev     # modo desarrollo (se reinicia solo)
   npm start       # modo normal
   ```
   Si todo está bien verás: `Servidor corriendo en http://localhost:3000`

## Variables de entorno

| Variable      | Descripción                     | Ejemplo        |
|---------------|---------------------------------|----------------|
| `PORT`        | Puerto del servidor             | `3000`         |
| `DB_HOST`     | Host de MySQL                   | `localhost`    |
| `DB_PORT`     | Puerto de MySQL                 | `3306`         |
| `DB_NAME`     | Nombre de la base de datos      | `clinica_db`   |
| `DB_USER`     | Usuario de MySQL                | `root`         |
| `DB_PASSWORD` | Contraseña de MySQL             | `tu_contraseña`|

## Endpoints

URL base: `http://localhost:3000`

| Método | Ruta                                   | Descripción                                   |
|--------|----------------------------------------|-----------------------------------------------|
| GET    | `/api/citas`                           | Lista todas las citas (acepta filtros)        |
| GET    | `/api/citas/:id`                       | Obtiene una cita por ID                       |
| GET    | `/api/citas/disponibilidad/:fecha`     | Horarios ocupados y disponibles de una fecha  |
| DELETE | `/api/citas/:id`                       | Cancela una cita (soft delete)                |

### 1. GET `/api/citas`

Obtiene todas las citas, ordenadas por fecha y hora.

**Filtros opcionales (query params):**

| Parámetro            | Ejemplo                                  |
|----------------------|------------------------------------------|
| `fecha`              | `/api/citas?fecha=2026-11-15`            |
| `especialidad`       | `/api/citas?especialidad=pediatria`      |
| `doctor`             | `/api/citas?doctor=Carlos` (búsqueda parcial) |
| `estado`             | `/api/citas?estado=pendiente`            |
| `paciente_identidad` | `/api/citas?paciente_identidad=0801-1990-12345` |

Se pueden combinar: `/api/citas?fecha=2026-11-15&estado=pendiente`

**Respuesta 200:**
```json
{
  "total": 1,
  "citas": [
    {
      "id": 3,
      "paciente_nombre": "Lucía Fernández",
      "paciente_identidad": "0501-2015-11111",
      "especialidad": "pediatria",
      "doctor": "Dr. Pedro Castro",
      "fecha_cita": "2026-11-15",
      "hora_cita": "10:30:00",
      "estado": "pendiente",
      "costo_consulta": "600.00",
      "...": "..."
    }
  ]
}
```

**Errores:** `400` si la fecha no tiene formato `YYYY-MM-DD`, o si la especialidad/estado no es un valor permitido.

### 2. GET `/api/citas/:id`

Ejemplo: `GET /api/citas/1`

**Respuesta 200:** la cita completa (incluye `fecha_registro`, alias de `createdAt`).

**Respuesta 404:**
```json
{ "mensaje": "No existe una cita con id 999" }
```

### 3. GET `/api/citas/disponibilidad/:fecha`

Muestra los horarios ocupados de esa fecha y sugiere horarios libres. El horario de atención es de **08:00 a 17:00** en bloques de **30 minutos**. Las citas canceladas no ocupan horario.

Ejemplo: `GET /api/citas/disponibilidad/2026-11-15`

**Respuesta 200:**
```json
{
  "fecha": "2026-11-15",
  "horario_atencion": "08:00 - 17:00",
  "total_ocupados": 3,
  "horarios_ocupados": [
    { "id": 1, "hora_inicio": "08:00", "hora_fin": "08:30", "doctor": "Dr. Carlos Mejía", "especialidad": "medicina_general", "estado": "pendiente" }
  ],
  "total_disponibles": 14,
  "horarios_disponibles": ["08:30", "10:00", "11:00", "11:30", "..."]
}
```

Opcional: `?doctor=Carlos` o `?especialidad=pediatria` para ver la disponibilidad de un solo doctor o especialidad.

**Errores:** `400` si la fecha es inválida.

### 4. DELETE `/api/citas/:id`

Cancela una cita. **No la borra**: cambia su estado a `cancelada` (soft delete). Solo se pueden cancelar citas en estado `pendiente`.

Ejemplo: `DELETE /api/citas/3`

**Respuesta 200:**
```json
{
  "mensaje": "Cita cancelada correctamente",
  "cita": { "id": 3, "estado": "cancelada", "...": "..." }
}
```

**Errores:**
- `404` si la cita no existe.
- `400` si la cita no está en estado `pendiente`:
  ```json
  { "mensaje": "Solo se pueden cancelar citas en estado 'pendiente'. Esta cita está 'confirmada'" }
  ```

## Pruebas con Postman

1. Abrir Postman → **Import** → seleccionar `postman/citas-api.postman_collection.json`.
2. Con el servidor corriendo, ejecutar las 17 pruebas en orden (o **Run collection**).
3. Las pruebas de DELETE modifican datos. Para repetirlas desde cero, volver a ejecutar `database/clinica_db.sql`.
