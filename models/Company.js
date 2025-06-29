const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  domain: String,
  industry: String,
  employeeCount: Number,
  location: String,
  contacts: [{
    name: String,
    email: String,
    title: String,
    phone: String
  }],
  websiteData: {
    content: String,
    products: [String],
    services: [String],
    scrapedAt: Date
  },
  apolloId: String,
  status: {
    type: String,
    enum: ['pending', 'scraped', 'email_generated', 'email_sent'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);