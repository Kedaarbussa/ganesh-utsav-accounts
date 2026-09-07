import mongoose, { Schema, Document } from 'mongoose';

export interface IFestival extends Document {
  apartmentName: string;
  festivalName: string;
  year: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FestivalSchema = new Schema<IFestival>(
  {
    apartmentName: { type: String, required: true, default: 'CHANAKYA RESIDENCY' },
    festivalName: { type: String, required: true, default: 'GANESH UTSAV' },
    year: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Festival || mongoose.model<IFestival>('Festival', FestivalSchema);
