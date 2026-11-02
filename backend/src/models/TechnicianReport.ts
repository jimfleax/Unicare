import mongoose, { Document, Schema } from 'mongoose';

export interface ITechnicianReport extends Document {
  technicianId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  incidentId?: mongoose.Types.ObjectId;
  issueType: 'Unresponsive / SLA Breach' | 'Unprofessional Conduct' | 'Poor Quality Work' | 'Other';
  description: string;
  status: 'Pending Review' | 'Under Investigation' | 'Resolved' | 'Dismissed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const technicianReportSchema = new Schema<ITechnicianReport>(
  {
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
    },
    issueType: {
      type: String,
      enum: ['Unresponsive / SLA Breach', 'Unprofessional Conduct', 'Poor Quality Work', 'Other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Under Investigation', 'Resolved', 'Dismissed'],
      default: 'Pending Review',
    },
    adminNotes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITechnicianReport>('TechnicianReport', technicianReportSchema);
