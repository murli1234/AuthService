import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: String,
  last_name: String,
  email: { type: String, unique: true, sparse: true },
  email_verified: { type: Boolean, default: false },
  gender: String,
  contact_no: { type: String, unique: true, required: true },
  location: String,
  password: String,
  website_url: String,
  expected_ctc: mongoose.Types.Decimal128,
  current_ctc: mongoose.Types.Decimal128,
  current_job: String,
  current_organisation: String,
  current_education: String,
  profile_image: String,
  supplychain_type: String,
  service_type: String,
  address: String,
  city: String,
  aadhar_no: String,
  pan_card_no: String,
  have_a_bike: Boolean,
  bike_no: String,
  pan_card_image: String,
  bike_image: String,
  driving_license_image: String,
  video: String,
  thumbnail: String,
  about_me: String,
  username: { type: String, unique: true, required: true },
  date_of_birth: Date,
  deleted_at: Date,
  lifeAtOurCompany: String,
  pin_code: String,
  notification_setting: Schema.Types.Mixed,
  skills: [Schema.Types.Mixed],
  links: [Schema.Types.Mixed],
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['USER', 'ADMIN', 'COMPANY'], default: 'USER' },
  account_type: { type: String, enum: ['PERSONAL', 'COMPANY', 'BLUEFLY'], default: 'PERSONAL' },
  language: {
    type: String,
    enum: ['ENG', 'HIN', 'ODI', 'BEN', 'ASM', 'TEL', 'TAM', 'MAL', 'MAR', 'KAN', 'GUJ', 'PAN'],
    default: 'ENG',
  },
  languages: [Schema.Types.Mixed],
  invite_all_user: Date,
  is_contact_no_visible: { type: Boolean, default: false },
  referral_points: { type: Number, default: 0 },
  referred_by: { type: Schema.Types.ObjectId, ref: 'User' },
  device_token: String,
  one_signal_player_id: String,
  qr_url: String,
  chat_bg_color: String,
  chat_wallpaper: String,
  highest_education: String,
  last_seen: { type: Date, default: null },
  registration_status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  kyc_status: {
    type: String,
    enum: ['NOT_SUBMITTED', 'SUBMITTED', 'VERIFIED'],
    default: 'NOT_SUBMITTED',
  },
  approved_at: Date,
  approved_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  rejected_at: Date,
  rejected_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  rejection_reason: String,
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// ✅ Function to update last_seen (call manually)
userSchema.methods.updateLastSeen = async function () {
  this.last_seen = new Date();
  return await this.save();
};

const User = model('User', userSchema);
export default User;
