const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());

// Database connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,  // container/service hostname
  dialect: 'mssql',
});

// Models
const Venue = sequelize.define('Venue', {
  venue_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: false,
  tableName: 'Venues'
});

const Event = sequelize.define('Event', {
  event_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  venue_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  event_type: { type: DataTypes.STRING, allowNull: false },
  event_date: { type: DataTypes.DATE, allowNull: false },
  base_price: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: false,
  tableName: 'Events'
});

// Relationships
Venue.hasMany(Event, { foreignKey: 'venue_id' });
Event.belongsTo(Venue, { foreignKey: 'venue_id' });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'catalog-service' });
});

/**
 * VENUE ENDPOINTS
 */
// Get all venues
app.get('/v1/venues', async (req, res) => {
  try {
    const venues = await Venue.findAll();
    res.json(venues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get single venue
app.get('/v1/venues/:id', async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json(venue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new venue
app.post('/v1/venues', async (req, res) => {
  try {
    const venue = await Venue.create(req.body);
    res.status(201).json(venue);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Update venue
app.put('/v1/venues/:id', async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    await venue.update(req.body);
    res.json(venue);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Delete venue
app.delete('/v1/venues/:id', async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    await venue.destroy();
    res.json({ message: 'Venue deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * EVENT ENDPOINTS
 */
// Get all events (with filters)
app.get('/v1/events', async (req, res) => {
  const { city, event_type, status } = req.query;

  const eventWhere = {};
  if (event_type) eventWhere.event_type = event_type;
  if (status) eventWhere.status = status;

  try {
    const events = await Event.findAll({
      where: eventWhere,
      include: [{
        model: Venue,
        attributes: ['name', 'city'],
        where: city ? { city } : undefined,
      }],
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get single event
app.get('/v1/events/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{ model: Venue, attributes: ['name', 'city'] }],
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new event
app.post('/v1/events', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Update event
app.put('/v1/events/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.update(req.body);
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Delete event
app.delete('/v1/events/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.destroy();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check endpoint
app.get('/v1/catalog/health', (req, res) => {
  res.json({ status: 'OK', service: 'catalog-service' });
});

// Sync DB and start server
const PORT = 3001;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Catalog service running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

module.exports = app;
