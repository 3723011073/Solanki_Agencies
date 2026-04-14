require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = __dirname;
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@solankiagencies.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const NORMALIZED_ADMIN_EMAIL = ADMIN_EMAIL.trim().toLowerCase();
const NORMALIZED_ADMIN_PASSWORD = String(ADMIN_PASSWORD).trim();
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_SECURE = /^(1|true|yes)$/i.test(process.env.SMTP_SECURE || 'false');
const RECEIPT_FROM_EMAIL = process.env.RECEIPT_FROM_EMAIL || SMTP_USER || ADMIN_EMAIL;

const razorpay = (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  : null;

const emailTransporter = (SMTP_HOST && SMTP_USER && SMTP_PASS)
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    })
  : null;

const USER_SESSIONS = {};
const ADMIN_SESSIONS = {};
const LOCAL_USERS = [];

const DB_NAME = process.env.MYSQL_DATABASE || 'solanki_agencies';
const DB_PORT = Number(process.env.MYSQL_PORT || 3306);
const DB_SSL_ENABLED = /^(1|true|required)$/i.test(process.env.MYSQL_SSL || 'false');

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  port: DB_PORT,
  database: DB_NAME,
  ...(DB_SSL_ENABLED ? { ssl: { rejectUnauthorized: false } } : {})
};

let db;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildReceiptEmailHtml(payment) {
  const itemsRows = (payment.items || []).map(item => {
    const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
    return `<tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.name)}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${escapeHtml(item.quantity)}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">INR ${lineTotal.toLocaleString('en-IN')}</td>
    </tr>`;
  }).join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#1f2937;">
      <h2 style="color:#0b3d91;">Solanki Agencies - Payment Receipt</h2>
      <p>Your payment has been received successfully.</p>
      <p><strong>Order ID:</strong> ${escapeHtml(payment.orderId)}</p>
      <p><strong>Date:</strong> ${escapeHtml(new Date(payment.timestamp).toLocaleString('en-IN'))}</p>
      <p><strong>Customer:</strong> ${escapeHtml(payment.customer.name)} (${escapeHtml(payment.customer.email)})</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #0b3d91;">Item</th>
            <th style="text-align:center;padding:8px;border-bottom:2px solid #0b3d91;">Qty</th>
            <th style="text-align:right;padding:8px;border-bottom:2px solid #0b3d91;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <p style="margin-top:16px;"><strong>Total:</strong> INR ${Number(payment.totalAmount || 0).toLocaleString('en-IN')}</p>
      <p style="margin-top:18px;color:#6b7280;">Support: <a href="mailto:${escapeHtml(ADMIN_EMAIL)}">${escapeHtml(ADMIN_EMAIL)}</a> | Phone: 7276164935 | Pune, Maharashtra</p>
    </div>
  `;
}

async function sendReceiptEmails(payment) {
  if (!emailTransporter) {
    console.warn('SMTP not configured. Skipping receipt email send.');
    return;
  }

  const customerEmail = normalizeEmail(payment?.customer?.email);
  const adminEmail = normalizeEmail(ADMIN_EMAIL);
  const recipients = [...new Set([customerEmail, adminEmail].filter(Boolean))];
  if (!recipients.length) return;

  const html = buildReceiptEmailHtml(payment);
  const subject = `Payment Receipt - ${payment.orderId}`;

  await Promise.all(recipients.map((to) => emailTransporter.sendMail({
    from: RECEIPT_FROM_EMAIL,
    to,
    subject,
    html
  })));
}

async function initDb() {
  const bootstrapConnection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port,
    ...(DB_SSL_ENABLED ? { ssl: { rejectUnauthorized: false } } : {})
  });

  const escapedDbName = `\`${DB_NAME.replace(/`/g, '``')}\``;
  await bootstrapConnection.query(`CREATE DATABASE IF NOT EXISTS ${escapedDbName}`);
  await bootstrapConnection.end();

  db = await mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 10, queueLimit: 0 });
  await db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}

initDb().catch(err => {
  console.error('MySQL initialization error:', err);
  db = null;
  console.warn('Continuing without MySQL. Using local in-memory users for auth.');
});

async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (db) {
    const [rows] = await db.query('SELECT * FROM users WHERE LOWER(TRIM(email)) = ?', [normalizedEmail]);
    return rows.length > 0 ? rows[0] : null;
  }
  return LOCAL_USERS.find(user => normalizeEmail(user.email) === normalizedEmail) || null;
}

async function createUser(email, hashedPassword, name) {
  if (db) {
    const [result] = await db.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name || null]);
    return { id: result.insertId, email, password: hashedPassword, name: name || '' };
  }
  const id = LOCAL_USERS.length > 0 ? Math.max(...LOCAL_USERS.map(u => u.id)) + 1 : 1;
  const user = { id, email, password: hashedPassword, name: name || '' };
  LOCAL_USERS.push(user);
  return user;
}

