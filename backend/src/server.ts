import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import db, { initDatabase } from './database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key', {
  apiVersion: '2025-11-17.clover'
});

// Middleware
app.use(cors({
  origin: [
    'https://hackerwithdrip.github.io',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  credentials: true
}));
app.use(express.json());

// Initialize database
initDatabase();

// Get all products
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY featured DESC, created_at DESC').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get featured products
app.get('/api/products/featured', (req: Request, res: Response) => {
  try {
    const products = db.prepare('SELECT * FROM products WHERE featured = 1 ORDER BY created_at DESC').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// Get product by ID
app.get('/api/products/:id', (req: Request, res: Response) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get products by category
app.get('/api/products/category/:category', (req: Request, res: Response) => {
  try {
    const products = db.prepare('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC').all(req.params.category);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// Get cart items
app.get('/api/cart/:sessionId', (req: Request, res: Response) => {
  try {
    const cartItems = db.prepare(`
      SELECT ci.*, p.name, p.price, p.image, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.session_id = ?
    `).all(req.params.sessionId);
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// Add item to cart
app.post('/api/cart', (req: Request, res: Response) => {
  try {
    const { sessionId, productId, quantity } = req.body;
    
    // Check if item already exists in cart
    const existingItem = db.prepare('SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?').get(sessionId, productId);
    
    if (existingItem) {
      // Update quantity
      db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE session_id = ? AND product_id = ?')
        .run(quantity, sessionId, productId);
    } else {
      // Insert new item
      db.prepare('INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)')
        .run(sessionId, productId, quantity);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
app.put('/api/cart/:id', (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
app.delete('/api/cart/:id', (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
app.delete('/api/cart/session/:sessionId', (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE session_id = ?').run(req.params.sessionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Create payment intent
app.post('/api/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { sessionId, total, shippingAddress, paymentIntentId } = req.body;

    // Get cart items
    const cartItems = db.prepare(`
      SELECT ci.*, p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.session_id = ?
    `).all(sessionId);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Create order
    const orderResult = db.prepare(`
      INSERT INTO orders (total, status, stripe_payment_intent_id, shipping_address)
      VALUES (?, ?, ?, ?)
    `).run(total, 'completed', paymentIntentId, JSON.stringify(shippingAddress));

    const orderId = orderResult.lastInsertRowid;

    // Create order items
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `);

    for (const item of cartItems as any[]) {
      insertOrderItem.run(orderId, item.product_id, item.quantity, item.price);
      
      // Update product stock
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product_id);
    }

    // Clear cart
    db.prepare('DELETE FROM cart_items WHERE session_id = ?').run(sessionId);

    res.json({ success: true, orderId });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order by ID
app.get('/api/orders/:id', (req: Request, res: Response) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderItems = db.prepare(`
      SELECT oi.*, p.name, p.image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(req.params.id);

    res.json({ ...order, items: orderItems });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'FitTeam API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/api/products',
      featured: '/api/products/featured'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

