const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Database connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST, // must match docker-compose service name
  dialect: 'mssql',
  logging: false,
});

// Define Payment model
const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'PENDING',
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // for idempotency
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  tableName: 'Payments',
  // Ensure proper table structure
  sync: { force: false }
});

// Endpoint to process payment
app.post('/v1/payments/charge', async (req, res) => {
  const { order_id, amount, method } = req.body;
  const idempotencyKey = req.headers['idempotency-key'] || req.headers['Idempotency-Key'] || req.headers['IDEMPOTENCY-KEY'];

  console.log('💳 Payment request received:', { order_id, amount, method });
  console.log('🔑 Idempotency Key:', idempotencyKey);

  if (!order_id || !amount || !method) {
    return res
      .status(400)
      .json({ error: 'Invalid request payload - order_id, amount, and method are required' });
  }

  if (!idempotencyKey) {
    return res
      .status(400)
      .json({ error: 'Missing Idempotency-Key header' });
  }

  try {
    // check if payment with same idempotency key exists
    console.log('🔍 Checking for existing payment...');
    const existingPayment = await Payment.findOne({ where: { reference: idempotencyKey } });
    if (existingPayment) {
      console.log('♻️ Returning existing payment:', existingPayment.dataValues);
      return res.status(200).json(existingPayment);
    }

    // simulate payment success/failure (80% success)
    const paymentStatus = Math.random() > 0.2 ? 'SUCCESS' : 'FAILED';
    console.log('🎲 Payment simulation result:', paymentStatus);

    const paymentData = {
      order_id,
      amount,
      method,
      status: paymentStatus,
      reference: idempotencyKey,
    };

    console.log('💾 Creating payment record:', paymentData);
    const payment = await Payment.create(paymentData);

    console.log('✅ Payment created successfully:', payment.dataValues);
    res.status(201).json(payment);
  } catch (error) {
    console.error('❌ Error processing payment:', error.message);
    console.error('📋 Error details:', error.stack);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint to refund payment
app.post('/v1/payments/refund', async (req, res) => {
  const { payment_id } = req.body;

  if (!payment_id) {
    return res.status(400).json({ error: 'payment_id is required' });
  }

  try {
    const payment = await Payment.findByPk(payment_id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'SUCCESS') {
      return res.status(400).json({ error: 'Only successful payments can be refunded' });
    }

    payment.status = 'REFUNDED';
    await payment.save();

    res.json({ message: 'Payment refunded successfully', payment });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check endpoint
app.get('/v1/payments/health', (req, res) => {
  res.json({ status: 'Payment Service is running' });
});

// Get all payments (for testing)
app.get('/v1/payments', async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get payment by ID
app.get('/v1/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sync DB and start server
sequelize
  .sync()
  .then(() => {
    console.log('✅ Database connected successfully');
    app.listen(3004, () => {
      console.log('✅ Payment Service running on port 3004');
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });
