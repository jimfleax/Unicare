import mongoose, { Document, Schema } from 'mongoose';

export const INCIDENT_STATUSES = ['Open', 'In Progress', 'Resolved'] as const;

export interface IActivityLog {
  message: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IIncident extends Document {
  assetId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  status: 'Open' | 'In Progress' | 'Resolved'; // Open -> In Progress -> Resolved
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  mediaUrls: string[];
  activityLogs: IActivityLog[];
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  message: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const incidentSchema = new Schema<IIncident>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: INCIDENT_STATUSES, // Open -> In Progress -> Resolved
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    description: { type: String, required: true },
    mediaUrls: [{ type: String }],
    activityLogs: [activityLogSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IIncident>('Incident', incidentSchema);