// Middleware to check admin authentication from either admin token or admin user token
function isAdminAuthenticated(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (ADMIN_SESSIONS[token]) {
    req.adminEmail = ADMIN_SESSIONS[token];
    return next();
  }

  if (USER_SESSIONS[token] && normalizeEmail(USER_SESSIONS[token].email) === NORMALIZED_ADMIN_EMAIL) {
    req.adminEmail = USER_SESSIONS[token].email;
    return next();
  }

  res.status(401).json({ error: 'Unauthorized' });
}

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const normalizedEmail = normalizeEmail(req.body?.email);
  const normalizedPassword = String(req.body?.password || '').trim();
  if (normalizedEmail === NORMALIZED_ADMIN_EMAIL && normalizedPassword === NORMALIZED_ADMIN_PASSWORD) {
    const token = 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    ADMIN_SESSIONS[token] = ADMIN_EMAIL;
    res.json({ ok: true, token, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Admin Logout
app.post('/api/admin/logout', isAdminAuthenticated, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  delete ADMIN_SESSIONS[token];
  res.json({ ok: true, message: 'Logged out' });
});

// User signup
app.post('/api/user/signup', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '').trim();
  const name = String(req.body?.name || '').trim();
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(email, hashedPassword, name || '');
    const isAdmin = normalizeEmail(user.email) === NORMALIZED_ADMIN_EMAIL;
    const token = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    USER_SESSIONS[token] = { id: user.id, email: user.email, name: user.name || '', isAdmin };
    res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name || '', isAdmin } });
  } catch (error) {
    console.error('Signup error', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// User login
app.post('/api/user/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '').trim();
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (email === NORMALIZED_ADMIN_EMAIL && password === NORMALIZED_ADMIN_PASSWORD) {
    const token = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    USER_SESSIONS[token] = { id: 0, email: ADMIN_EMAIL, name: 'Admin', isAdmin: true };
    return res.json({ ok: true, token, user: { id: 0, email: ADMIN_EMAIL, name: 'Admin', isAdmin: true } });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isAdmin = normalizeEmail(user.email) === NORMALIZED_ADMIN_EMAIL;
    const token = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    USER_SESSIONS[token] = { id: user.id, email: user.email, name: user.name, isAdmin };
    res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, isAdmin } });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token && USER_SESSIONS[token]) {
    req.user = USER_SESSIONS[token];
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

app.get('/api/user/me', authenticateUser, (req, res) => {
  res.json({ ok: true, user: req.user });
});

app.post('/api/user/logout', authenticateUser, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  delete USER_SESSIONS[token];
  res.json({ ok: true, message: 'User logged out' });
});

// Get all products
app.get('/api/products', (req, res) => {
  fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Could not read products' });
    try { const json = JSON.parse(data); res.json(json); } catch (e) { res.status(500).json({ error: 'Invalid products file' }) }
  })
});

// Add new product (admin only)
app.post('/api/products/add', isAdminAuthenticated, (req, res) => {
  const newProduct = req.body;
  if (!newProduct.name || !newProduct.price || !newProduct.category) {
    return res.status(400).json({ error: 'Missing required fields: name, price, category' });
  }

  fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
    let products = [];
    if (!err) {
      try { products = JSON.parse(data); } catch (e) { }
    }
    
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const product = {
      id: newId,
      name: newProduct.name,
      category: newProduct.category,
      price: newProduct.price,
      desc: newProduct.desc || '',
      image: newProduct.image || 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg',
      stock: newProduct.stock || 100
    };

    products.push(product);
    fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Could not save product' });
      res.json({ ok: true, product });
    });
  });
});

// Delete product (admin only)
app.delete('/api/products/:id', isAdminAuthenticated, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  fs.readFile(PRODUCTS_FILE, 'utf8', (readErr, data) => {
    if (readErr) return res.status(500).json({ error: 'Could not read products' });

    let products = [];
    try {
      products = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid products file' });
    }

    const before = products.length;
    const updated = products.filter(p => Number(p.id) !== id);
    if (updated.length === before) {
      return res.status(404).json({ error: 'Product not found' });
    }

    fs.writeFile(PRODUCTS_FILE, JSON.stringify(updated, null, 2), (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Could not remove product' });
      res.json({ ok: true, removedId: id });
    });
  });
});

// Get booking history by customer email
app.get('/api/bookings/:email', (req, res) => {
  const email = req.params.email;
  fs.readFile(BOOKINGS_FILE, 'utf8', (err, data) => {
    if (err) return res.json([]);
    try {
      const bookings = JSON.parse(data);
      const userBookings = bookings.filter(b => b.booking.email === email);
      res.json(userBookings);
    } catch (e) {
      res.json([]);
    }
  });
});

