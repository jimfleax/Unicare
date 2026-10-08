import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Asset from '../models/Asset';
const ISSUE_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
import { INCIDENT_STATUSES } from '../models/Incident';
import Faq from '../models/Faq';
import Metadata from '../models/Metadata';
import { catchAsync } from '../utils/catchAsync';

// Incident has no location/category fields; Issue (user-reported) did.
const distinctMerged = async (field: 'location' | 'category'): Promise<string[]> => {
  const a = await Asset.distinct(field);
  const set = new Set<string>();
  a.forEach((v) => {
    if (typeof v === 'string' && v.trim()) set.add(v.trim());
  });
  return [...set].sort((x, y) => x.localeCompare(y));
};

const toOption = (value: string) => ({ value, label: value });

export const getLocations = catchAsync(async (_req: AuthRequest, res: Response, _next: NextFunction) => {
  await seedMetadata();
  
  const dynamicLocations = await distinctMerged('location');
  const locationMetas = await Metadata.find({ type: 'location' }).lean();
  const colorMap = new Map();
  locationMetas.forEach(meta => colorMap.set(meta.value, meta.color));

  const data = dynamicLocations.map(loc => ({
    value: loc,
    label: loc,
    color: colorMap.get(loc) || 'var(--txt-sub)' // Fallback color
  }));
  
  if (data.length === 0) {
    const fallbackData = locationMetas.map(meta => ({
      value: meta.value,
      label: meta.label,
      color: meta.color
    }));
    res.status(200).json({ success: true, data: fallbackData });
    return;
  }

  res.status(200).json({ success: true, data });
});

export const getCategories = catchAsync(async (_req: AuthRequest, res: Response, _next: NextFunction) => {
  const cats = await distinctMerged('category');
  res.status(200).json({ success: true, data: cats.map(toOption) });
});

export const getPriorities = catchAsync(async (_req: AuthRequest, res: Response, _next: NextFunction) => {
  await seedMetadata();
  const priorities = await Metadata.find({ type: 'priority' }).lean();
  if (priorities.length > 0) {
    res.status(200).json({
      success: true,
      data: priorities.map(p => ({ value: p.value, label: p.label, color: p.color }))
    });
  } else {
    res.status(200).json({ success: true, data: ISSUE_PRIORITIES.map(toOption) });
  }
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

export const seedMetadata = async (): Promise<void> => {
  if ((await Metadata.estimatedDocumentCount()) > 0) return;
  const defaults = [
    { type: 'priority', value: 'Critical', label: 'Critical', color: 'var(--red)' },
    { type: 'priority', value: 'High', label: 'High', color: 'var(--amber-border)' },
    { type: 'priority', value: 'Medium', label: 'Medium', color: 'var(--txt-sub)' },
    { type: 'priority', value: 'Low', label: 'Low', color: 'var(--border-bright)' },
    // A few default locations
    { type: 'location', value: 'Main Library', label: 'Main Library', color: 'var(--red)' },
    { type: 'location', value: 'Science Block', label: 'Science Block', color: '#3b82f6' },
    { type: 'location', value: 'Admin Building', label: 'Admin Building', color: 'var(--amber-border)' },
    { type: 'location', value: 'Sports Complex', label: 'Sports Complex', color: 'var(--green-border)' },
  ];
  await Metadata.insertMany(defaults);
};
