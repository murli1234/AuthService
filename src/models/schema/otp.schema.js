import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  contact_no: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  preUser: {
    type: Boolean,
    default: false,
  },
  resend_count: {
    type: Number,
    default: 0,
  },
  failure_attempts: {
    type: Number,
    default: 0,
  },
  expiry_time: {
    type: Date,
    default: null,
  },
  lock_time: {
    type: Date,
    default: null,
  },
  old_contact_no: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: null,
  }
}, {
  collection: 'otp',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model('Otp', OtpSchema);
