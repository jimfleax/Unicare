import React, { useState } from 'react'
import './TechnicianDashboardPremium.css'
import useSWR from 'swr'
import {
  Wrench, CheckCircle2, Clock3, AlertTriangle, UserCheck,
  Search, Filter, MessageSquare, Zap, Package, User,
  MapPin, Calendar, ArrowUpRight, FileText
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
    e.preventDefault()
    if (!requisitionModalPart || !currentTech) return

    const success = await createRequisitionApi({
      inventoryId: requisitionModalPart.id,
      technicianId: currentTech.id,
      quantityRequested: reqQuantity,
      reason: reqReason
    })

    if (success) {
      alert(`Requisition for ${requisitionModalPart.name} submitted successfully.`)
      if (onRefresh) onRefresh()
    } else {
      alert("Failed to submit requisition. Please try again.")
    }

    setRequisitionModalPart(null)
    setReqQuantity(1)
    setReqReason('')
  }

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.currentTarget.click()
    }
  }

  return (
    <div className="technician-dashboard-premium">
      {/* Hero Profile Card */}
      <div className="technician-hero-premium">
        <div className="technician-profile-section">
          <div className="technician-avatar-container">
            <div className="technician-avatar-premium" style={{ borderColor: currentTech?.avatarColor || '#DC2626' }}>
              <Wrench size={28} color={currentTech?.avatarColor || '#DC2626'} />
            </div>
            <div className="technician-online-indicator" title={currentTech?.status || 'Loading'} />
          </div>

          <div className="technician-info-premium">
            <div className="technician-badges-row">
              <span className="technician-badge-premium badge-technician">TECHNICIAN SHIFT OPERATIONS</span>
              <span className="technician-badge-premium badge-status-tech">{currentTech?.status || 'Loading...'}</span>
              <span className="technician-badge-premium badge-specialty">{currentTech?.title || 'Unknown Role'}</span>
            </div>
            <h1 className="technician-name-premium">{currentTech?.name || 'Loading Technician...'}</h1>
            <p className="technician-meta-premium">
              Specialty: <strong>{currentTech?.specialty || 'N/A'}</strong> · Hotline: <strong>{currentTech?.phone || 'N/A'}</strong>
            </p>
          </div>
        </div>

        {/* Status Selector */}
        <div className="technician-status-selector">
          <label className="status-selector-label">
            <User size={13} />
            MY CURRENT STATUS
          </label>
          <select
            className="status-selector-dropdown"
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

      {/* Metric Cards */}
      <div className="metrics-grid-premium">
        {[
          { 
            label: 'Total Shift Queue', 
            value: totalJobs, 
            icon: Wrench, 
            color: 'red', 
            accentColor: '#DC2626',
            filter: 'All', 
            badge: 'All Work Orders', 
            subtitle: 'Total assigned tickets' 
          },
          { 
            label: 'In Progress Jobs', 
            value: inProgressJobs, 
            icon: Clock3, 
            color: 'amber', 
            accentColor: '#F59E0B',
            filter: 'In Progress', 
            badge: 'Active SLA', 
            subtitle: 'Currently repairing' 
          },
          { 
            label: 'Unassigned Open', 
            value: openJobs, 
            icon: AlertTriangle, 
            color: 'blue', 
            accentColor: '#3B82F6',
            filter: 'Open', 
            badge: 'Triage Pending', 
            subtitle: 'Awaiting assignment' 
          },
          { 
            label: 'Resolved Today', 
            value: resolvedJobs, 
            icon: CheckCircle2, 
            color: 'green', 
            accentColor: '#22C55E',
            filter: 'Resolved', 
            badge: 'Verified Fixed', 
            subtitle: 'Completed repairs' 
          }
        ].map((metric, idx) => {
          const Icon = metric.icon
          const isSelected = filterStatus === metric.filter
          return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onKeyDown={handleCardKeyDown}
              aria-pressed={isSelected}
              className={`metric-card-premium ${isSelected ? 'selected' : ''}`}
              onClick={() => { setFilterStatus(metric.filter as any); setActiveTab('workorders') }}
              style={{ '--card-accent': metric.accentColor } as React.CSSProperties}
            >
              <div className="metric-card-premium-header">
                <div className="metric-label-premium">{metric.label}</div>
                <span className={`metric-badge-premium badge-${metric.color}`}>{metric.badge}</span>
              </div>
              
              <div className="metric-card-premium-body">
                <div className={`metric-icon-premium icon-${metric.color}`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="metric-value-premium">{metric.value}</div>
              </div>
              
              <div className="metric-card-premium-footer">
                {metric.subtitle}
              </div>
            </div>
          )
        })}
      </div>

      {/* Ticket Workspace */}
      <div className="ticket-workspace-premium">
        {/* Tabs */}
        <div className="tabs-premium">
          <div className="tabs-list-premium">
            <button
              className={`tab-trigger-premium ${activeTab === 'workorders' ? 'active' : ''}`}
              onClick={() => setActiveTab('workorders')}
              role="tab"
              aria-selected={activeTab === 'workorders'}
              aria-controls="workorders-panel"
            >
              <Wrench size={20} strokeWidth={2.5} />
              <span>Work Order Triage Queue ({filteredJobs.length})</span>
            </button>
            <button
              className={`tab-trigger-premium ${activeTab === 'roster' ? 'active' : ''}`}
              onClick={() => setActiveTab('roster')}
              role="tab"
              aria-selected={activeTab === 'roster'}
              aria-controls="roster-panel"
            >
              <UserCheck size={20} strokeWidth={2.5} />
              <span>On-Duty Technician Roster ({technicianRoster.length})</span>
            </button>
            <button
              className={`tab-trigger-premium ${activeTab === 'spares' ? 'active' : ''}`}
              onClick={() => setActiveTab('spares')}
              role="tab"
              aria-selected={activeTab === 'spares'}
              aria-controls="spares-panel"
            >
              <Package size={20} strokeWidth={2.5} />
              <span>Spare Parts & Inventory Stock</span>
            </button>
          </div>
        </div>

        {/* Tab Content: Work Orders */}
        {activeTab === 'workorders' && (
          <div role="tabpanel" id="workorders-panel" className="tab-content-premium">
            {/* Search and Filter Toolbar */}
            <div className="search-filter-toolbar">
              <div className="search-input-premium">
                <Search size={18} className="search-icon-premium" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search ticket title, assigned tech, lab room, or ID..."
                />
              </div>

              <div className="filter-group-premium">
                <div className="filter-label-premium">
                  <Filter size={14} />
                  Filter:
                </div>
                <div className="filter-pills-premium">
                  {(['All', 'Open', 'In Progress', 'Resolved'] as const).map(status => (
                    <button
                      key={status}
                      className={`filter-pill-premium ${filterStatus === status ? 'active' : ''}`}
                      onClick={() => setFilterStatus(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Work Orders List */}
            {filteredJobs.length === 0 ? (
              <div className="empty-state-premium">
                <div className="empty-icon-container">
                  <Wrench size={48} className="empty-icon-premium" />
                </div>
                <h3 className="empty-heading-premium">No work orders found in queue</h3>
                <p className="empty-text-premium">
                  All clear for current search filter.
                </p>
              </div>
            ) : (
              <div className="work-orders-list-premium">
                {filteredJobs.map(job => (
                  <div key={job.id} className="work-order-card-premium">
                    <div className="work-order-header">
                      <div style={{ flex: 1 }}>
                        <div className="work-order-tags">
                          <span className="work-order-tag tag-ticket-id">{job.ticketId || job.id}</span>
                          <span className="work-order-tag tag-category">{job.category || 'Uncategorized'}</span>
                          <span className={`work-order-tag tag-priority ${job.priority.toLowerCase()}`}>
                            {job.priority} Priority
                          </span>
                        </div>
                        <h3 className="work-order-title">{job.title}</h3>
                        <div className="work-order-meta">
                          <span className="work-order-meta-item">
                            <MapPin size={14} />
                            Location: <strong>{job.location}</strong>
                          </span>
                          <span className="work-order-meta-item">
                            <Calendar size={14} />
                            Reported: <strong>{job.date} {job.time ? `(${job.time})` : ''}</strong>
                          </span>
                          <span className="work-order-meta-item">
                            <User size={14} />
                            Reporter: <strong>{job.reporter}</strong>
                          </span>
                        </div>
                      </div>

                      <span className={`work-order-status ${job.status === 'Resolved' ? 'resolved' : job.status === 'In Progress' ? 'in-progress' : 'open'}`}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="work-order-actions">
                      {job.status !== 'In Progress' && job.status !== 'Resolved' && (
                        <button
                          className="btn-start-repair"
                          onClick={() => onStatusChange(job.id, 'In Progress')}
                        >
                          <Zap size={16} /> Start Repair
                        </button>
                      )}
                      {job.status !== 'Resolved' && (
                        <button
                          className="btn-mark-resolved"
                          onClick={() => onStatusChange(job.id, 'Resolved')}
                        >
                          <CheckCircle2 size={16} /> Mark Resolved
                        </button>
                      )}
                      <button
                        className="btn-secondary-action"
                        onClick={() => setNoteModalIssue(job)}
                      >
                        <MessageSquare size={16} /> Repair Log
                      </button>
                      <button
                        className="btn-secondary-action"
                        onClick={() => onSelectIssue(job)}
                      >
                        <span>Full Details</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </div>

                    {/* Activity Logs */}
                    {job.activityLogs && job.activityLogs.length > 0 && (
                      <div className="activity-logs-section">
                        <div className="logs-header">
                          🔧 Technician Logs ({job.activityLogs.length})
                        </div>
                        <div className="logs-list">
                          {job.activityLogs.map((log: any, idx: number) => (
                            <div key={idx} className="log-item">
                              <span className="log-author">{log.createdBy?.name || 'Unknown'}</span>
                              {' '}
                              <span className="log-time">
                                ({new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })})
                              </span>
                              : {log.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {job.description && (
                      <div className="description-box">
                        <div className="description-label">STUDENT REPORT DESCRIPTION</div>
                        <p className="description-text">"{job.description}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Roster */}
        {activeTab === 'roster' && (
          <div role="tabpanel" id="roster-panel" className="tab-content-premium">
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red-bright)', letterSpacing: '0.8px', marginBottom: '8px' }}>
                {INSTITUTION_NAME} MAINTENANCE TEAM
              </p>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--txt)', marginBottom: '6px' }}>
                On-Duty Technician Roster
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--txt-muted)' }}>
                Active engineering technicians assigned across campus lab blocks.
              </p>
            </div>

            <div className="roster-grid-premium">
              {technicianRoster.map(tech => (
                <div key={tech.id} className="roster-card-premium">
                  <div className="roster-card-header">
                    <div className="roster-avatar-premium" style={{ background: tech.avatarColor }}>
                      {tech.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="roster-info">
                      <div className="roster-id-badge">{tech.id}</div>
                      <h3 className="roster-name-premium">{tech.name}</h3>
                      <div className="roster-title-premium">{tech.title}</div>
                    </div>
                  </div>

                  <div className="roster-details">
                    <div className="roster-detail-item">
                      <div className="roster-detail-label">Specialty</div>
                      <div className="roster-detail-value">{tech.specialty}</div>
                    </div>
                    <div className="roster-detail-item">
                      <div className="roster-detail-label">Shift Status</div>
                      <div className={`roster-detail-value status-${tech.status.toLowerCase().replace(' ', '-')}`}>
                        {tech.status}
                      </div>
                    </div>
                    <div className="roster-detail-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="roster-detail-label">Hotline Phone</div>
                      <div className="roster-detail-value" style={{ fontFamily: 'monospace' }}>{tech.phone}</div>
                    </div>
                  </div>

                  <button
                    className="btn-secondary-action"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
                    onClick={() => {
                      setSearchQuery(tech.name)
                      setActiveTab('workorders')
                    }}
                  >
                    Inspect {tech.name.split(' ')[0]}'s Queue
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Inventory */}
        {activeTab === 'spares' && (
          <div role="tabpanel" id="spares-panel" className="tab-content-premium">
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red-bright)', letterSpacing: '0.8px', marginBottom: '8px' }}>
                LAB MAINTENANCE REQUISITION
              </p>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--txt)', marginBottom: '6px' }}>
                Spare Parts & Hardware Inventory Stock
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--txt-muted)' }}>
                Hardware replacements available in central maintenance storage.
              </p>
            </div>

            <div className="inventory-table-container">
              <table className="inventory-table-premium">
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
                      <td>
                        <span className="work-order-tag tag-ticket-id">{part.id}</span>
                      </td>
                      <td>
                        <span className="inventory-item-name">{part.name}</span>
                      </td>
                      <td style={{ color: 'var(--txt-muted)' }}>{part.category}</td>
                      <td>
                        <span className="inventory-stock-badge">
                          {part.stock} {part.unit}
                        </span>
                      </td>
                      <td>
                        <span className={`inventory-status ${part.status.toLowerCase().replace(' ', '-')}`}>
                          {part.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-requisition"
                          onClick={() => {
                            setRequisitionModalPart(part)
                            setReqQuantity(1)
                            setReqReason('')
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
      </div>

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

      {/* Requisition Modal */}
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
