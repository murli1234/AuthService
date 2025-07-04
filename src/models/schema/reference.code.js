import mongoose from 'mongoose';
const { Schema } = mongoose;

const ReferralCodeSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  created_by: {
    type: Schema.Types.ObjectId, // referencing User._id
    ref: 'User',
    required: true,
    unique: true,
  },
  usage_count: {
    type: Number,
    default: 0,
  },
  max_usage_count: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  expires_at: {
    type: Date,
    default: null,
  }
}, {
  collection: 'referral_codes',
  timestamps: false // created_at is handled manually
});

ReferralCodeSchema.index({ created_by: 1 }, { name: 'referral_codes_created_by_fkey' });

export default mongoose.model('ReferralCode', ReferralCodeSchema);
