import mongoose, { Document, Schema } from "mongoose";

export interface IAlert extends Document {
  title: string;
  loc: string;
  date: string;
  type: "alert" | "notice";
  active: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    title: { type: String, required: true },
    loc: { type: String, required: true },
    date: { type: String, required: true },
    type: { type: String, enum: ["alert", "notice"], default: "alert" },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model<IAlert>("Alert", alertSchema);
