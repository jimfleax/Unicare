import mongoose, { Document, Schema } from 'mongoose';

export interface IRequisitionRequest extends Document {
  inventoryId: mongoose.Types.ObjectId;
  technicianId: mongoose.Types.ObjectId;
  quantityRequested: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const requisitionRequestSchema = new Schema<IRequisitionRequest>(
  {
    inventoryId: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
    technicianId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantityRequested: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IRequisitionRequest>('RequisitionRequest', requisitionRequestSchema);
