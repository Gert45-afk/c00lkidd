const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['games', 'accounts', 'items', 'currency', 'services', 'other']
  },
  game: {
    type: String,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'inactive'],
    default: 'active'
  },
  images: [{
    type: String
  }],
  delivery: {
    type: String,
    enum: ['instant', 'manual', 'auto'],
    default: 'manual'
  },
  stock: {
    type: Number,
    default: 1
  },
  views: {
    type: Number,
    default: 0
  },
  orders: [{
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'disputed'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ category: 1, game: 1, status: 1 });

module.exports = mongoose.model('Listing', listingSchema);
