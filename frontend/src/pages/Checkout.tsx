import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { getSessionId } from '../context/CartContext';
import './Checkout.css';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'An error occurred');
        setLoading(false);
        return;
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setLoading(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order in backend
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        await axios.post(`${API_URL}/orders`, {
          sessionId: getSessionId(),
          total: cartTotal,
          shippingAddress: shippingInfo,
          paymentIntentId: paymentIntent.id,
        });

        await clearCart();
        navigate('/order-success', { state: { orderId: paymentIntent.id } });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="shipping-section">
        <h2>Shipping Information</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              required
              value={shippingInfo.name}
              onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              required
              value={shippingInfo.email}
              onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
            />
          </div>
          <div className="form-group full-width">
            <label>Address *</label>
            <input
              type="text"
              required
              value={shippingInfo.address}
              onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              required
              value={shippingInfo.city}
              onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              required
              value={shippingInfo.state}
              onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>ZIP Code *</label>
            <input
              type="text"
              required
              value={shippingInfo.zipCode}
              onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Country *</label>
            <input
              type="text"
              required
              value={shippingInfo.country}
              onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="payment-section">
        <h2>Payment Information</h2>
        <PaymentElement />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        className="btn btn-primary submit-btn"
        disabled={!stripe || loading}
      >
        {loading ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
      </button>
    </form>
  );
};

const Checkout: React.FC = () => {
  const { cart, cartTotal } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    // Create payment intent
    axios
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      axios.post(`${API_URL}/create-payment-intent`, {
        amount: cartTotal,
        currency: 'usd',
      })
      .then((response) => {
        setClientSecret(response.data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to create payment intent:', error);
        setLoading(false);
      });
  }, [cart, cartTotal, navigate]);

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="spinner"></div>
        <p>Preparing checkout...</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="checkout-error">
        <p>Failed to initialize checkout. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Checkout
        </motion.h1>

        <div className="checkout-layout">
          <motion.div
            className="checkout-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          </motion.div>

          <motion.div
            className="order-summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cart.map((item) => (
                <div key={item.id} className="summary-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

