import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsorship extends Document {
  festivalId: mongoose.Types.ObjectId;
  flatNumber: string;
  residentName: string;
  sponsoredItem: string;
  amount: number;
  paymentMode: 'CASH' | 'ONLINE';
  date: Date;
  description?: string;
  notes?: string;
  paymentReference?: string;
  proofUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SponsorshipSchema = new Schema<ISponsorship>(
  {
    festivalId: { type: Schema.Types.ObjectId, ref: 'Festival', required: true, index: true },
    flatNumber: { type: String, required: true, trim: true },
    residentName: { type: String, required: true, trim: true },
    sponsoredItem: { type: String, required: true, trim: true }, // e.g. Lunch, Ganesh Idol, Laddoo, Decoration
    amount: { type: Number, required: true, min: 1 },
    paymentMode: { type: String, enum: ['CASH', 'ONLINE'], required: true },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String },
    notes: { type: String },
    paymentReference: { type: String },
    proofUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.Sponsorship || mongoose.model<ISponsorship>('Sponsorship', SponsorshipSchema);
