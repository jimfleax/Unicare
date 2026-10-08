# 🐣 Absolute Beginner's Step-by-Step Backend Guide

Welcome! If you've never built a backend before, **this guide is built for you**.

---

## 💡 The Big Picture (No Jargon)

When a user visits your website:
1. **Frontend (React)** sends a request over the internet (like asking a question).
2. **Backend (Express)** catches the request, does the work (like saving a ticket or getting data), and sends back a response.
3. **Database (MongoDB)** acts like a digital Excel sheet where your data is stored permanently.

---

## 🎯 Learning Path for Beginners

Instead of trying to build complex security right away, we will build your backend in **3 Simple Levels**:

- 🟢 **Level 1 (Day 1)**: Connect to MongoDB & build basic CRUD (Create, Read, Update) for Issues.
- 🟡 **Level 2 (Day 2)**: Add User Signup & Login (Authentication).
- 🔴 **Level 3 (Day 3)**: Lock down routes so only Admins/Technicians can edit tickets (Authorization).

---

## 🟢 LEVEL 1: Basic Database & Issues CRUD (Day 1)

### 1️⃣ Install Required Tools
Open your terminal inside the `backend/` directory:
```bash
cd backend
npm install mongoose dotenv cors express
``

---

### 2️⃣ Connect MongoDB (`src/config/db.js`)
Create a new file `backend/src/config/db.js`:

```javascript
import mongoose from 'mongoose';

// This function connects your server to your MongoDB database
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ DB Connection Error: ${error.message}`);
    process.exit(1); // Stop server if database fails
  }
};
```

---

### 3️⃣ Create Issue Blueprint (`src/models/Issue.js`)
Create `backend/src/models/Issue.js`:

```javascript
import mongoose from 'mongoose';

// Define what an "Issue" object must look like
const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },       // e.g. "Monitor display flickering"
  location: { type: String, required: true },    // e.g. "Thinkspace Lab"
  category: { type: String, default: 'General' },// e.g. "AV Equipment"
  priority: { type: String, default: 'Medium' }, // "Critical", "High", "Medium", "Low"
  status: { type: String, default: 'Open' },     // "Open", "In Progress", "Resolved"
  description: { type: String, default: '' },
  reporter: { type: String, default: 'Student' }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates

export default mongoose.model('Issue', issueSchema);
```

---

### 4️⃣ Create Issue Logic (`src/controllers/issueController.js`)
Create `backend/src/controllers/issueController.js`:

```javascript
import Issue from '../models/Issue.js';

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
```

---

### 5️⃣ Connect Routes (`src/routes/issueRoutes.js`)
Create `backend/src/routes/issueRoutes.js`:

```javascript
import express from 'express';
import { getIssues, createIssue, updateIssueStatus } from '../controllers/issueController.js';

const router = express.Router();

// Maps web requests to controller functions
router.get('/', getIssues);           // GET /api/issues
router.post('/', createIssue);         // POST /api/issues
router.patch('/:id', updateIssueStatus); // PATCH /api/issues/:id

export default router;
```

---

### 6️⃣ Start Main Server (`src/server.js`)
Update `backend/src/server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import issueRoutes from './routes/issueRoutes.js';

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', healthRoutes);
app.use('/api/issues', issueRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
```

---

## 🟡 LEVEL 2: User Login & Authentication (Day 2)

Once Level 1 works smoothly and you can save and fetch tickets, move to Level 2!

### 1️⃣ Install Password & Token Security Packages
```bash
npm install bcryptjs jsonwebtoken
```

### 2️⃣ Create User Blueprint (`src/models/User.js`)
```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Scrambled password string
  role: { type: String, default: 'student' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
```

---

## 🔴 LEVEL 3: Access Control (Day 3)

Add authorization middleware so that only technicians or lab admins can update ticket statuses.

---

## 💡 Quick Tips for Success

1. **Don't rush to Level 2/3 right away**. Build Level 1 first, test it in Postman or browser, and make sure tickets save in MongoDB!
2. **If an error happens**, check your terminal logs. Express errors usually tell you the exact line number where something went wrong.
