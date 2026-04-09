const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const { category, game, search, sort } = req.query;
    let query = { status: 'active' };

    if (category) query.category = category;
    if (game) query.game = game;
    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else sortOption.createdAt = -1;

    const listings = await Listing.find(query)
      .populate('seller', 'username rating')
      .sort(sortOption)
      .limit(50);

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'username rating reviews');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    listing.views += 1;
    await listing.save();

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create listing (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, price, category, game, images, delivery, stock } = req.body;

    const listing = new Listing({
      title,
      description,
      price,
      category,
      game,
      seller: req.user.userId,
      images: images || [],
      delivery: delivery || 'manual',
      stock: stock || 1
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update listing (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(listing, req.body);
    await listing.save();

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete listing (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
