/* ── Shared Types for UniCare Dashboard System ───────────── */

export interface IssueRecord {
  id: string
  title: string
  location: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved'
  assignee: string
  reporter: string
  date: string
  time?: string
  description?: string
  category?: string
}

export interface AssetRecord {
  id: string
  name: string
  category: string
  location: string
  status: 'Active' | 'Maintenance' | 'Decommissioned'
  lastService: string
  nextDue: string
  health: number
}
