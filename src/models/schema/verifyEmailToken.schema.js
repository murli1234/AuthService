import mongoose from 'mongoose';
const { Schema } = mongoose;

const emailVerificationTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  token: { type: String, unique: true, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailVerificationToken', emailVerificationTokenSchema);
