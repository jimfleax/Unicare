import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Asset from '../models/Asset';
import Issue, { ISSUE_PRIORITIES } from '../models/Issue';
import { INCIDENT_STATUSES } from '../models/Incident';
import Faq from '../models/Faq';
import { catchAsync } from '../utils/catchAsync';

// Incident has no location/category fields; Issue (user-reported) does.
const distinctMerged = async (field: 'location' | 'category'): Promise<string[]> => {
  const [a, b] = await Promise.all([
    Asset.distinct(field),
    Issue.distinct(field),
  ]);
  const set = new Set<string>();
  [...a, ...b].forEach((v) => {
    if (typeof v === 'string' && v.trim()) set.add(v.trim());
  });
  return [...set].sort((x, y) => x.localeCompare(y));
};

const toOption = (value: string) => ({ value, label: value });

export const getLocations = catchAsync(async (_req: AuthRequest, res: Response, _next: NextFunction) => {
  res.status(200).json({ success: true, data: await distinctMerged('location') });
});

export const getCategories = catchAsync(async (_req: AuthRequest, res: Response, _next: NextFunction) => {
  const cats = await distinctMerged('category');
  res.status(200).json({ success: true, data: cats.map(toOption) });
});

export const getPriorities = catchAsync(async (_req: AuthRequest, res: Response, _next: NextFunction) => {
  res.status(200).json({ success: true, data: ISSUE_PRIORITIES.map(toOption) });
});

export const getStatuses = catchAsync(async (_req: AuthRequest, res: Response, _next: NextFunction) => {
  res.status(200).json({ success: true, data: [...INCIDENT_STATUSES] });
});

export const getFaqs = catchAsync(async (_req: AuthRequest, res: Response, _next: NextFunction) => {
  await seedFaqs(); // covers serverless where server.ts startup doesn't run
  const faqs = await Faq.find({ active: true }).sort({ order: 1 }).lean();
  res.status(200).json({
    success: true,
    data: faqs.map((f) => ({ question: f.question, answer: f.answer })),
  });
});

export const getStudentProfile = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const u = req.user || {};
  res.status(200).json({
    success: true,
    data: {
      batch: u.batch || '',
      batchCode: u.batchCode || '',
      branch: u.branch || '',
      rollNo: u.rollNo || '',
    },
  });
});

const DEFAULT_FAQS = [
  { question: 'How do I report a campus issue?', answer: 'Open the Report screen, choose a location and category, describe the problem, and submit. You can also scan an asset QR tag.' },
  { question: 'How can I track my reported issue?', answer: 'Open My Issues to see the current status: Open, In Progress or Resolved.' },
  { question: 'What are Care Points?', answer: 'Care Points are rewards earned for reporting valid issues and helping keep the campus in good shape.' },
  { question: 'How long does a fix usually take?', answer: 'It depends on priority. Critical issues are handled first; others are scheduled by the maintenance team.' },
  { question: 'Who do I contact for urgent problems?', answer: 'Mark the issue as Critical priority and contact the campus maintenance desk directly.' },
];

/** Idempotent: inserts default FAQs only if the collection is empty. */
export const seedFaqs = async (): Promise<void> => {
  if ((await Faq.estimatedDocumentCount()) > 0) return;
  await Faq.insertMany(DEFAULT_FAQS.map((f, i) => ({ ...f, order: i, active: true })));
};
