const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Middleware for correlation IDs
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('X-Correlation-ID', req.correlationId);
  console.log(`[${req.correlationId}] ${req.method} ${req.url}`);
  next();
});

// Database connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mssql',
});

// Models
const Order = sequelize.define('Order', {
  order_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true
  },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  event_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'PENDING' },
  payment_status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'PENDING' },
  order_total: { type: DataTypes.FLOAT, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
  tableName: 'Orders'
});

const Ticket = sequelize.define('Ticket', {
  ticket_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  event_id: { type: DataTypes.INTEGER, allowNull: false },
  seat_id: { type: DataTypes.INTEGER, allowNull: false },
  price_paid: { type: DataTypes.FLOAT, allowNull: false },
}, {
  timestamps: false,
  tableName: 'Tickets'
});

Order.hasMany(Ticket, { foreignKey: 'order_id' });
Ticket.belongsTo(Order, { foreignKey: 'order_id' });

// Service URLs
const SEATING_SERVICE_URL = 'http://seating-service:3002';
const PAYMENT_SERVICE_URL = 'http://payment-service:3004';
const NOTIFICATION_SERVICE_URL = 'http://notification-service:3005';

// Create new order
app.post('/v1/orders', async (req, res) => {
  const { user_id, event_id, seat_ids } = req.body;
  const idempotencyKey = req.headers['idempotency-key'] || uuidv4();

  console.log(`[${req.correlationId}] Creating order:`, { user_id, event_id, seat_ids });

  if (!user_id || !event_id || !seat_ids || !Array.isArray(seat_ids)) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  try {
    // Reserve seats
    console.log(`[${req.correlationId}] Reserving seats...`);
    const reserveResponse = await axios.post(`${SEATING_SERVICE_URL}/v1/seats/reserve`, {
      seatIds: seat_ids,
    });

    if (reserveResponse.status !== 200) {
      console.log(`[${req.correlationId}] Failed to reserve seats`);
      return res.status(400).json({ error: 'Failed to reserve seats' });
    }

    console.log(`[${req.correlationId}] Seats reserved successfully`);

    // Calculate total (including tax)
    const seatPrices = reserveResponse.data.seats.map((seat) => seat.price);
    const total = seatPrices.reduce((sum, price) => sum + price, 0) * 1.05;

    console.log(`[${req.correlationId}] Creating order with total:`, total);

    // Create order with Sequelize (database now has proper IDENTITY)
    const orderData = { 
      user_id, 
      event_id, 
      order_total: total,
      status: 'PENDING',
      payment_status: 'PENDING'
    };
    
    console.log(`[${req.correlationId}] Order data:`, orderData);
    const order = await Order.create(orderData);

    console.log(`[${req.correlationId}] Order created with ID:`, order.order_id);

    // Process payment
    console.log(`[${req.correlationId}] Processing payment...`);
    const paymentResponse = await axios.post(
      `${PAYMENT_SERVICE_URL}/v1/payments/charge`,
      {
        order_id: order.order_id,
        amount: total,
        method: 'CREDIT_CARD',
      },
      { headers: { 'Idempotency-Key': idempotencyKey } }
    );

    console.log(`[${req.correlationId}] Payment response:`, paymentResponse.data);

    if (paymentResponse.data.status !== 'SUCCESS') {
      console.log(`[${req.correlationId}] Payment failed, canceling order`);
      await axios.post(`${SEATING_SERVICE_URL}/v1/seats/release`, { seatIds: seat_ids });
      order.status = 'CANCELED';
      await order.save();
      return res.status(400).json({ error: 'Payment failed' });
    }

    // Confirm order and allocate seats
    order.status = 'CONFIRMED';
    order.payment_status = 'SUCCESS';
    await order.save();

    await axios.post(`${SEATING_SERVICE_URL}/v1/seats/allocate`, { seatIds: seat_ids });

    // Generate tickets
    const tickets = reserveResponse.data.seats.map((seat) => ({
      order_id: order.order_id,
      event_id,
      seat_id: seat.seat_id,
      price_paid: seat.price,
    }));
    await Ticket.bulkCreate(tickets);

    // Send email notification
    await axios.post(`${NOTIFICATION_SERVICE_URL}/v1/notifications/email`, {
      to: 'user@example.com', // Replace with real user email
      subject: 'Order Confirmation',
      text: `Your order ${order.order_id} has been placed successfully.`,
    });

    console.log(`[${req.correlationId}] Order completed successfully`);
    res.status(201).json({ order, tickets });
  } catch (error) {
    console.error(`[${req.correlationId}] Error processing order:`, error.message);
    console.error(`[${req.correlationId}] Stack trace:`, error.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Cancel order
app.post('/v1/orders/:orderId/cancel', async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only pending orders can be canceled' });
    }

    const tickets = await Ticket.findAll({ where: { order_id: orderId } });
    const seatIds = tickets.map((ticket) => ticket.seat_id);

    await axios.post(`${SEATING_SERVICE_URL}/v1/seats/release`, { seatIds });
    order.status = 'CANCELED';
    await order.save();

    await axios.post(`${NOTIFICATION_SERVICE_URL}/v1/notifications/email`, {
      to: 'user@example.com',
      subject: 'Order Cancellation',
      text: `Your order ${orderId} has been canceled successfully.`,
    });

    res.json({ message: 'Order canceled successfully' });
  } catch (error) {
    console.error(`[${req.correlationId}] Error canceling order:`, error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch order by ID
app.get('/v1/orders/:orderId', async (req, res) => {
  const order = await Order.findByPk(req.params.orderId, { include: Ticket });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Fetch all orders for a user
app.get('/v1/orders/user/:userId', async (req, res) => {
  const orders = await Order.findAll({ where: { user_id: req.params.userId }, include: Ticket });
  res.json(orders);
});

// Get all orders (for testing)
app.get('/v1/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({ include: Ticket });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'order-service' });
});

// Start service
sequelize.sync().then(() => {
  console.log('✅ Database connected successfully');
  app.listen(3003, () => console.log('Order Service running on port 3003'));
}).catch(err => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});
