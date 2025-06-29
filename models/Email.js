const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  recipientEmail: {
    type: String,
    required: true
  },
  recipientName: String,
  subject: String,
  content: String,
  personalizedData: {
    companyName: String,
    industry: String,
    specificProducts: [String],
    painPoints: [String]
  },
  status: {
    type: String,
    enum: ['generated', 'sent', 'failed'],
    default: 'generated'
  },
  sentAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Email', emailSchema);