import mongoose, { Schema, Document } from 'mongoose';

export interface ICommitteeMember extends Document {
  festivalId: mongoose.Types.ObjectId;
  name: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommitteeMemberSchema = new Schema<ICommitteeMember>(
  {
    festivalId: { type: Schema.Types.ObjectId, ref: 'Festival', required: true, index: true },
    name: { type: String, required: true, trim: true },
    position: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.CommitteeMember || mongoose.model<ICommitteeMember>('CommitteeMember', CommitteeMemberSchema);
