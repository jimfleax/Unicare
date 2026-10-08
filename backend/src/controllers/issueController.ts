import Issue from '../models/Issue';

// 📥 FETCH ALL ISSUES
export const getIssues = async (req, res) => {
  try {
    // Fetch all issues from MongoDB, sorted by newest first
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📝 CREATE A NEW ISSUE
export const createIssue = async (req, res) => {
  try {
    const { title, location, category, priority, description, reporter } = req.body;

    if (!title || !location) {
      return res.status(400).json({ success: false, message: 'Title and location are required' });
    }

    // Save issue into MongoDB database
    const issue = await Issue.create({ title, location, category, priority, description, reporter });

    res.status(201).json({ success: true, message: 'Issue reported!', data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔄 UPDATE ISSUE STATUS
export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const issue = await Issue.findByIdAndUpdate(id, { status }, { new: true });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    res.json({ success: true, message: 'Status updated!', data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
