// Seating Service
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());

// Database connection
const sequelize = new Sequelize('seating_db', 'app_user', 'StrongP@ssw0rd!', {
  host: 'seating-db',   // Must match service name in docker-compose
  dialect: 'mssql',
  logging: false,
});

// Seat model
const Seat = sequelize.define('Seat', {
  seat_id: { type: DataTypes.INTEGER, primaryKey: true },
  event_id: { type: DataTypes.INTEGER, allowNull: false },
  section: { type: DataTypes.STRING, allowNull: false },
  row: { type: DataTypes.STRING, allowNull: false },
  seat_number: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'AVAILABLE' },
}, {
  timestamps: false,
  tableName: 'Seats'
});

// ========================
// ======= ENDPOINTS ======
// ========================

// 1️⃣ Get all seats for a specific event
app.get('/v1/seats', async (req, res) => {
  const { eventId } = req.query;
  if (!eventId) return res.status(400).json({ error: 'eventId is required' });

  try {
    const seats = await Seat.findAll({ where: { event_id: eventId } });
    res.json(seats);
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2️⃣ Reserve seats
app.post('/v1/seats/reserve', async (req, res) => {
  const { seatIds } = req.body;
  if (!seatIds || !Array.isArray(seatIds)) {
    return res.status(400).json({ error: 'seatIds must be an array' });
  }

  try {
    const availableSeats = await Seat.findAll({
      where: { seat_id: seatIds, status: 'AVAILABLE' }
    });

    if (availableSeats.length !== seatIds.length) {
      return res.status(400).json({ error: 'Some seats are not available' });
    }

    await Seat.update({ status: 'RESERVED' }, { where: { seat_id: seatIds } });
    res.json({
      message: 'Seats reserved successfully',
      seats: availableSeats
    });
  } catch (error) {
    console.error('Error reserving seats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3️⃣ Release seats (used when payment fails or order canceled)
app.post('/v1/seats/release', async (req, res) => {
  const { seatIds } = req.body;
  if (!seatIds || !Array.isArray(seatIds)) {
    return res.status(400).json({ error: 'seatIds must be an array' });
  }

  try {
    await Seat.update({ status: 'AVAILABLE' }, { where: { seat_id: seatIds } });
    res.json({ message: 'Seats released successfully' });
  } catch (error) {
    console.error('Error releasing seats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4️⃣ Allocate seats (used when order confirmed)
app.post('/v1/seats/allocate', async (req, res) => {
  const { seatIds } = req.body;
  if (!seatIds || !Array.isArray(seatIds)) {
    return res.status(400).json({ error: 'seatIds must be an array' });
  }

  try {
    await Seat.update({ status: 'ALLOCATED' }, { where: { seat_id: seatIds } });
    res.json({ message: 'Seats allocated successfully' });
  } catch (error) {
    console.error('Error allocating seats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =============================
// ======= START SERVICE =======
// =============================
sequelize.sync().then(() => {
  app.listen(3002, () => console.log('🎟️ Seating Service running on port 3002'));
}).catch((err) => {
  console.error('❌ Database connection error:', err);
});
