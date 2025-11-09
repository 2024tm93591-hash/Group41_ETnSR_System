// Seating Service
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());

// Database connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,   // Must match service name in docker-compose
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
  // Remove status field since it's not in seeded data
}, {
  timestamps: false,
  tableName: 'Seats'
});

// Add a virtual status field for API responses
Seat.prototype.getStatus = function() {
  // For now, assume all seats are available unless reserved
  return this.dataValues.reserved ? 'RESERVED' : 'AVAILABLE';
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'seating-service' });
});

// ========================
// ======= ENDPOINTS ======
// ========================

// 1️⃣ Check seat availability for an event
app.get('/v1/seats/availability/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    const seats = await Seat.findAll({ 
      where: { event_id: eventId },
      attributes: ['seat_id', 'section', 'row', 'seat_number', 'price']
    });
    
    const availableSeats = seats.map(seat => ({
      ...seat.dataValues,
      status: 'AVAILABLE'
    }));
    
    res.json({ 
      event_id: eventId, 
      total_seats: availableSeats.length,
      available_seats: availableSeats 
    });
  } catch (error) {
    console.error('Error fetching seat availability:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2️⃣ Get all seats for a specific event
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
      where: { seat_id: seatIds }
    });

    if (availableSeats.length !== seatIds.length) {
      return res.status(400).json({ error: 'Some seats not found' });
    }

    // For now, just return the seats as "reserved"
    // In a real system, you'd update a reservations table
    res.json({
      message: 'Seats reserved successfully',
      seats: availableSeats.map(seat => ({ ...seat.dataValues, status: 'RESERVED' }))
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
    // For now, just return success message
    // In a real system, you'd update a reservations table
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