// Save booking
app.post('/api/bookings', (req, res) => {
  const booking = req.body;
  if(!booking || !booking.items || !Array.isArray(booking.items) || booking.items.length===0) {
    return res.status(400).json({ error: 'Invalid booking payload' });
  }
  const record = { id: Date.now(), createdAt: new Date().toISOString(), booking };
  fs.readFile(BOOKINGS_FILE, 'utf8', (err, data) => {
    let arr = [];
    if(!err){ try{ arr = JSON.parse(data) }catch(e){ arr = [] } }
    arr.push(record);
    fs.writeFile(BOOKINGS_FILE, JSON.stringify(arr, null, 2), (err) => {
      if(err) return res.status(500).json({ error: 'Could not save booking' });
      res.json({ ok: true, id: record.id });
    })
  })
});

// Expose public Razorpay config for checkout initialization
app.get('/api/payment/config', authenticateUser, (req, res) => {
  if (!RAZORPAY_KEY_ID) {
    return res.status(503).json({ error: 'Payment gateway is not configured yet' });
  }
  res.json({ ok: true, keyId: RAZORPAY_KEY_ID });
});

// Create Razorpay order
app.post('/api/payment/create-order', authenticateUser, async (req, res) => {
  try {
    const { customer, paymentMethod, items, totalAmount } = req.body;

    if (!razorpay) {
      return res.status(503).json({ error: 'Payment gateway is not configured yet' });
    }
    
    // Validate request
    if (!customer || !paymentMethod || !items || !totalAmount) {
      return res.status(400).json({ error: 'Invalid payment request' });
    }

    if (items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate customer info
    if (!customer.name || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({ error: 'Missing required customer information' });
    }

    // Validate amount is positive
    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Generate secure internal order ID and Razorpay order
    const internalOrderId = 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const amountInPaise = Math.round(Number(totalAmount) * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: internalOrderId,
      notes: {
        internalOrderId,
        userEmail: req.user.email,
        paymentMethod: paymentMethod || 'razorpay'
      }
    });

    // Create payment record (sensitive data NOT stored)
    const payment = {
      orderId: internalOrderId,
      timestamp: new Date().toISOString(),
      userId: req.user.id,
      userEmail: req.user.email,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city || '',
        zipcode: customer.zipcode || '',
        gst: customer.gst || ''
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount,
      paymentMethod: paymentMethod || 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      status: 'pending'
    };

    // Save payment record to file
    fs.readFile(PAYMENTS_FILE, 'utf8', (err, data) => {
      let payments = [];
      if (!err) {
        try {
          payments = JSON.parse(data);
        } catch (e) {
          payments = [];
        }
      }

      payments.push(payment);

      fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error saving payment:', writeErr);
          return res.status(500).json({ error: 'Could not create order' });
        }

        res.json({
          ok: true,
          keyId: RAZORPAY_KEY_ID,
          orderId: payment.orderId,
          razorpayOrderId: razorpayOrder.id,
          amount: amountInPaise,
          currency: 'INR'
        });
      });
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Could not create payment order' });
  }
});

// Verify Razorpay payment signature and finalize order
app.post('/api/payment/verify', authenticateUser, (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay || !orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment verification payload' });
    }

    const expected = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    fs.readFile(PAYMENTS_FILE, 'utf8', (err, data) => {
      let payments = [];
      if (!err) {
        try {
          payments = JSON.parse(data);
        } catch (e) {
          payments = [];
        }
      }

      const payment = payments.find(p =>
        p.orderId === orderId &&
        p.userId === req.user.id &&
        p.razorpayOrderId === razorpay_order_id
      );

      if (!payment) {
        return res.status(404).json({ error: 'Order not found' });
      }

      payment.status = 'completed';
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.completedAt = new Date().toISOString();

      fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error finalizing payment:', writeErr);
          return res.status(500).json({ error: 'Could not finalize payment' });
        }

        sendReceiptEmails(payment).catch((mailErr) => {
          console.error('Receipt email send failed:', mailErr);
        });

        res.json({
          ok: true,
          orderId: payment.orderId,
          amount: payment.totalAmount,
          status: payment.status
        });
      });
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get payment receipt (authenticated users only)
app.get('/api/payment/receipt/:orderId', authenticateUser, (req, res) => {
  const orderId = req.params.orderId;

  fs.readFile(PAYMENTS_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Could not retrieve receipt' });
    }

    try {
      const payments = JSON.parse(data);
      const payment = payments.find(p => 
        p.orderId === orderId && p.userId === req.user.id
      );

      if (!payment) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Return payment details for receipt display (no sensitive data)
      res.json({
        ok: true,
        orderId: payment.orderId,
        timestamp: payment.timestamp,
        customer: payment.customer,
        items: payment.items,
        totalAmount: payment.totalAmount,
        paymentMethod: payment.paymentMethod,
        status: payment.status
      });
    } catch (parseErr) {
      res.status(500).json({ error: 'Error reading receipt' });
    }
  });
});

app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 5500;
app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));
