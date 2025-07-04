import mongoose from 'mongoose';
const { Schema } = mongoose;

const SalesPersonReferralCodeSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  created_by: {
    type: Schema.Types.ObjectId, // refers to User._id
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
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  expires_at: {
    type: Date,
    default: null,
  },
  referred_companies: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
  ],
}, {
  collection: 'salesPersonReferralCode',
  timestamps: false,
});

SalesPersonReferralCodeSchema.index({ created_by: 1 }, { name: 'salesPersonReferralCode_created_by_fkey' });

export default mongoose.model('SalesPersonReferralCode', SalesPersonReferralCodeSchema);
