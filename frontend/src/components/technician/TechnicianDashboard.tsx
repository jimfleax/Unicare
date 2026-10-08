import React, { useState } from 'react'
import useSWR from 'swr'
import {
  Wrench, CheckCircle2, Clock3, AlertTriangle, UserCheck,
  Search, Filter, MessageSquare, Zap, Package, User,
  MapPin, Calendar, ArrowUpRight
} from 'lucide-react'
import { addRepairLogApi, fetcher, createRequisitionApi, updateTechnicianStatusApi } from '../../services/api'
import { INSTITUTION_NAME } from '../../config/branding'
import type { IssueRecord, Technician, SparePart } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface TechnicianDashboardProps {
  records: IssueRecord[]
  onStatusChange: (id: string, newStatus: 'Open' | 'In Progress' | 'Resolved') => void
  onSelectIssue: (issue: IssueRecord) => void
  onRefresh?: () => void
}

export function TechnicianDashboard({ records, onStatusChange, onSelectIssue, onRefresh }: TechnicianDashboardProps) {
  const { data: technicianRoster = [], mutate } = useSWR<Technician[]>('/users/technicians', fetcher)
  const { data: sparePartsInventory = [] } = useSWR<SparePart[]>('/inventory', fetcher)
  const { user } = useAuth()

  const currentTech = technicianRoster.find(t => t.id === user?._id)


  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'workorders' | 'roster' | 'spares'>('workorders')

  // Comment note modal state
  const [noteModalIssue, setNoteModalIssue] = useState<IssueRecord | null>(null)
  const [techNote, setTechNote] = useState('')

  const [requisitionModalPart, setRequisitionModalPart] = useState<SparePart | null>(null)
  const [reqQuantity, setReqQuantity] = useState<number>(1)
  const [reqReason, setReqReason] = useState<string>('')

  // Filter jobs based on search & status filter
  const filteredJobs = records.filter(r => {
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.ticketId || r.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.assignee.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Counts
  const totalJobs = records.length
  const inProgressJobs = records.filter(r => r.status === 'In Progress').length
  const openJobs = records.filter(r => r.status === 'Open').length
  const resolvedJobs = records.filter(r => r.status === 'Resolved').length

  const handleAddTechNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteModalIssue || !techNote.trim()) return

    const issueId = noteModalIssue.id
    const success = await addRepairLogApi(issueId, techNote)
    
    if (success) {
      if (onRefresh) onRefresh()
    } else {
      alert("Failed to add repair log. Please try again.")
    }

    setTechNote('')
    setNoteModalIssue(null)
  }
  const handleRequisitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requisitionModalPart || !currentTech) return;

    const success = await createRequisitionApi({
      inventoryId: requisitionModalPart.id,
      technicianId: currentTech.id,
      quantityRequested: reqQuantity,
      reason: reqReason
    });

    if (success) {
      alert(`Requisition for ${requisitionModalPart.name} submitted successfully.`);
      if (onRefresh) onRefresh(); // Refresh UI or inventory stock values
    } else {
      alert("Failed to submit requisition. Please try again.");
    }

    setRequisitionModalPart(null);
    setReqQuantity(1);
    setReqReason('');
  };


  return (
    <div className="tech-dashboard-container">
      {/* ── 1. Technician Header Banner ─────────────────────────────── */}
      <div className="tech-hero-card">
        <div className="tech-hero-left">
          <div className="tech-avatar-circle" style={{ borderColor: currentTech?.avatarColor || '#ccc' }}>
            <Wrench size={28} color={currentTech?.avatarColor || '#ccc'} />
            <span className="tech-status-dot" title={currentTech?.status || 'Loading'}></span>
          </div>

          <div>
            <div className="tech-badge-row">
              <span className="badge-tech-tag">TECHNICIAN SHIFT OPERATIONS</span>
              <span className="badge-tech-status">{currentTech?.status || 'Loading...'}</span>
              <span className="badge-tech-role">{currentTech?.title || 'Unknown Role'}</span>
            </div>

            <h1 className="tech-name">{currentTech?.name || 'Loading Technician...'}</h1>
            <p className="tech-specialty">
              Specialty: <strong>{currentTech?.specialty || 'N/A'}</strong> · Hotline: <strong>{currentTech?.phone || 'N/A'}</strong>
            </p>
          </div>
        </div>

        {/* My Current Status Dropdown */}
        <div className="tech-switcher-box">
          <label><User size={13} /> MY CURRENT STATUS:</label>
          <select
            value={currentTech?.status || ''}
            onChange={async (e) => {
              const newStatus = e.target.value
              const success = await updateTechnicianStatusApi(newStatus)
              if (success) {
                mutate()
              } else {
                alert("Failed to update status")
              }
            }}
          >
            <option value="On Shift">On Shift</option>
            <option value="In Field">In Field</option>
            <option value="On Call">On Call</option>
            <option value="Off Duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* ── 2. Shift Telemetry Metric Cards ────────────────────────────── */}
      <div className="tech-stats-row">
        <div className={`tech-stat-card ${filterStatus === 'All' ? 'active' : ''}`} onClick={() => { setFilterStatus('All'); setActiveTab('workorders'); }}>
          <div className="stat-icon bg-red-dim"><Wrench size={22} color="var(--red-bright)" /></div>
          <div>
            <span className="stat-label">Total Shift Queue</span>
            <h2 className="stat-val">{totalJobs}</h2>
          </div>
          <span className="stat-badge">All Work Orders</span>
        </div>

        <div className={`tech-stat-card ${filterStatus === 'In Progress' ? 'active' : ''}`} onClick={() => { setFilterStatus('In Progress'); setActiveTab('workorders'); }}>
          <div className="stat-icon bg-amber-dim"><Clock3 size={22} color="var(--amber-txt)" /></div>
          <div>
            <span className="stat-label">In Progress Jobs</span>
            <h2 className="stat-val text-amber">{inProgressJobs}</h2>
          </div>
          <span className="stat-badge amber">Active SLA</span>
        </div>

        <div className={`tech-stat-card ${filterStatus === 'Open' ? 'active' : ''}`} onClick={() => { setFilterStatus('Open'); setActiveTab('workorders'); }}>
          <div className="stat-icon bg-blue-dim"><AlertTriangle size={22} color="#60a5fa" /></div>
          <div>
            <span className="stat-label">Unassigned Open</span>
            <h2 className="stat-val text-blue">{openJobs}</h2>
          </div>
          <span className="stat-badge blue">Triage Pending</span>
        </div>

        <div className={`tech-stat-card ${filterStatus === 'Resolved' ? 'active' : ''}`} onClick={() => { setFilterStatus('Resolved'); setActiveTab('workorders'); }}>
          <div className="stat-icon bg-green-dim"><CheckCircle2 size={22} color="var(--green-txt)" /></div>
          <div>
            <span className="stat-label">Resolved Today</span>
            <h2 className="stat-val text-green">{resolvedJobs}</h2>
          </div>
          <span className="stat-badge green">Verified Fixed</span>
        </div>
      </div>

      {/* ── 3. Navigation Tab Bar ──────────────────────────────────────── */}
      <div className="student-tabs-nav">
        <button
          className={`student-tab-btn ${activeTab === 'workorders' ? 'active' : ''}`}
          onClick={() => setActiveTab('workorders')}
        >
          <Wrench size={15} /> Work Order Triage Queue ({filteredJobs.length})
        </button>
        <button
          className={`student-tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          <UserCheck size={15} /> On-Duty Technician Roster ({technicianRoster.length})
        </button>
        <button
          className={`student-tab-btn ${activeTab === 'spares' ? 'active' : ''}`}
          onClick={() => setActiveTab('spares')}
        >
          <Package size={15} /> Spare Parts &amp; Inventory Stock
        </button>
      </div>

      {/* ── 4. Main Tab View Panels ────────────────────────────────────── */}

      {/* TAB 1: WORK ORDER TRIAGE QUEUE */}
      {activeTab === 'workorders' && (
        <div className="student-section">
          {/* Toolbar */}
          <div className="student-toolbar">
            <div className="student-search-box">
              <Search size={16} color="var(--txt-muted)" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ticket title, assigned tech, lab room, or ID..."
              />
              {searchQuery && <button onClick={() => setSearchQuery('')} style={{ color: 'var(--txt-sub)' }}>✕</button>}
            </div>

            <div className="student-filter-chips">
              <span className="filter-title"><Filter size={13} /> Filter:</span>
              {(['All', 'Open', 'In Progress', 'Resolved'] as const).map(st => (
                <button
                  key={st}
                  className={`chip-btn ${filterStatus === st ? 'active' : ''}`}
                  onClick={() => setFilterStatus(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Work Orders List */}
          {filteredJobs.length === 0 ? (
            <div className="student-empty-state">
              <Wrench size={48} color="var(--txt-dim)" />
              <h3>No work orders found in queue</h3>
              <p>All clear for current search filter.</p>
            </div>
          ) : (
            <div className="tech-jobs-list">
              {filteredJobs.map(job => (
                <div key={job.id} className="tech-job-card">
                  <div className="job-card-top">
                    <div style={{ flex: 1 }}>
                      <div className="job-tag-row">
                        <span className="ticket-id-tag">{job.ticketId || job.id}</span>
                        <span className="ticket-category-tag">{job.category || 'Uncategorized'}</span>
                        <span className={`badge-priority ${job.priority.toLowerCase()}`}>{job.priority} Priority</span>
                      </div>
                      <h3 className="job-title">{job.title}</h3>
                      <div className="job-meta">
                        <span className="job-meta-chip">
                          <MapPin size={13} className="meta-icon" />
                          <span>Location: <strong>{job.location}</strong></span>
                        </span>
                        <span className="job-meta-chip">
                          <Calendar size={13} className="meta-icon" />
                          <span>Reported: <strong>{job.date} {job.time ? `(${job.time})` : ''}</strong></span>
                        </span>
                        <span className="job-meta-chip">
                          <User size={13} className="meta-icon" />
                          <span>Reporter: <strong>{job.reporter}</strong></span>
                        </span>
                      </div>
                    </div>

                    <div className="job-action-column">
                      <span className={`badge-status ${job.status === 'Resolved' ? 'available' : job.status === 'In Progress' ? 'in-progress' : 'critical'}`}>
                        <span className="status-dot"></span>
                        {job.status.toUpperCase()}
                      </span>

                      <div className="job-buttons-group">
                        {job.status !== 'In Progress' && job.status !== 'Resolved' && (
                          <button
                            className="btn-red"
                            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                            onClick={() => onStatusChange(job.id, 'In Progress')}
                          >
                            <Zap size={14} /> Start Repair
                          </button>
                        )}
                        {job.status !== 'Resolved' && (
                          <button
                            className="btn-green-action"
                            onClick={() => onStatusChange(job.id, 'Resolved')}
                          >
                            <CheckCircle2 size={14} /> Mark Resolved
                          </button>
                        )}
                        <button
                          className="btn-dark"
                          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                          onClick={() => setNoteModalIssue(job)}
                        >
                          <MessageSquare size={14} /> Repair Log
                        </button>
                        <button
                          className="btn-dark"
                          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                          onClick={() => onSelectIssue(job)}
                        >
                          <span>Full Details</span>
                          <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Technician Repair Log Snippets */}
                  {job.activityLogs && job.activityLogs.length > 0 && (
                    <div className="tech-logs-snippet-box">
                      <div className="snippet-header">
                        <span className="snippet-badge">🔧 Technician Logs ({job.activityLogs.length})</span>
                      </div>
                      <div className="snippet-list">
                        {job.activityLogs.map((log: any, idx: number) => (
                          <div key={idx} className="snippet-item">
                            <span className="snippet-author">{log.createdBy?.name || 'Unknown'}</span>
                            <span className="snippet-time">({new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}):</span>
                            <span className="snippet-text">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.description && (
                    <div className="job-desc-box">
                      <div className="job-desc-header">
                        <span className="desc-badge">STUDENT REPORT DESCRIPTION</span>
                      </div>
                      <p className="desc-content">"{job.description}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ON-DUTY TECHNICIAN ROSTER */}
      {activeTab === 'roster' && (
        <div className="student-section">
          <div className="page-heading" style={{ marginBottom: '20px' }}>
            <div>
              <p className="kicker">{INSTITUTION_NAME} MAINTENANCE TEAM</p>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--txt)' }}>On-Duty Technician Roster</h2>
              <span style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>Active engineering technicians assigned across campus lab blocks.</span>
            </div>
          </div>

          <div className="roster-grid">
            {technicianRoster.map(tech => (
              <div key={tech.id} className="roster-card">
                <div className="roster-card-top">
                  <div className="roster-avatar" style={{ background: tech.avatarColor }}>
                    {tech.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className="roster-id">{tech.id}</span>
                    <h3 className="roster-name">{tech.name}</h3>
                    <span className="roster-title">{tech.title}</span>
                  </div>
                </div>

                <div className="roster-meta-box">
                  <div>
                    <small>Specialty</small>
                    <div>{tech.specialty}</div>
                  </div>
                  <div>
                    <small>Shift Status</small>
                    <div style={{ color: tech.status === 'On Shift' ? 'var(--green-txt)' : 'var(--amber-txt)', fontWeight: 700 }}>
                      {tech.status}
                    </div>
                  </div>
                  <div>
                    <small>Hotline Phone</small>
                    <div style={{ fontFamily: 'monospace' }}>{tech.phone}</div>
                  </div>
                </div>

                <button
                  className="btn-dark"
                  style={{ width: '100%', marginTop: '14px', fontSize: '0.8rem', padding: '8px', justifyContent: 'center' }}
                  onClick={() => {
                    setSearchQuery(tech.name)
                    setActiveTab('workorders')
                  }}
                >
                  Inspect {tech.name}'s Queue
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SPARE PARTS & STOCK */}
      {activeTab === 'spares' && (
        <div className="student-section">
          <div className="page-heading" style={{ marginBottom: '20px' }}>
            <div>
              <p className="kicker">LAB MAINTENANCE REQUISITION</p>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--txt)' }}>Spare Parts &amp; Hardware Inventory Stock</h2>
              <span style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>Hardware replacements available in central maintenance storage.</span>
            </div>
          </div>

          <div className="portal-card">
            <table className="archive-table">
              <thead>
                <tr>
                  <th>Part ID</th>
                  <th>Item Description</th>
                  <th>Category</th>
                  <th>In-Stock Quantity</th>
                  <th>Stock Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sparePartsInventory.map(part => (
                  <tr key={part.id}>
                    <td><span className="ticket-id-tag">{part.id}</span></td>
                    <td><b className="record-title-bold">{part.name}</b></td>
                    <td style={{ color: 'var(--txt-muted)' }}>{part.category}</td>
                    <td><b style={{ fontSize: '1rem', color: 'var(--txt)' }}>{part.stock} {part.unit}</b></td>
                    <td>
                      <span className={`badge-status ${part.status === 'In Stock' ? 'available' : part.status === 'Low Stock' ? 'in-progress' : 'critical'}`}>
                        {part.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-red-outline" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }} 
                        onClick={() => {
                          setRequisitionModalPart(part);
                          setReqQuantity(1);
                          setReqReason('');
                        }}
                      >
                        Requisition Item
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Technical Repair Note Modal */}
      {noteModalIssue && (
        <div className="modal-overlay" onClick={() => setNoteModalIssue(null)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--red-bright)', fontWeight: 700 }}>
                  POST REPAIR LOG · TICKET #{noteModalIssue.ticketId || noteModalIssue.id}
                </span>
                <h3 style={{ marginTop: '2px', color: 'var(--txt)' }}>{noteModalIssue.title}</h3>
              </div>
              <button className="modal-close" onClick={() => setNoteModalIssue(null)}>✕</button>
            </div>

            <form onSubmit={handleAddTechNote} style={{ padding: '24px' }}>
              <div className="reg-field" style={{ marginBottom: '16px' }}>
                <label>Active Technician</label>
                <input value={currentTech?.name || ''} disabled style={{ opacity: 0.7 }} />
              </div>

              <div className="reg-field" style={{ marginBottom: '20px' }}>
                <label>Technical Diagnosis / Action Taken</label>
                <textarea
                  rows={4}
                  value={techNote}
                  onChange={e => setTechNote(e.target.value)}
                  placeholder="Describe repair steps, replaced parts, or testing completed..."
                  required
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'var(--txt)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn-dark" type="button" onClick={() => setNoteModalIssue(null)}>Cancel</button>
                <button className="btn-red" type="submit">Save Repair Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {requisitionModalPart && (
        <div className="modal-overlay" onClick={() => setRequisitionModalPart(null)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--red-bright)', fontWeight: 700 }}>
                  PART REQUISITION
                </span>
                <h3 style={{ marginTop: '2px', color: 'var(--txt)' }}>Request {requisitionModalPart.name}</h3>
              </div>
              <button className="modal-close" onClick={() => setRequisitionModalPart(null)}>✕</button>
            </div>

            <form onSubmit={handleRequisitionSubmit} style={{ padding: '24px' }}>
              <div className="reg-field" style={{ marginBottom: '16px' }}>
                <label htmlFor="req-quantity">Quantity Needed (Max: {requisitionModalPart.stock})</label>
                <input
                  id="req-quantity"
                  type="number"
                  min="1"
                  max={requisitionModalPart.stock}
                  value={reqQuantity}
                  onChange={e => setReqQuantity(parseInt(e.target.value) || 1)}
                  required
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'var(--txt)' }}
                />
              </div>

              <div className="reg-field" style={{ marginBottom: '20px' }}>
                <label htmlFor="req-reason">Reason / Justification</label>
                <textarea
                  id="req-reason"
                  rows={3}
                  value={reqReason}
                  onChange={e => setReqReason(e.target.value)}
                  placeholder="Why is this part needed?"
                  required
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'var(--txt)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn-dark" type="button" onClick={() => setRequisitionModalPart(null)}>Cancel</button>
                <button className="btn-red" type="submit">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
