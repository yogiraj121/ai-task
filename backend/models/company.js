const mongoose = require('mongoose');


const CompanySchema = new mongoose.Schema({
  owner:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
  name: { type: String, required: true, unique: true, trim: true },
  domain: { type: String, trim: true },
  size: { type: String, trim: true },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
  },
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);