import mongoose from 'mongoose';

export const ISSUE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

// Define what an "Issue" object looks like
const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, default: 'General' },
    priority: { type: String, enum: ISSUE_PRIORITIES, default: 'Medium' },
    status: { type: String, default: 'Open' },
    assignee: { type: String, default: 'Unassigned' },
    reporter: { type: String, default: 'Student' },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Issue', issueSchema);
