require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = __dirname;
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@solankiagencies.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const USER_SESSIONS = {};
const ADMIN_SESSIONS = {};
const LOCAL_USERS = [];

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'solanki_agencies'
};

let db;

async function initDb() {
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
  if (db) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  }
  return LOCAL_USERS.find(user => user.email === email) || null;
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

  if (USER_SESSIONS[token] && USER_SESSIONS[token].email === ADMIN_EMAIL) {
    req.adminEmail = USER_SESSIONS[token].email;
    return next();
  }

  res.status(401).json({ error: 'Unauthorized' });
}

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    ADMIN_SESSIONS[token] = email;
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
  const { email, password, name } = req.body;
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
    const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
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
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
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

    const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
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

// Secure Payment Processing
app.post('/api/payment/process', authenticateUser, (req, res) => {
  try {
    const { customer, paymentMethod, items, totalAmount } = req.body;
    
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

    // Generate secure order ID
    const orderId = 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create payment record (sensitive data NOT stored)
    const payment = {
      orderId,
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
      paymentMethod: paymentMethod, // Stored for reference only (no actual card data)
      status: 'completed',
      // IMPORTANT: Card/UPI/Banking credentials are NEVER stored
      // This is a simulated payment system
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
          return res.status(500).json({ error: 'Payment processing failed' });
        }

        // Return success with order ID (NEVER return full payment details)
        res.json({
          ok: true,
          orderId: payment.orderId,
          amount: payment.totalAmount,
          date: payment.timestamp,
          message: 'Payment processed successfully'
        });
      });
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
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
