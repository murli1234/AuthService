import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const CompanySchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category' },
  company_name: String,
  user_name: String,
  website_url: String,
  description: String,
  listingDescription: String,
  business_type: { type: String, enum: ['Product', 'Service', 'Both'] },
  role: String,
  sub_category: String,
  date_of_incorporation: Date,
  mobile_no: String,
  mobile_no_type: { type: String, enum: ['Mobile', 'Landline'] },
  prefixCode: String,
  address: String,
  latitude: Number,
  longitude: Number,
  city: String,
  email: { type: String, unique: true, sparse: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: Date,
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
  pincode: Number,
  referral_points: { type: Number, default: 0 },
  referral_status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  referred_by: { type: Schema.Types.ObjectId, ref: 'Sales_Person_Referral_Code' },
  documents: [{ type: Schema.Types.ObjectId, ref: 'CompanyDocs' }],
  media: [{ type: Schema.Types.ObjectId, ref: 'CompanyMedia' }],
  ratingsReceived: [{ type: Schema.Types.ObjectId, ref: 'CompanyRating' }],
  ratingGiven: { type: Schema.Types.ObjectId, ref: 'SalesPersonRating' },
  carts: [{ type: Schema.Types.ObjectId, ref: 'Cart' }],
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  companyTimings: [{ type: Schema.Types.ObjectId, ref: 'CompanyTiming' }]
});


export const Company = model('Company', CompanySchema);
export default Company;