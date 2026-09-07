import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  festivalId: mongoose.Types.ObjectId;
  expenseDescription: string; // Free-text description
  amount: number;
  spentBy: string; // Who spent the money
  paymentMode: 'CASH' | 'ONLINE';
  date: Date;
  notes?: string;
  receiptUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    festivalId: { type: Schema.Types.ObjectId, ref: 'Festival', required: true, index: true },
    expenseDescription: { type: String, required: true, trim: true }, // Free-text input
    amount: { type: Number, required: true, min: 1 },
    spentBy: { type: String, required: true, trim: true }, // Who spent the money
    paymentMode: { type: String, enum: ['CASH', 'ONLINE'], required: true },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String },
    receiptUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
