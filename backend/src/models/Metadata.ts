import mongoose, { Document, Schema } from 'mongoose';

export interface IMetadata extends Document {
  type: string; // 'priority' | 'location'
  value: string;
  label: string;
  color: string;
}

const metadataSchema = new Schema<IMetadata>({
  type: { type: String, required: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
  color: { type: String, required: true }
});

export default mongoose.model<IMetadata>('Metadata', metadataSchema);
