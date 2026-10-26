import React, { useState, useRef, useMemo } from 'react'
import './StudentDashboardPremium.css'
import useSWR from 'swr'
import {
  Plus, AlertTriangle, CheckCircle2, Clock3, Search, Filter,
  FileText, X, History, TrendingUp, Calendar, BarChart3, Monitor, QrCode,
  MapPin, Tag, BarChart2, Laptop, Send, Trash2
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import type { IssueRecord } from '../../services/api'
import {
  createIssueApi, fetcher,
  fetchLocationsApi, fetchCategoriesApi, fetchPrioritiesApi,
  fetchFaqsApi, fetchStudentProfileApi
} from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Avatar, AvatarImage, AvatarFallback,
  Tooltip, TooltipTrigger, TooltipContent
} from '../ui'

interface StudentDashboardProps {
  records: IssueRecord[]
  onAddRecord: (record: IssueRecord) => void
  onSelectIssue: (issue: IssueRecord) => void
}

export function StudentDashboard({ records, onAddRecord, onSelectIssue }: StudentDashboardProps) {
  const { user: authUser } = useAuth()
  
  const [profilePic, setProfilePic] = useState<string | null>(() => {
    return localStorage.getItem('ucare-student-avatar') || null
  })

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.currentTarget.click()
    }
  }

  const currentUser = authUser || { name: 'Student', email: 'student@example.com' }
  const { data: studentProfileData } = useSWR('/metadata/student-profile', fetchStudentProfileApi)
  
  const student = {
    name: currentUser.name || 'Student User',
    rollNo: studentProfileData?.rollNo || '—',
    batch: studentProfileData?.batch || '—',
    batchCode: studentProfileData?.batchCode || '—',
    branch: studentProfileData?.branch || '—',
  }

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'report' | 'history'>('overview')

  // Form state for report tab
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [assetId, setAssetId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  
  const { data: locations = [] } = useSWR('/metadata/locations', fetchLocationsApi)
  const { data: categories = [] } = useSWR('/metadata/categories', fetchCategoriesApi)
  const { data: priorities = [] } = useSWR('/metadata/priorities', fetchPrioritiesApi)
  const { data: faqs = [] } = useSWR('/metadata/faqs', fetchFaqsApi)

  const isMineTicket = (r: IssueRecord) => {
    const reporterLower = r.reporter.toLowerCase()
    return reporterLower.includes(student.name.toLowerCase()) ||
           reporterLower.includes(student.rollNo.toLowerCase()) ||
           r.reporter.includes(student.batchCode)
  }

  const myAllTickets = records.filter(isMineTicket)
  
  const studentTickets = myAllTickets.filter(r => {
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.ticketId || r.id).toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalCount = myAllTickets.length
  const inProgressCount = myAllTickets.filter(r => r.status === 'In Progress').length
  const openCount = myAllTickets.filter(r => r.status === 'Open').length
  const resolvedCount = myAllTickets.filter(r => r.status === 'Resolved').length

  // Analytics calculations for history tab
  const analyticsData = useMemo(() => {
    const resolvedTickets = myAllTickets.filter(r => r.status === 'Resolved')
    
    // Calculate average resolution time
    let avgResolutionTime = 0
    if (resolvedTickets.length > 0) {
      const resolutionTimes = resolvedTickets
        .map(ticket => {
          if (!ticket.createdAt || !ticket.resolvedAt) return null
          const reported = new Date(ticket.createdAt).getTime()
          const resolved = new Date(ticket.resolvedAt).getTime()
          return (resolved - reported) / (1000 * 60 * 60 * 24) // days
        })
        .filter((time): time is number => time !== null && time >= 0)
      
      if (resolutionTimes.length > 0) {
        avgResolutionTime = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      }
    }

    // Group tickets by month
    const ticketsByMonth: Record<string, number> = {}
    myAllTickets.forEach(ticket => {
      if (ticket.createdAt) {
        const date = new Date(ticket.createdAt)
        if (!Number.isFinite(date.getTime())) return
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        ticketsByMonth[monthKey] = (ticketsByMonth[monthKey] || 0) + 1
      }
    })

    const monthlyData = Object.entries(ticketsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, count]) => {
        const [, monthNum] = month.split('-')
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return {
          month: monthNames[parseInt(monthNum) - 1],
          count
        }
      })

    // Group by category
    const categoryBreakdown: Record<string, number> = {}
    myAllTickets.forEach(ticket => {
      if (ticket.category) {
        categoryBreakdown[ticket.category] = (categoryBreakdown[ticket.category] || 0) + 1
      }
    })

    const categoryData = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name,
      value
    }))

    return {
      totalTickets: totalCount,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      monthlyData,
      categoryData,
      hasData: myAllTickets.length > 0
    }
  }, [myAllTickets, totalCount])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setProfilePic(dataUrl)
      localStorage.setItem('ucare-student-avatar', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Show validation errors
    setShowValidation(true)
    
    if (!title.trim() || !location || !category) {
      alert('Please fill required fields: Title, Location, Category')
      return
    }

    setIsSubmitting(true)
    try {
      const newIssue = await createIssueApi({
        title: title.trim(),
        description: description.trim() || 'No additional details provided.',
        category,
        location,
        priority: (priority || 'Medium') as 'Critical' | 'High' | 'Medium' | 'Low',
        id: assetId || undefined,
        reporter: `${student.name} (${student.rollNo})`
      })
      
      if (!newIssue) {
        throw new Error('Failed to create incident')
      }
      
      onAddRecord(newIssue)
      
      // Reset form
      setTitle('')
      setDescription('')
      setLocation('')
      setCategory('')
      setPriority('')
      setAssetId('')
      setShowValidation(false)
      
      // Switch to overview
      setActiveTab('overview')
      setFilterStatus('All')
      
      alert('✅ Incident reported successfully!')
    } catch (err) {
      console.error('Failed to create incident:', err)
      alert('❌ Failed to submit incident. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="student-dashboard-premium">
      <input type="file" ref={avatarInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />

      {/* Hero Profile Card */}
      <div className="student-hero-premium">
        <div className="student-profile-section">
          <div className="student-avatar-container">
            <div className="student-avatar-premium">
              {profilePic ? (
                <img src={profilePic} alt={student.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                student.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="student-online-indicator" />
          </div>

          <div className="student-info-premium">
            <div className="student-badges-row">
              <span className="student-badge-premium badge-portal">STUDENT PORTAL</span>
              <span className="student-badge-premium badge-batch">{student.batch}</span>
            </div>
            <h1 className="student-name-premium">{student.name}</h1>
            <p className="student-meta-premium">
              Roll No: <strong>{student.rollNo}</strong> · {student.branch} · Batch {student.batchCode}
            </p>
          </div>
        </div>

        <div className="student-actions-premium">
          <button className="btn-incident-premium" onClick={() => setActiveTab('report')}>
            <Plus size={18} />
            Log Incident Ticket
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid-premium">
        {[
          { 
            label: 'Total Reports', 
            value: totalCount, 
            icon: FileText, 
            color: 'red', 
            accentColor: '#F5222D',
            filter: 'All', 
            badge: 'My Ledger', 
            subtitle: 'Total reports raised by you' 
          },
          { 
            label: 'In Repair / SLA', 
            value: inProgressCount, 
            icon: Clock3, 
            color: 'amber', 
            accentColor: '#F59E0B',
            filter: 'In Progress', 
            badge: 'Active Fix', 
            subtitle: 'Currently under maintenance' 
          },
          { 
            label: 'Open Pending', 
            value: openCount, 
            icon: AlertTriangle, 
            color: 'blue', 
            accentColor: '#3B82F6',
            filter: 'Open', 
            badge: 'Queued', 
            subtitle: 'Not yet resolved' 
          },
          { 
            label: 'Resolved & Fixed', 
            value: resolvedCount, 
            icon: CheckCircle2, 
            color: 'green', 
            accentColor: '#22C55E',
            filter: 'Resolved', 
            badge: 'Complete', 
            subtitle: 'Successfully resolved' 
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
              onClick={() => { setFilterStatus(metric.filter as any); setActiveTab('overview') }}
              style={{ color: metric.accentColor }}
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
              className={`tab-trigger-premium ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
              role="tab"
              aria-selected={activeTab === 'overview'}
              aria-controls="overview-panel"
            >
              <FileText size={22} strokeWidth={2.5} />
              <span>My Active Tickets ({studentTickets.length})</span>
            </button>
            <button
              className={`tab-trigger-premium ${activeTab === 'report' ? 'active' : ''}`}
              onClick={() => setActiveTab('report')}
              role="tab"
              aria-selected={activeTab === 'report'}
              aria-controls="report-panel"
            >
              <Plus size={22} strokeWidth={2.5} />
              <span>Log Incident</span>
            </button>
            <button
              className={`tab-trigger-premium ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
              role="tab"
              aria-selected={activeTab === 'history'}
              aria-controls="history-panel"
            >
              <History size={22} strokeWidth={2.5} />
              <span>My Ticket History</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div role="tabpanel" id="overview-panel" aria-labelledby="overview-tab">
            {/* Search and Filter */}
            <div className="search-filter-toolbar">
              <div className="search-input-premium">
                <Search size={18} className="search-icon-premium" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search ticket title, lab room, or ID..."
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

            {/* Empty State or Ticket List */}
            {studentTickets.length === 0 ? (
              <div className="empty-state-premium">
                <div className="empty-icon-container">
                  <FileText size={48} className="empty-icon-premium" />
                </div>
                <h3 className="empty-heading-premium">No tickets found</h3>
                <p className="empty-text-premium">
                  Found 0 reported complaints matching your active filter.
                </p>
                <button className="btn-cta-premium" onClick={() => setActiveTab('report')}>
                  <Plus size={18} />
                  Log Incident Report Now
                </button>
              </div>
            ) : (
              <div className="tickets-list-premium">
                {studentTickets.map((ticket, idx) => (
                  <div
                    key={ticket.id || idx}
                    className="ticket-card-premium"
                    role="button"
                    tabIndex={0}
                    onKeyDown={handleCardKeyDown}
                    onClick={() => onSelectIssue(ticket)}
                  >
                    <div className="ticket-header-premium">
                      <div className="ticket-id-premium">
                        {ticket.ticketId || ticket.id}
                      </div>
                      <span className={`ticket-status-badge-premium status-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                        {ticket.status}
                      </span>
                    </div>
                    
                    <h4 className="ticket-title-premium">{ticket.title}</h4>
                    
                    <div className="ticket-meta-row">
                      <span className="ticket-meta-item">
                        <Monitor size={14} />
                        {ticket.location || 'Lab'}
                      </span>
                      <span className="ticket-meta-item">
                        <AlertTriangle size={14} />
                        {ticket.category || 'Issue'}
                      </span>
                      <span className="ticket-meta-item">
                        <Clock3 size={14} />
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ticket.date}
                      </span>
                    </div>

                    {ticket.priority && (
                      <div className={`ticket-priority-premium priority-${ticket.priority.toLowerCase()}`}>
                        Priority: {ticket.priority}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'report' && (
          <div role="tabpanel" id="report-panel" aria-labelledby="report-tab">
            <div className="report-form-premium">
              <div className="report-form-header">
                <div className="report-header-content">
                  <h3>Log New Incident Report</h3>
                  <p>Fill out the details below to submit a maintenance request</p>
                </div>
              </div>

              <form onSubmit={handleSubmitIncident}>
                <div className="form-grid-premium">
                  <div className="form-field-premium">
                    <label className="form-label-premium">
                      Incident Title <span className="required-star">*</span>
                    </label>
                    <div className="form-input-wrapper">
                      <FileText className="form-field-icon" size={20} />
                      <input
                        type="text"
                        className={`form-input-premium with-icon ${showValidation && !title.trim() ? 'form-error' : ''}`}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g., Monitor not working at Station 12"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field-premium">
                    <label className="form-label-premium">
                      Location / Lab Room <span className="required-star">*</span>
                    </label>
                    <div className="form-input-wrapper">
                      <MapPin className="form-field-icon" size={20} />
                      <select
                        className={`form-select-premium with-icon ${showValidation && !location ? 'form-error' : ''}`}
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        required
                      >
                        <option value="">Select lab location</option>
                        {locations.map((loc) => (
                          <option key={loc.value} value={loc.value}>{loc.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-field-premium">
                    <label className="form-label-premium">
                      Category <span className="required-star">*</span>
                    </label>
                    <div className="form-input-wrapper">
                      <Tag className="form-field-icon" size={20} />
                      <select
                        className={`form-select-premium with-icon ${showValidation && !category ? 'form-error' : ''}`}
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        required
                      >
                        <option value="">Select issue category</option>
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-field-premium">
                    <label className="form-label-premium">Priority Level</label>
                    <div className="form-input-wrapper">
                      <BarChart2 className="form-field-icon" size={20} />
                      <select
                        className="form-select-premium with-icon"
                        value={priority}
                        onChange={e => setPriority(e.target.value)}
                      >
                        <option value="">Select priority (optional)</option>
                        {priorities.map((pri) => (
                          <option key={pri.value} value={pri.value}>{pri.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-field-premium form-field-full">
                    <label className="form-label-premium">Asset ID / Workstation No.</label>
                    <div className="form-input-wrapper">
                      <Laptop className="form-field-icon" size={20} />
                      <input
                        type="text"
                        className="form-input-premium with-icon"
                        value={assetId}
                        onChange={e => setAssetId(e.target.value)}
                        placeholder="e.g., WS-101, MON-23 (optional)"
                      />
                    </div>
                  </div>

                  <div className="form-field-premium form-field-full">
                    <label className="form-label-premium">Detailed Description</label>
                    <textarea
                      className="form-textarea-premium"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Provide additional details about the issue..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="form-actions-premium">
                  <button
                    type="button"
                    className="btn-secondary-premium"
                    onClick={() => {
                      setTitle('')
                      setDescription('')
                      setLocation('')
                      setCategory('')
                      setPriority('')
                      setAssetId('')
                      setShowValidation(false)
                    }}
                    disabled={isSubmitting}
                  >
                    <Trash2 size={18} />
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    className="btn-submit-premium"
                    disabled={isSubmitting}
                  >
                    <Send size={18} />
                    {isSubmitting ? 'Submitting...' : 'Submit Incident Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div role="tabpanel" id="history-panel" aria-labelledby="history-tab">
            <div className="history-section-premium">
            {/* Analytics Insights */}
            {analyticsData.hasData ? (
              <>
                <div className="analytics-grid-premium">
                  {/* Metrics Row */}
                  <div className="analytics-metric-card">
                    <div className="analytics-metric-icon" style={{ background: 'rgba(245, 34, 45, 0.1)', color: '#F5222D' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="analytics-metric-label">Total Complaints</div>
                      <div className="analytics-metric-value">{analyticsData.totalTickets}</div>
                      <div className="analytics-metric-subtitle">All time submissions</div>
                    </div>
                  </div>

                  <div className="analytics-metric-card">
                    <div className="analytics-metric-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
                      <Clock3 size={20} />
                    </div>
                    <div>
                      <div className="analytics-metric-label">Avg Resolution Time</div>
                      <div className="analytics-metric-value">
                        {analyticsData.avgResolutionTime > 0 
                          ? `${analyticsData.avgResolutionTime} days` 
                          : 'N/A'}
                      </div>
                      <div className="analytics-metric-subtitle">
                        {resolvedCount > 0 ? `Based on ${resolvedCount} resolved tickets` : 'No resolved tickets yet'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="charts-grid-premium">
                  {/* Reports Over Time */}
                  {analyticsData.monthlyData.length > 0 && (
                    <div className="chart-card-premium">
                      <div className="chart-header-premium">
                        <div>
                          <h4>Reports Over Time</h4>
                          <p>Monthly complaint submissions (last 6 months)</p>
                        </div>
                        <TrendingUp size={20} color="#F5222D" />
                      </div>
                      <div style={{ width: '100%', height: '250px' }}>
                        <ResponsiveContainer>
                          <BarChart data={analyticsData.monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis 
                              dataKey="month" 
                              stroke="#64748B"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                              stroke="#64748B"
                              style={{ fontSize: '12px' }}
                              allowDecimals={false}
                            />
                            <RechartsTooltip 
                              contentStyle={{ 
                                background: 'white', 
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Bar dataKey="count" fill="#F5222D" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Category Breakdown */}
                  {analyticsData.categoryData.length > 0 && (
                    <div className="chart-card-premium">
                      <div className="chart-header-premium">
                        <div>
                          <h4>Issue Category Breakdown</h4>
                          <p>Distribution of reported issues by type</p>
                        </div>
                        <BarChart3 size={20} color="#F5222D" />
                      </div>
                      <div style={{ width: '100%', height: '250px' }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={analyticsData.categoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {analyticsData.categoryData.map((_entry, index) => {
                                const colors = ['#F5222D', '#F59E0B', '#3B82F6', '#22C55E', '#8B5CF6', '#EC4899']
                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              })}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ 
                                background: 'white', 
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36}
                              wrapperStyle={{ fontSize: '12px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* Historical Tickets List */}
                <div className="history-list-header">
                  <h4>Complete Ticket History</h4>
                  <p>All your reported complaints and their current status</p>
                </div>

                <div className="tickets-list-premium">
                  {myAllTickets
                    .sort((a, b) => (Date.parse(b.createdAt || '') || 0) - (Date.parse(a.createdAt || '') || 0))
                    .map((ticket, idx) => (
                      <div
                        key={ticket.id || idx}
                        className="ticket-card-premium"
                        role="button"
                        tabIndex={0}
                        onKeyDown={handleCardKeyDown}
                        onClick={() => onSelectIssue(ticket)}
                      >
                        <div className="ticket-header-premium">
                          <div className="ticket-id-premium">
                            {ticket.ticketId || ticket.id}
                          </div>
                          <span className={`ticket-status-badge-premium status-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                            {ticket.status}
                          </span>
                        </div>
                        
                        <h4 className="ticket-title-premium">{ticket.title}</h4>
                        
                        <div className="ticket-meta-row">
                          <span className="ticket-meta-item">
                            <FileText size={14} />
                            {ticket.category || 'General'}
                          </span>
                          <span className="ticket-meta-item">
                            <AlertTriangle size={14} />
                            {ticket.location || 'Lab'}
                          </span>
                          <span className="ticket-meta-item">
                            <Calendar size={14} />
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ticket.date}
                          </span>
                        </div>

                        {ticket.status === 'Resolved' && ticket.resolvedAt && (
                          <div className="ticket-resolution-info">
                            <CheckCircle2 size={14} />
                            Resolved on {new Date(ticket.resolvedAt).toLocaleDateString()}
                          </div>
                        )}

                        {ticket.priority && (
                          <div className={`ticket-priority-premium priority-${ticket.priority.toLowerCase()}`}>
                            Priority: {ticket.priority}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="empty-state-premium">
                <div className="empty-icon-container">
                  <History size={48} className="empty-icon-premium" />
                </div>
                <h3 className="empty-heading-premium">No ticket history</h3>
                <p className="empty-text-premium">
                  You haven't submitted any complaints yet. Log your first incident to get started.
                </p>
                <button className="btn-cta-premium" onClick={() => setActiveTab('report')}>
                  <Plus size={18} />
                  Log Your First Incident
                </button>
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  )
}
