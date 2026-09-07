import mongoose, { Schema, Document } from 'mongoose';

export interface IFund extends Document {
  festivalId: mongoose.Types.ObjectId;
  flatNumber: string;
  residentName: string;
  amount: number;
  paymentMode: 'CASH' | 'ONLINE';
  date: Date;
  description?: string;
  notes?: string;
  transactionReference?: string;
  proofUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FundSchema = new Schema<IFund>(
  {
    festivalId: { type: Schema.Types.ObjectId, ref: 'Festival', required: true, index: true },
    flatNumber: { type: String, required: true, trim: true },
    residentName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMode: { type: String, enum: ['CASH', 'ONLINE'], required: true },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, default: 'Festival Contribution' },
    notes: { type: String },
    transactionReference: { type: String },
    proofUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.Fund || mongoose.model<IFund>('Fund', FundSchema);
