const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  role: {
    type: String,
    enum: ['admin', 'employee', 'super-admin'],
    default: 'admin'
  }
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);