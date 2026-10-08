import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'technician' | 'admin';
  carePoints: number;
  title?: string;
  specialty?: string;
  status?: 'On Shift' | 'In Field' | 'On Call' | 'Off Duty';
  phone?: string;
  avatarColor?: string;
  batch?: string;
  batchCode?: string;
  branch?: string;
  rollNo?: string;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['student', 'technician', 'admin'],
      default: 'student',
    },
    carePoints: { type: Number, default: 0 },
    title: { type: String },
    specialty: { type: String },
    status: { 
      type: String, 
      enum: ['On Shift', 'In Field', 'On Call', 'Off Duty'],
      default: 'On Shift'
    },
    phone: { type: String },
    avatarColor: { type: String },
    batch: { type: String },
    batchCode: { type: String },
    branch: { type: String },
    rollNo: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
