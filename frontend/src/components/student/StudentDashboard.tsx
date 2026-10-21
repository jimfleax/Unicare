import React, { useState, useRef, useEffect } from 'react'
import { INSTITUTION_NAME } from '../../config/branding'
import useSWR from 'swr'
import {
  QrCode, Plus, AlertTriangle, CheckCircle2, Clock3, Search, Filter,
  ShieldCheck, Zap, User, Camera, Upload, RefreshCw, MessageSquare,
  Monitor, Sparkles, HelpCircle, Check, FileText, Calendar, X
} from 'lucide-react'
import type { IssueRecord } from '../../services/api'
import { 
  createIssueApi, 
  fetcher,
  fetchLocationsApi,
  fetchCategoriesApi,
  fetchPrioritiesApi,
  fetchFaqsApi,
  fetchStudentProfileApi
} from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Avatar, AvatarImage, AvatarFallback,
  Tooltip, TooltipTrigger, TooltipContent,
  Button
} from '../ui'

interface StudentDashboardProps {
  records: IssueRecord[]
  onAddRecord: (record: IssueRecord) => void
  onSelectIssue: (issue: IssueRecord) => void
}

interface WorkstationNode {
  id: string
  name: string
  location: string
  category: string
  status: 'Operational' | 'Degraded' | 'Faulty'
  lastChecked: string
  specs: string
}

