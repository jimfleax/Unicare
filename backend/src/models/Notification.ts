import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  location?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  time: string;
  unread: boolean;
  incidentId?: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    location: { type: String, default: 'Campus' },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    time: { type: String, required: true },
    unread: { type: Boolean, default: true },
    incidentId: { type: Schema.Types.ObjectId, ref: 'Incident' },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Add a toJSON transform to rename _id to id so frontend can use n.id
notificationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    r['id'] = r['_id'];
    delete r['_id'];
    delete r['__v'];
  }
});

export default mongoose.model<INotification>('Notification', notificationSchema);
