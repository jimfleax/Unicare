import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenanceSchedule extends Document {
  assetId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  scheduledDate: Date;
  description: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
}

const MaintenanceScheduleSchema: Schema = new Schema(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMaintenanceSchedule>(
  'MaintenanceSchedule',
  MaintenanceScheduleSchema
);
