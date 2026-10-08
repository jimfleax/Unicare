import mongoose, { Document, Schema } from 'mongoose';

export interface IAsset extends Document {
  tagId: string;
  name: string;
  healthStatus: 'healthy' | 'degraded' | 'broken';
  location?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    tagId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    healthStatus: {
      type: String,
      enum: ['healthy', 'degraded', 'broken'],
      default: 'healthy',
    },
    location: { type: String, default: 'Campus' },
    category: { type: String, default: 'General' },
  },
  { timestamps: true }
);

export default mongoose.model<IAsset>('Asset', assetSchema);