export function StudentDashboard({ records, onAddRecord, onSelectIssue }: StudentDashboardProps) {
  const { user: authUser } = useAuth()
  
  // Student Profile State with custom uploaded picture
  const [profilePic, setProfilePic] = useState<string | null>(() => {
    return localStorage.getItem('ucare-student-avatar') || null
  })

  const currentUser = authUser || { name: 'Student', email: 'student@example.com' };

  const { data: studentProfileData, error: profileError } = useSWR('/metadata/student-profile', fetchStudentProfileApi)
  
  const student = {
    name: currentUser.name || 'Student',
    rollNo: studentProfileData?.rollNo || '—',
    batch: studentProfileData?.batch || '—',
    batchCode: studentProfileData?.batchCode || '—',
    branch: studentProfileData?.branch || '—',
  }


  const { data: assets } = useSWR('/assets', fetcher)
  const activeWorkstations: WorkstationNode[] = assets ? assets.map((a: any) => ({
    id: a.tagId || a.id || a._id || 'Unknown',
    name: a.name || 'Unknown Asset',
    location: a.location || 'Unknown',
    category: a.category || 'Asset',
    status: a.status || 'Operational',
    lastChecked: (() => {
      const raw = a.updatedAt || a.lastServiceDate
      const d = raw ? new Date(raw) : null
      return d && !isNaN(d.getTime()) ? d.toLocaleDateString() : '—'
    })(),
    specs: a.specs || a.description || 'Standard Spec'
  })) : []

  const { data: locations = [], error: locationsError } = useSWR('/metadata/locations', fetchLocationsApi)
  const { data: categories = [], error: categoriesError } = useSWR('/metadata/categories', fetchCategoriesApi)
  const { data: priorities = [], error: prioritiesError } = useSWR('/metadata/priorities', fetchPrioritiesApi)
  const { data: faqs = [], error: faqsError } = useSWR('/metadata/faqs', fetchFaqsApi)
  const metaError = profileError || locationsError || categoriesError || prioritiesError
  const metaLoading = !metaError && (locations.length === 0 || categories.length === 0 || priorities.length === 0)


  // Profile image upload handler
  const avatarInputRef = useRef<HTMLInputElement>(null)
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

  const removeAvatar = () => {
    setProfilePic(null)
    localStorage.removeItem('ucare-student-avatar')
  }

  // Filter state for student's tickets
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'report' | 'workstations' | 'faq'>('overview')

  // Quick Report Form State
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('' as any)
  useEffect(() => { if (!location && locations.length) setLocation(locations[0].value) }, [locations, location])
  useEffect(() => { if (!category && categories.length) setCategory(categories[0].value) }, [categories, category])
  useEffect(() => { if (!priority && priorities.length) setPriority(priorities[0].value as any) }, [priorities, priority])
  const [description, setDescription] = useState('')
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null)

  // Scanner state inside widget
  const [isCameraOn, setIsCameraOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter student's tickets
  const isMineTicket = (r: IssueRecord) => {
    const reporterLower = r.reporter.toLowerCase();
    return reporterLower.includes(student.name.toLowerCase()) || 
           reporterLower.includes(student.rollNo.toLowerCase()) || 
           r.reporter.includes(student.batchCode);
  };

  const studentTickets = records.filter(r => {
    if (!isMineTicket(r)) return false;

    const matchesStatus = filterStatus === 'All' || r.status === filterStatus
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.ticketId || r.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Counts
  const totalCount = records.filter(isMineTicket).length
  const inProgressCount = records.filter(r => isMineTicket(r) && r.status === 'In Progress').length
  const openCount = records.filter(r => isMineTicket(r) && r.status === 'Open').length
  const resolvedCount = records.filter(r => isMineTicket(r) && r.status === 'Resolved').length

  // Quick report handler
  const handleQuickReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)

    const now = new Date()
    const formattedDate = now.toISOString().split('T')[0]
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })

    const payload = {
      title,
      location,
      category,
      priority,
      status: 'Open' as const,
      assignee: 'Unassigned',
      reporter: `${student.name} (${student.batch} · ${student.rollNo})`,
      date: formattedDate,
      time: formattedTime,
      description: description || `Reported via Student Dashboard on ${formattedDate} at ${formattedTime}.` + (attachedFileName ? ` (Attached: ${attachedFileName})` : '')
    }

    // Call API
    const result = await createIssueApi(payload)

    const finalRecord: IssueRecord = result || {
      id: scannedCode ? `UC-${scannedCode}` : `UC-${Math.floor(1000 + Math.random() * 9000)}`,
      ...payload
    }

    onAddRecord(finalRecord)
    setIsSubmitting(false)
    setSubmitSuccess(true)

    // Reset Form after delay
    setTimeout(() => {
      setTitle('')
      setDescription('')
      setScannedCode(null)
      setAttachedFileName(null)
      setSubmitSuccess(false)
      setActiveTab('overview')
    }, 1800)
  }

  // Camera scanner control
  const startCamera = async () => {
    setIsCameraOn(true);
    // Reset any previous stream
    if (videoRef.current && videoRef.current.srcObject) {
      const oldStream = videoRef.current.srcObject as MediaStream;
      oldStream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    try {
      const constraints = { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera error:', err);
      setIsCameraOn(false);
      alert('Unable to access camera. Please check permissions and device availability.');
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraOn(false)
  }

  const handlePrefillFaultReport = (ws: WorkstationNode) => {
    setScannedCode(ws.id)
    setTitle(`Workstation ${ws.id} Signal Drop`)
    setLocation(ws.location)
    setCategory(ws.category)
    setDescription(`Automated complaint registered for ${ws.name} (${ws.specs}). Location: ${ws.location}. Condition: ${ws.status}.`)
    setActiveTab('report')
  }

  return (
    <div className="student-dashboard-container">
      {/* Hidden file input for uploading profile picture */}
      <input
        type="file"
        ref={avatarInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarUpload}
      />

      {/* ── 1. Student Hero Profile Banner ────────────────────────────── */}
      <div className="student-hero-card">
        <div className="student-hero-content">
          {/* Profile Avatar with Photo Upload Button */}
          <div className="student-avatar-ring">
            <Avatar className="student-avatar-inner" style={{ width: '84px', height: '84px' }}>
              {profilePic ? (
                <AvatarImage src={profilePic} alt={student.name} className="student-profile-img" />
              ) : null}
              <AvatarFallback style={{ background: 'var(--bg-card-alt)', color: 'var(--red-bright)', display: 'grid', placeItems: 'center', width: '100%', height: '100%' }}>
                <User size={34} color="var(--red-bright)" />
              </AvatarFallback>
            </Avatar>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="student-avatar-upload-btn"
                  onClick={() => avatarInputRef.current?.click()}
                  aria-label="Add / Change Profile Picture"
                >
                  <Camera size={13} color="#ffffff" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Add / Change Profile Picture</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="student-online-dot" aria-label="Active on Ucare Grid"></span>
              </TooltipTrigger>
              <TooltipContent>Active on Ucare Grid</TooltipContent>
            </Tooltip>
          </div>

          <div className="student-details">
            <div className="student-badge-row">
              <span className="badge-role-tag">STUDENT PORTAL</span>
              <span className="badge-role-tag" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>{student.batch}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <h1 className="student-name">{student.name}</h1>
              {profilePic && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="btn-remove-avatar" onClick={removeAvatar} aria-label="Remove Custom Picture">
                      <X size={12} /> Clear Pic
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Remove Custom Picture</TooltipContent>
                </Tooltip>
              )}
            </div>

            <p className="student-meta">
              Roll No: <strong>{student.rollNo}</strong> · {student.branch} · <span className="batch-meta-tag">Batch {student.batchCode}</span>
            </p>
          </div>
        </div>

        <div className="student-hero-actions">
          <button
            className={`btn-student-action ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'report' ? 'overview' : 'report')}
          >
            <Plus size={16} /> Log Incident Ticket
          </button>
          <button
            className={`btn-student-secondary ${activeTab === 'workstations' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'workstations' ? 'overview' : 'workstations')}
          >
            <Monitor size={16} /> Workstation Grid
          </button>
        </div>
      </div>

      {/* ── 2. Sleek Stat Overview Grid ───────────────────────────────── */}
      <div className="student-stats-row">
        <div className={`student-stat-card ${filterStatus === 'All' ? 'selected' : ''}`} onClick={() => { setFilterStatus('All'); setActiveTab('overview'); }}>
          <div className="stat-icon-wrap bg-red-dim">
            <FileText size={20} color="var(--red-bright)" />
          </div>
          <div style={{ flex: 1 }}>
            <span className="stat-label">Total Reports</span>
            <h3 className="stat-value">{totalCount}</h3>
          </div>
          <span className="stat-trend-badge">My Ledger</span>
        </div>

        <div className={`student-stat-card ${filterStatus === 'In Progress' ? 'selected' : ''}`} onClick={() => { setFilterStatus('In Progress'); setActiveTab('overview'); }}>
          <div className="stat-icon-wrap bg-amber-dim">
            <Clock3 size={20} color="var(--amber-txt)" />
          </div>
          <div style={{ flex: 1 }}>
            <span className="stat-label">In Repair / SLA</span>
            <h3 className="stat-value text-amber">{inProgressCount}</h3>
          </div>
          <span className="stat-trend-badge amber">Active Fix</span>
        </div>

        <div className={`student-stat-card ${filterStatus === 'Open' ? 'selected' : ''}`} onClick={() => { setFilterStatus('Open'); setActiveTab('overview'); }}>
          <div className="stat-icon-wrap bg-blue-dim">
            <AlertTriangle size={20} color="#60a5fa" />
          </div>
          <div style={{ flex: 1 }}>
            <span className="stat-label">Open Pending</span>
            <h3 className="stat-value text-blue">{openCount}</h3>
          </div>
          <span className="stat-trend-badge blue">Queued</span>
        </div>

        <div className={`student-stat-card ${filterStatus === 'Resolved' ? 'selected' : ''}`} onClick={() => { setFilterStatus('Resolved'); setActiveTab('overview'); }}>
          <div className="stat-icon-wrap bg-green-dim">
            <CheckCircle2 size={20} color="var(--green-txt)" />
          </div>
          <div style={{ flex: 1 }}>
            <span className="stat-label">Resolved &amp; Fixed</span>
            <h3 className="stat-value text-green">{resolvedCount}</h3>
          </div>
          <span className="stat-trend-badge green">Complete</span>
        </div>
      </div>

      {/* ── 3. Quick Action Tab Selector ─────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="student-tabs-wrapper">
        <TabsList className="student-tabs-nav">
          <TabsTrigger
            value="overview"
            className={`student-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <FileText size={15} /> My Active Tickets ({studentTickets.length})
          </TabsTrigger>
          <TabsTrigger
            value="report"
            className={`student-tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          >
            <QrCode size={15} /> Log Incident / QR Scan
          </TabsTrigger>
          <TabsTrigger
            value="workstations"
            className={`student-tab-btn ${activeTab === 'workstations' ? 'active' : ''}`}
          >
            <Monitor size={15} /> Workstation Health Grid
          </TabsTrigger>
          <TabsTrigger
            value="faq"
            className={`student-tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
          >
            <HelpCircle size={15} /> SLAs &amp; Care Guidelines
          </TabsTrigger>
        </TabsList>

        {/* ── 4. Main Tab View Panels ───────────────────────────────────── */}

        {/* TAB 1: OVERVIEW & MY REPORTED TICKETS */}
        <TabsContent value="overview">
        <div className="student-section" style={{ padding: '0', background: 'transparent' }}>
          {/* Modern Toolbar with Search & Filter Pills */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Search Bar */}
            <div style={{
              position: 'relative',
              maxWidth: '400px'
            }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--txt-muted)',
                pointerEvents: 'none'
              }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ticket title, lab room, or ID..."
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 44px',
                  background: 'rgba(18, 18, 21, 0.5)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  color: 'var(--txt)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.25s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(220, 38, 38, 0.4)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--txt-sub)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--txt-muted)',
                fontSize: '13px',
                fontWeight: 600
              }}>
                <Filter size={14} />
                Filter:
              </div>
              {(['All', 'Open', 'In Progress', 'Resolved'] as const).map(st => (
                <button
                  key={st}
                  className={`chip-btn ${filterStatus === st ? 'active' : ''}`}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: filterStatus === st ? '#dc2626' : 'rgba(255, 255, 255, 0.05)',
                    color: filterStatus === st ? '#ffffff' : 'var(--txt-muted)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    if (filterStatus !== st) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.currentTarget.style.color = 'var(--txt)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filterStatus !== st) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.currentTarget.style.color = 'var(--txt-muted)'
                    }
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Cards List or Empty State */}
          {studentTickets.length === 0 ? (
            <div style={{
              padding: '80px 40px',
              textAlign: 'center',
              background: 'rgba(18, 18, 21, 0.3)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                background: 'rgba(220, 38, 38, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <FileText size={36} color="var(--red-bright)" />
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  border: '2px dashed rgba(220, 38, 38, 0.3)',
                  borderRadius: '50%',
                  animation: 'spin 20s linear infinite'
                }} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--txt)',
                marginBottom: '8px'
              }}>
                No tickets found
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--txt-muted)',
                marginBottom: '24px'
              }}>
                Found 0 reported complaints matching your active filter.
              </p>
              <Button
                onClick={() => setActiveTab('report')}
                className="bg-red-500 hover:bg-red-600 text-white shadow-lg"
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                <Plus size={16} style={{ marginRight: '8px' }} />
                Log Incident Report Now
              </Button>
            </div>
          ) : (
            <div className="student-ticket-list">
              {studentTickets.map(ticket => {
                const step = ticket.status === 'Open' ? 1 : ticket.status === 'In Progress' ? 2 : 3

                return (
                  <div key={ticket.id} className="student-ticket-card">
                    <div className="ticket-card-header">
                      <div>
                        <div className="ticket-tag-row">
                          <span className="ticket-id-tag">{ticket.ticketId || ticket.id}</span>
                          <span className="ticket-batch-tag">{student.batch}</span>
                          <span className="ticket-category-tag">{ticket.category || 'Desktop & Display'}</span>
                          <span className={`badge-priority ${ticket.priority.toLowerCase()}`}>{ticket.priority} Priority</span>
                        </div>

                        {/* Title without subject names */}
                        <h3 className="ticket-title">{ticket.title}</h3>

                        {/* Explicit Date & Time Reported Display */}
                        <div className="ticket-date-time-strip">
                          <span className="date-pill">
                            <Calendar size={13} color="var(--red-bright)" />
                            Reported Date: <strong>{ticket.date}</strong>
                          </span>
                          {ticket.time && (
                            <span className="time-pill">
                              <Clock3 size={13} color="var(--amber-txt)" />
                              Time: <strong>{ticket.time}</strong>
                            </span>
                          )}
                          <span className="location-pill">
                            📍 Location: <strong>{ticket.location}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="ticket-status-badge-wrap">
                        <span className={`badge-status ${ticket.status === 'Resolved' ? 'available' : ticket.status === 'In Progress' ? 'in-progress' : 'critical'}`}>
                          {ticket.status === 'Resolved' && <CheckCircle2 size={13} />}
                          {ticket.status === 'In Progress' && <Clock3 size={13} />}
                          {ticket.status === 'Open' && <AlertTriangle size={13} />}
                          {ticket.status.toUpperCase()}
                        </span>
                        <button
                          className="btn-dark"
                          style={{ fontSize: '0.8rem', padding: '6px 14px', marginTop: '12px' }}
                          onClick={() => onSelectIssue(ticket)}
                        >
                          View Log ↗
                        </button>
                      </div>
                    </div>

                    {/* Precision Aligned Step Progress Tracker */}
                    <div className="ticket-timeline-wrapper">
                      <div className="timeline-track">
                        <div className={`timeline-progress step-${step}`}></div>
                      </div>

                      <div className="timeline-nodes-grid">
                        <div className={`timeline-node ${step >= 1 ? 'completed' : ''}`}>
                          <div className="node-icon">{step >= 1 ? <Check size={12} /> : '1'}</div>
                          <span className="node-title">Report Filed</span>
                          <small className="node-time">{ticket.date} {ticket.time ? `(${ticket.time})` : ''}</small>
                        </div>

                        <div className={`timeline-node ${step >= 2 ? 'completed' : ''}`}>
                          <div className="node-icon">{step >= 2 ? <Check size={12} /> : '2'}</div>
                          <span className="node-title">Tech Assigned</span>
                          <small className="node-time">{ticket.assignee !== 'Unassigned' ? ticket.assignee : 'Awaiting Triage'}</small>
                        </div>

                        <div className={`timeline-node ${step >= 3 ? 'completed' : ''}`}>
                          <div className="node-icon">{step >= 3 ? <Check size={12} /> : '3'}</div>
                          <span className="node-title">Repaired &amp; Resolved</span>
                          <small className="node-time">{ticket.status === 'Resolved' ? 'Verified Ready' : 'In Repair Queue'}</small>
                        </div>
                      </div>
                    </div>

                    {ticket.description && (
                      <div className="ticket-desc-snippet">
                        <MessageSquare size={14} color="var(--txt-sub)" />
                        <span>"{ticket.description}"</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </TabsContent>

      {/* TAB 2: INSTANT INCIDENT REPORTER */}
      <TabsContent value="report">
        <div className="student-section">
          <div className="portal-card" style={{ maxWidth: '840px', margin: '0 auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--red-bright)', fontWeight: 700, letterSpacing: '1px' }}>
                  {INSTITUTION_NAME} CAMPUS LAB DISPATCH
                </span>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--txt)', marginTop: '4px' }}>Log Lab Equipment Incident</h2>
                <p style={{ color: 'var(--txt-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
                  Register hardware issues. Timestamp and reporting student batch details are auto-logged.
                </p>
              </div>

              {scannedCode && (
                <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--green-txt)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} /> Tag #{scannedCode} Loaded
                </div>
              )}
            </div>

            {submitSuccess ? (
              <div className="student-success-banner">
                <CheckCircle2 size={52} color="var(--green-txt)" />
                <h3 style={{ fontSize: '1.4rem', color: 'var(--txt)', marginTop: '12px' }}>Incident Report Dispatched Successfully!</h3>
                <p style={{ color: 'var(--txt-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                  Ticket queued for lab technicians. Real-time progress is visible on your Student Dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuickReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Embedded QR / Barcode Quick Tool */}
                <div className="scanner-quick-strip">
                  <div>
                    <b style={{ color: 'var(--txt)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <QrCode size={16} color="var(--red-bright)" /> Quick Desk Tag Scanner
                    </b>
                    <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>
                      Scan barcode to load station specs and location automatically.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {isCameraOn ? (
                      <button type="button" className="btn-red" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={stopCamera}>
                        Close Camera
                      </button>
                    ) : (
                      <button type="button" className="btn-dark" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={startCamera}>
                        <Camera size={14} /> Open Camera
                      </button>
                    )}
                  </div>
                </div>

                {isCameraOn && (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--red-border)', height: '200px', background: '#000', position: 'relative' }}>
                    <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay playsInline muted />
                    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff', fontSize: '0.82rem', background: 'rgba(0,0,0,0.3)' }}>
                      Point camera at asset QR code label on computer chassis
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div className="reg-field">
                  <label>Complaint Title * (No subject names)</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Workstation 04 HDMI display flickering during lab session"
                    required
                  />
                </div>

                {metaLoading && <p>Loading form options…</p>}
                {metaError && <p role="alert">Failed to load form options. Please retry later.</p>}
                <div className="form-grid-2">
                  <div className="reg-field">
                    <label>Lab Room Location *</label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lab room..." />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc: {value: string, label: string, color: string}) => (
                          <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="reg-field">
                    <label>Hardware Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: {value: string, label: string}) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="reg-field">
                    <label>Priority Level</label>
                    <Select value={priority} onValueChange={(val) => setPriority(val as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority..." />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((p: {value: string, label: string}) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="reg-field">
                    <label>Reporting Student &amp; Batch</label>
                    <input
                      value={`${student.name} (${student.batch} · ${student.rollNo})`}
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div className="reg-field">
                  <label>Detailed Issue Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe exact symptoms, error codes, port damage, or hardware behavior..."
                    style={{ background: 'var(--bg-black)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'var(--txt)', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Upload Attachment Dropzone */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) setAttachedFileName(file.name)
                    }}
                  />
                  <button
                    type="button"
                    className="btn-dark"
                    style={{ width: '100%', borderStyle: 'dashed', padding: '12px', justifyContent: 'center' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={15} /> {attachedFileName ? `Attached: ${attachedFileName}` : 'Attach Photo or Screenshot (Optional)'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn-red"
                  style={{ padding: '14px', fontSize: '0.95rem', justifyContent: 'center', marginTop: '6px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <RefreshCw size={18} className="spin" /> : <Zap size={18} />}
                  {isSubmitting ? 'Dispatching Ticket...' : 'Dispatch Ticket to Technical Team'}
                </button>
              </form>
            )}
          </div>
        </div>
      </TabsContent>

      {/* TAB 3: WORKSTATION HEALTH GRID */}
      <TabsContent value="workstations">
        <div className="student-section">
          <div className="page-heading" style={{ marginBottom: '20px' }}>
            <div>
              <p className="kicker">CAMPUS INFRASTRUCTURE</p>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--txt)' }}>Lab Workstations Register</h2>
              <span style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>Select any station to check hardware health or log a fault immediately.</span>
            </div>
          </div>

          <div className="workstation-grid">
            {activeWorkstations.map(ws => (
              <div key={ws.id} className="workstation-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="ws-id">{ws.id}</span>
                  <span className={`badge-status ${ws.status === 'Operational' ? 'available' : ws.status === 'Degraded' ? 'in-progress' : 'critical'}`}>
                    {ws.status}
                  </span>
                </div>

                <h4 className="ws-name">{ws.name}</h4>
                <p className="ws-specs">{ws.specs}</p>
                <div className="ws-meta">
                  <span>📍 {ws.location}</span>
                  <span>🕒 Checked: {ws.lastChecked}</span>
                </div>

                <button
                  className="btn-dark"
                  style={{ width: '100%', marginTop: '14px', fontSize: '0.8rem', padding: '8px', justifyContent: 'center' }}
                  onClick={() => handlePrefillFaultReport(ws)}
                >
                  <AlertTriangle size={14} color="var(--red-bright)" /> Report Fault on {ws.id}
                </button>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      {/* TAB 4: GUIDELINES & FAQ */}
      <TabsContent value="faq">
        <div className="student-section">
          <div className="portal-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--txt)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--red-bright)" /> Student Maintenance Guidelines &amp; SLAs
            </h2>

            {faqsError && <p role="alert">Failed to load FAQs.</p>}
            {!faqsError && faqs.length === 0 && <p>Loading…</p>}
            <Accordion type="single" collapsible className="rdx-accordion" defaultValue="item-0">
              {faqs.map((faq: {question: string, answer: string}, idx: number) => (
                <AccordionItem value={`item-${idx}`} key={idx} style={{ marginBottom: '8px', border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                  <AccordionTrigger style={{ padding: '16px 20px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--txt)' }}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent style={{ padding: '0 20px 16px 20px', color: 'var(--txt-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </TabsContent>
      </Tabs>
    </div>
  )
}
