import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  festivalId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  action: string;
  entityType?: 'FUND' | 'SPONSORSHIP' | 'EXPENSE' | 'USER' | 'FESTIVAL' | 'SYSTEM';
  entityId?: string;
  description: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    festivalId: { type: Schema.Types.ObjectId, ref: 'Festival' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, enum: ['FUND', 'SPONSORSHIP', 'EXPENSE', 'USER', 'FESTIVAL', 'SYSTEM'] },
    entityId: { type: String },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
