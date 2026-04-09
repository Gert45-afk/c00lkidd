const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create order (buy listing)
router.post('/', auth, async (req, res) => {
  try {
    const { listingId } = req.body;
    
    const listing = await Listing.findById(listingId).populate('seller');
    if (!listing || listing.status !== 'active') {
      return res.status(404).json({ message: 'Listing not available' });
    }

    if (listing.seller._id.toString() === req.user.userId) {
      return res.status(400).json({ message: 'Cannot buy your own listing' });
    }

    const order = new Order({
      listing: listingId,
      buyer: req.user.userId,
      seller: listing.seller._id,
      price: listing.price
    });

    await order.save();
    
    // Add to listing orders
    listing.orders.push({ buyer: req.user.userId });
    if (listing.stock > 0) {
      listing.stock -= 1;
    }
    if (listing.stock === 0) {
      listing.status = 'sold';
    }
    await listing.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ buyer: req.user.userId }, { seller: req.user.userId }]
    })
    .populate('listing', 'title price')
    .populate('buyer', 'username')
    .populate('seller', 'username')
    .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete order (deliver item)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { deliveryData } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.deliveryData = deliveryData;
    order.status = 'completed';
    await order.save();

    // Update seller balance
    await User.findByIdAndUpdate(order.seller, {
      $inc: { balance: order.price * 0.95 } // 5% commission
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm receipt
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = 'completed';
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
