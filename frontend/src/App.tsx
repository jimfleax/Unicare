import React, { useState, useEffect, useRef } from 'react'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { SystemStatus } from './components/shared/SystemStatus'
import {
  BrowserRouter, Link, NavLink, Navigate, Route, Routes, useNavigate,
} from 'react-router-dom'
import { Mail, Lock, 
  BarChart3, Bell, Camera, CheckCircle2, CircleAlert, ClipboardList,
  Clock3, Grid2X2, LayoutDashboard,
  Menu, Package, Plus, QrCode, Search,
  Wrench, X, ArrowRight, ShieldCheck, Zap,
  Printer, Check, Sun, Moon, Upload, Video, VideoOff, Sparkles, RefreshCw, AlertTriangle, GraduationCap,
  MapPin, ListChecks, ImagePlus,
  TrendingUp, TrendingDown, Calendar, Activity, Users, Building2, Gauge, ArrowUpRight, Timer, Target, Repeat, Settings,
  LogOut, Eye, EyeOff, Loader2, UserPlus, LogIn, HelpCircle
  } from 'lucide-react'
import { SmartRoutingSection, WhatHappensNextSection, ComplaintWorkflowSection } from './components/public/UniquesCommunitySections'
import { PreventiveMaintenanceSection } from './components/public/PreventiveMaintenanceSection'
import { StudentDashboard } from './components/student/StudentDashboardRedesigned'
import { TechnicianDashboard } from './components/technician/TechnicianDashboard'
import { AdminDashboard } from './components/AdminDashboard'
import { AdminManageTechnicians } from './components/admin/AdminManageTechnicians'
import { AdminScheduleMaintenance } from './components/admin/AdminScheduleMaintenance'
import { UserManagementPortal } from './components/admin/UserManagementPortal'
import { InventoryAssetsManager } from './components/admin/InventoryAssetsManager'
import Hero3DHub from './components/public/Hero3DHub'
import { FloatingShapes } from './components/public/FloatingShapes'
import StarBorder from './components/shared/StarBorder'
import { Footer } from './components/shared/Footer'
import { ProtectedRoute, getDefaultDashboard } from './components/ProtectedRoute'
import { ResetPasswordPage } from './components/auth/ResetPasswordPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import type { DisplayRole } from './context/AuthContext'
import { fetchIssuesFromApi, createIssueApi, addRepairLogApi, markNotificationsReadApi, markNotificationReadApi, updateIncidentStatusApi, fetchLocationsApi, fetchCategoriesApi, fetchPrioritiesApi, fetchStatusesApi, getStoredToken } from './services/api'
import { INSTITUTION_NAME } from './config/branding'

import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { fetcher } from './services/api'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
  Popover, PopoverTrigger, PopoverContent,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  TooltipProvider, Tooltip, TooltipTrigger, TooltipContent,
  ScrollArea,
  Avatar, AvatarFallback, AvatarImage
} from './components/ui'

/* ── Types ─────────────────────────────────────────────────── */
interface IssueRecord {
  id: string
  title: string
  location: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved'
  assignee: string
  reporter: string
  ticketId?: string
  date: string
  createdAt?: string
  resolvedAt?: string
  time?: string
  description?: string
  category?: string
  activityLogs?: any[]
}

interface AssetRecord {
  id: string
  name: string
  category: string
  location: string
  status: 'Active' | 'Maintenance' | 'Decommissioned'
  lastService: string
  nextDue: string
  health: number
}

/* ── Mock Data ────────────────────────────────────────────── */


const allNavLinks: readonly [string, string, typeof GraduationCap, readonly DisplayRole[]][] = [
  ['/student', 'Student Portal', GraduationCap, ['Student']],
  ['/technician', 'Technician Queue', Wrench, ['Tech']],
  ['/dashboard', 'Admin Dashboard', LayoutDashboard, ['Admin']],
  ['/issues', 'Issues Tracker', ClipboardList, ['Admin', 'Tech']],
  ['/report', 'Report an Issue', ClipboardList, ['Admin', 'Student']],
  ['/help-support', 'Help & Support', Settings, ['Admin', 'Student', 'Tech']],
  ['/inventory', 'Inventory DB', Grid2X2, ['Admin', 'Tech']],
  ['/analytics', 'Analytics', BarChart3, ['Admin']],
  ['/admin/users', 'User Management', Users, ['Admin']],
]

/* ── SVG Generated QR Code ────────────────────────────────── */
function GeneratedQRCode({ code }: { code: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" data-code={code}>
      <rect width="100" height="100" fill="white" rx="8" />
      <rect x="8" y="8" width="28" height="28" fill="#09090b" rx="4" />
      <rect x="14" y="14" width="16" height="16" fill="white" rx="2" />
      <rect x="18" y="18" width="8" height="8" fill="#dc2626" rx="1" />
      <rect x="64" y="8" width="28" height="28" fill="#09090b" rx="4" />
      <rect x="70" y="14" width="16" height="16" fill="white" rx="2" />
      <rect x="74" y="18" width="8" height="8" fill="#dc2626" rx="1" />
      <rect x="8" y="64" width="28" height="28" fill="#09090b" rx="4" />
      <rect x="14" y="70" width="16" height="16" fill="white" rx="2" />
      <rect x="18" y="74" width="8" height="8" fill="#dc2626" rx="1" />
      <rect x="42" y="12" width="6" height="6" fill="#09090b" />
      <rect x="52" y="12" width="6" height="6" fill="#dc2626" />
      <rect x="42" y="24" width="16" height="6" fill="#09090b" />
      <rect x="12" y="42" width="6" height="16" fill="#09090b" />
      <rect x="24" y="42" width="6" height="6" fill="#dc2626" />
      <rect x="34" y="34" width="8" height="8" fill="#09090b" />
      <rect x="48" y="42" width="12" height="12" fill="#09090b" />
      <rect x="68" y="42" width="6" height="6" fill="#dc2626" />
      <rect x="78" y="42" width="10" height="6" fill="#09090b" />
      <rect x="64" y="54" width="8" height="8" fill="#09090b" />
      <rect x="42" y="64" width="6" height="16" fill="#09090b" />
      <rect x="54" y="74" width="14" height="6" fill="#dc2626" />
      <rect x="74" y="74" width="14" height="14" fill="#09090b" />
    </svg>
  )
}

/* ── Asset QR Modal ────────────────────────────────────────── */
function AssetQRModal({ asset, onClose }: { asset: AssetRecord; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent style={{ maxWidth: '440px', padding: 0, overflow: 'hidden' }}>
        <DialogHeader style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--red-bright)', fontWeight: 700, letterSpacing: '1px' }}>
            OFFICIAL INDIVIDUAL / ROLL NO. TAG
          </span>
          <DialogTitle style={{ marginTop: '2px', color: 'var(--txt)', fontSize: '1.25rem' }}>{asset.name}</DialogTitle>
          <DialogDescription style={{ display: 'none' }}>Official QR code tag for asset {asset.id}</DialogDescription>
        </DialogHeader>
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', display: 'inline-block' }}>
            <GeneratedQRCode code={asset.id} />
            <b style={{ fontSize: '1.2rem', color: '#09090b', marginTop: '12px', display: 'block', fontFamily: 'monospace' }}>{asset.id}</b>
            <span style={{ fontSize: '0.85rem', color: '#71717a' }}>{asset.location} · {asset.category}</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
            <button className="btn-red" onClick={() => alert(`Printing tag label for ${asset.id}...`)}>
              <Printer size={16} /> Print Tag Label
            </button>
            <button className="btn-dark" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
              {copied ? <Check size={16} color="var(--green-txt)" /> : <Zap size={16} />}
              {copied ? 'Link Copied!' : 'Copy Direct Link'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ── Issue Detail Modal Drawer ────────────────────────────── */
function IssueDetailModal({ issue, onClose, onStatusChange }: { 
  issue: IssueRecord; 
  onClose: () => void;
  onStatusChange: (id: string, status: 'Open' | 'In Progress' | 'Resolved') => void;
}) {
  const [comment, setComment] = useState('')
  const { data: fullIssue, mutate } = useSWR(`/incidents/${issue.id}`, fetcher)
  const { data: statuses = [] } = useSWR('statuses', fetchStatusesApi)
  
  const comments = fullIssue?.activityLogs?.map((log: any) => ({
    author: log.createdBy?.name || 'Unknown',
    time: new Date(log.createdAt).toLocaleString(),
    text: log.message
  })) || issue.activityLogs || []

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    await addRepairLogApi(issue.id, comment)
    mutate()
    setComment('')
  }

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}>
        <DialogHeader style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--red-bright)', fontWeight: 700 }}>
            TICKET #{issue.ticketId || issue.id} · <span className={`badge-status ${issue.priority.toLowerCase()}`}>{issue.priority}</span>
          </span>
          <DialogTitle style={{ marginTop: '2px', color: 'var(--txt)', fontSize: '1.25rem' }}>{issue.title}</DialogTitle>
          <DialogDescription style={{ display: 'none' }}>Detailed view and status triage for ticket #{issue.ticketId || issue.id}</DialogDescription>
        </DialogHeader>

        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-card-alt)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '20px' }}>
            <div>
              <small style={{ color: 'var(--txt-sub)', fontSize: '0.72rem', fontWeight: 700 }}>LAB LOCATION</small>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginTop: '2px', color: 'var(--txt)' }}>{issue.location}</div>
            </div>
            <div>
              <small style={{ color: 'var(--txt-sub)', fontSize: '0.72rem', fontWeight: 700 }}>ASSIGNED TECHNICIAN</small>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginTop: '2px', color: 'var(--txt)' }}>{issue.assignee}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px', color: 'var(--txt)' }}>Issue Details</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--txt-muted)', lineHeight: '1.5' }}>
              {issue.description || 'No additional notes provided.'}
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: 'var(--txt)' }}>Status Triage</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(statuses as string[]).filter(st => st !== 'All').map(st => (
                <button
                  key={st}
                  onClick={() => onStatusChange(issue.id, st as 'Open' | 'In Progress' | 'Resolved')}
                  className={issue.status === st ? 'btn-red' : 'btn-dark'}
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  {st === 'Resolved' && <CheckCircle2 size={14} />}
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--txt)' }}>Activity Stream</h4>
            <ScrollArea style={{ maxHeight: '180px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '10px' }}>
                {comments.map((c: any, i: number) => (
                  <div key={i} style={{ background: 'var(--bg-card-alt)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <b style={{ color: 'var(--txt)' }}>{c.author}</b>
                      <small style={{ color: 'var(--txt-sub)' }}>{c.time}</small>
                    </div>
                    <div style={{ color: 'var(--txt-muted)' }}>{c.text}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px' }}>
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add technician note..."
                style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: '8px', outline: 'none', fontSize: '0.88rem', color: 'var(--txt)' }}
              />
              <button className="btn-red" type="submit" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>Post Note</button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ── Homepage Component (Exact Libraria / Antigravity Aesthetic) ── */
function Home({ 
  theme, 
  toggleTheme,
  initialAuthModal = false
}: { 
  theme: 'dark' | 'light'; 
  toggleTheme: () => void;
  initialAuthModal?: boolean;
}) {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [authModalMode, setAuthModalMode] = useState<boolean>(!!initialAuthModal)

  useEffect(() => {
    if (initialAuthModal) {
      setAuthModalMode(initialAuthModal)
    }
  }, [initialAuthModal])

  const handleOpenAuth = () => {
    setAuthModalMode(true)
  }

  const handleProtectedAction = (targetPath: string) => {
    if (isAuthenticated && user) {
      navigate(targetPath)
    } else {
      setAuthModalMode(true)
    }
  }

  return (
    <div className="landing-page">
        <FloatingShapes theme={theme} className="homepage-bg" />
      {/* Ultra Professional Floating Glass Navbar with StarBorder Accent */}
      <StarBorder
        as="div"
        className="floating-navbar-star"
        color={theme === 'dark' ? '#ef4444' : '#dc2626'}
        speed="7s"
        thickness={1.5}
      >
        <header className="landing-header">
          <Link to="/" className="brand-badge">
            <div className="brand-logo-icon">
              <ShieldCheck size={18} />
            </div>
            <span className="brand-text">
              UNI<span className="brand-text-accent">CARE</span>
            </span>
          </Link>

          <div className="landing-nav-links">
            <Link to="/dashboard" className="active-nav">Dashboard</Link>
            <a href="#usps">Features</a>
                      </div>

          <div className="header-right">
            <SystemStatus />
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} color="var(--amber-txt)" /> : <Moon size={15} color="var(--red)" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            {isAuthenticated && user ? (
              <button
                onClick={() => navigate(getDefaultDashboard(user.role))}
                className="btn-red"
                style={{ padding: '8px 18px', fontSize: '0.84rem' }}
              >
                My Dashboard →
              </button>
            ) : (
              <button
                onClick={() => handleOpenAuth()}
                className="btn-red"
                style={{ padding: '8px 18px', fontSize: '0.84rem' }}
              >
                Sign In
              </button>
            )}
          </div>
        </header>
      </StarBorder>

      {/* Hero Section */}
      <div className="hero-wrapper">
        <section className="hero-section">
          <div className="hero-left reveal-fade-up">
            <h1>
              Smart Lab <span className="text-red-highlight">Maintenance</span> &amp; Automation
            </h1>
            <p>
              Fully automated digital platform for reporting, tracking, and managing {INSTITUTION_NAME} campus infrastructure and lab assets. Built for The Uniques Community.
            </p>
            <div className="hero-btns">
              <button 
                onClick={() => handleProtectedAction(getDefaultDashboard(user?.role || 'student'))} 
                className="btn-red"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}
              >
                Open Dashboard <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => handleProtectedAction('/report')} 
                className="btn-dark"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <QrCode size={16} /> Report via QR
              </button>
            </div>
          </div>

          <div className="hero-right-stage reveal-zoom-in delay-2">
            <Hero3DHub />
          </div>
        </section>
      </div>

      {/* 6-Card Numbered Feature Grid (inspired by theuniques.in design) */}
      <section id="usps" className="numbered-cards-section">
        <div className="numbered-bg-vectors" aria-hidden="true">
          <img src="/cyber_waves_vector.svg" className="bg-vector-float tech-waves-numbered" alt="" />
          <img src="/tech_circuit_nodes.svg" className="bg-vector-float tech-nodes-numbered" alt="" />
        </div>
        <div className="numbered-cards-header reveal-fade-up">
          <p className="numbered-cards-eyebrow">WHAT WE OFFER</p>
          <h2>Core System <span className="text-red-highlight">Capabilities</span></h2>
          <p className="numbered-cards-sub">Everything your campus needs — from real-time fault reporting to automated asset tracking.</p>
        </div>

        <div className="numbered-cards-layout">
          {/* Left column */}
          <div className="numbered-cards-col">

            {/* Card 1 */}
            <div className="nc-card nc-card-expandable reveal-fade-left delay-1" onClick={() => handleProtectedAction('/dashboard')}>
              <span className="nc-number">1</span>
              <div className="nc-ghost-num">01</div>
              <div className="nc-icon-wrap"><LayoutDashboard size={26} /></div>
              <h3>Centralized Maintenance Portal</h3>
              <p>A unified workspace for lab managers, department heads, and technicians to manage campus maintenance operations without scattered tools or disconnected records.</p>
              
              <div className="nc-expand-box">
                <div className="nc-feature-pills">
                  <span className="nc-pill">Unified Workspace</span>
                  <span className="nc-pill">Role Matrix</span>
                  <span className="nc-pill">SLA Monitor</span>
                </div>
                <div className="nc-explore-link">
                  <span>Open Portal</span> <ArrowRight size={14} />
                </div>
              </div>
              <div className="nc-bar" />
            </div>

            {/* Card 2 */}
            <div className="nc-card nc-card-expandable reveal-fade-left delay-2" onClick={() => handleProtectedAction('/issues')}>
              <span className="nc-number">2</span>
              <div className="nc-ghost-num">02</div>
              <div className="nc-icon-wrap"><ClipboardList size={26} /></div>
              <h3>Structured Complaint Records</h3>
              <p>Keep every complaint organized with a unique reference ID, issue category, location, priority, and a documented service history.</p>
              
              <div className="nc-expand-box">
                <div className="nc-feature-pills">
                  <span className="nc-pill">Unique Ref ID</span>
                  <span className="nc-pill">Audit Trail</span>
                  <span className="nc-pill">Documented History</span>
                </div>
                <div className="nc-explore-link">
                  <span>View Records</span> <ArrowRight size={14} />
                </div>
              </div>
              <div className="nc-bar" />
            </div>

          </div>

          {/* Center card (Card 3 - identical clean styling) */}
          <div className="numbered-cards-center">
            <div className="nc-card nc-card-expandable reveal-zoom-in delay-3" onClick={() => handleProtectedAction('/report')}>
              <span className="nc-number">3</span>
              <div className="nc-ghost-num">03</div>
              <div className="nc-icon-wrap"><Camera size={26} /></div>
              <h3>Photo-Based Issue Reporting</h3>
              <p>Upload photos of damaged equipment, faulty wiring, leaks, or broken fixtures to give maintenance teams a clearer picture of the problem before they arrive.</p>
              
              <div className="nc-expand-box">
                <div className="nc-feature-pills">
                  <span className="nc-pill">Visual Context</span>
                  <span className="nc-pill">Evidence Upload</span>
                  <span className="nc-pill">Fast Triage</span>
                </div>
                <div className="nc-explore-link">
                  <span>Report an Issue</span> <ArrowRight size={14} />
                </div>
              </div>
              <div className="nc-bar" />
            </div>
          </div>

          {/* Right column */}
          <div className="numbered-cards-col">

            {/* Card 4 */}
            <div className="nc-card nc-card-expandable reveal-fade-right delay-4" onClick={() => handleProtectedAction('/inventory')}>
              <span className="nc-number">4</span>
              <div className="nc-ghost-num">04</div>
              <div className="nc-icon-wrap"><Grid2X2 size={26} /></div>
              <h3>Inventory &amp; Asset Records</h3>
              <p>Maintain a structured record of campus equipment, asset details, and service schedules to help teams keep track of the infrastructure they manage.</p>
              
              <div className="nc-expand-box">
                <div className="nc-feature-pills">
                  <span className="nc-pill">Asset Registry</span>
                  <span className="nc-pill">Equipment Details</span>
                  <span className="nc-pill">Service Schedules</span>
                </div>
                <div className="nc-explore-link">
                  <span>Browse Inventory</span> <ArrowRight size={14} />
                </div>
              </div>
              <div className="nc-bar" />
            </div>

            {/* Card 5 */}
            <div className="nc-card nc-card-expandable reveal-fade-right delay-5" onClick={() => handleProtectedAction('/analytics')}>
              <span className="nc-number">5</span>
              <div className="nc-ghost-num">05</div>
              <div className="nc-icon-wrap"><BarChart3 size={26} /></div>
              <h3>Maintenance Analytics &amp; Reports</h3>
              <p>Turn maintenance records into useful insights on issue categories, recurring faults, resolution performance, and campus maintenance trends.</p>
              
              <div className="nc-expand-box">
                <div className="nc-feature-pills">
                  <span className="nc-pill">Category Insights</span>
                  <span className="nc-pill">Fault Analytics</span>
                  <span className="nc-pill">Campus Trends</span>
                </div>
                <div className="nc-explore-link">
                  <span>View Reports</span> <ArrowRight size={14} />
                </div>
              </div>
              <div className="nc-bar" />
            </div>

          </div>
        </div>
      </section>

      {/* ── Raise a Complaint — 5-Step Circular Infographic ── */}
      <ComplaintWorkflowSection />

      {/* Smart Issue Routing Section */}
      <div id="smart-routing">
        <SmartRoutingSection />
      </div>

      {/* What Happens Next? — 5-Step Process Flow Section */}
      <div id="what-happens-next">
        <WhatHappensNextSection />
      </div>

      {/* ── PREVENTIVE MAINTENANCE SECTION (Matching Reference Infographic) ── */}
      <PreventiveMaintenanceSection />

      <Footer onOpenAuth={() => handleOpenAuth()} />

      <AuthModal
        isOpen={authModalMode}
        onClose={() => {
          setAuthModalMode(false)
          if (window.location.pathname === '/login') {
            window.history.replaceState(null, '', '/')
          }
        }}
      />
    </div>
  )
}

/* ── Scroll Reveal Observer & Progress Bar Manager ──────────────────────────── */
function ScrollRevealManager() {
  const navigate = useNavigate()
  const [scrollProgress, setScrollProgress] = useState(0)

  // Track scroll progress and navbar elevation
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight
          if (totalHeight > 0) {
            const current = (window.scrollY / totalHeight) * 100
            setScrollProgress(Math.min(100, Math.max(0, current)))
          }

          const navbar = document.querySelector('.floating-navbar-star')
          if (navbar) {
            if (window.scrollY > 30) {
              navbar.classList.add('is-scrolled')
            } else {
              navbar.classList.remove('is-scrolled')
            }
          }

          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Observe scroll reveals
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px 0px -70px 0px',
      threshold: 0.12,
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    
    const observeElements = () => {
      const elements = document.querySelectorAll(
        '.reveal-on-scroll, .reveal-scale, .reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-zoom-in, .reveal-stagger'
      )
      elements.forEach(el => observer.observe(el))
    }

    observeElements()
    const timer1 = setTimeout(observeElements, 120)
    const timer2 = setTimeout(observeElements, 500)

    const mutationObserver = new MutationObserver(() => {
      observeElements()
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [navigate])

  return (
    <div
      className="scroll-progress-bar"
      style={{ width: `${scrollProgress}%` }}
      aria-hidden="true"
    />
  )
}

/* ── Push Notifications ──────────────────────────────────────── */
import { subscribeToPushNotificationsApi } from './services/api';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const VAPID_PUBLIC_KEY = 'BE7yQwCHAeFtI_tCGFQa7-DPn_nrOnMYTVMMYDiQAXpSFUlF74AigCYvpV-WKg78QWCYXi8w07ly_3QLNJMXjU0';

const handlePushSubscription = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    const existingSub = await registration.pushManager.getSubscription();
    
    if (existingSub) {
      await subscribeToPushNotificationsApi(existingSub);
      return;
    }

    const newSub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    
    await subscribeToPushNotificationsApi(newSub);
  } catch (error) {
    console.error('Error during push subscription:', error);
  }
};

/* ── Application Router ────────────────────────────────────── */
export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('ucare-theme') as 'dark' | 'light') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ucare-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <AuthProvider>
      <TooltipProvider delayDuration={300}>
        <SpeedInsights />
        <BrowserRouter>
          <ScrollRevealManager />
          <div className="global-ambient-glow" aria-hidden="true" />
          <Routes>
            <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/login" element={<Home theme={theme} toggleTheme={toggleTheme} initialAuthModal={true} />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Portal theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  )
}

function Portal({ theme, toggleTheme }: { 
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}) {
  const token = getStoredToken()
  const { data: recordsData, mutate: mutateRecords } = useSWR(token ? '/incidents' : null, fetcher)
  const { data: assetsData } = useSWR(token ? '/assets' : null, fetcher)

  const records: IssueRecord[] = (recordsData || []).map((inc: any) => ({
    id: inc._id,
    title: inc.assetId?.name || inc.description?.substring(0, 20) || 'Unknown Issue',
    location: inc.assetId?.location || 'Campus',
    priority: inc.priority || 'Medium',
    status: inc.status || 'Open',
    assignee: inc.assignedTo?.name || 'Unassigned',
    ticketId: 'UC-' + String(inc._id).slice(-6).toUpperCase(),
    reporter: inc.reportedBy?.name ? inc.reportedBy.name + (inc.reportedBy.rollNo ? ' (' + inc.reportedBy.rollNo + ')' : '') : 'Unknown',
    createdAt: inc.createdAt,
    resolvedAt: inc.resolvedAt,
    date: new Date(inc.createdAt).toLocaleDateString(),
    time: new Date(inc.createdAt).toLocaleTimeString(),
    description: inc.description || '',
    category: inc.assetId?.category || 'General',
    activityLogs: inc.activityLogs || []
  }))
  const assets: AssetRecord[] = assetsData || []

  const setRecords: React.Dispatch<React.SetStateAction<IssueRecord[]>> = (val) => {
    if (typeof val === 'function') {
      const updated = val(records);
      mutateRecords(updated, false);
    } else {
      mutateRecords(val, false);
    }
  };
  const setAssets = () => {};

  const { user, isAuthenticated, displayRole: role, logout } = useAuth()
  const [sideOpen, setSideOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<IssueRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const getNotifKey = (pageIndex: number, previousPageData: any) => {
    if (!isAuthenticated) return null
    if (previousPageData && !previousPageData.length) return null
    return `/notifications?page=${pageIndex + 1}&limit=10`
  }
  const { data: notificationsPages, mutate: mutateNotifications, setSize, size, isValidating: notifValidating } = useSWRInfinite(getNotifKey, fetcher)
  const notifications: any[] = notificationsPages ? notificationsPages.flat() : []

  const navigate = useNavigate()

  const handleSignOut = () => {
    logout()
    setProfileOpen(false)
    navigate('/login', { replace: true })
  }

  /** Get user initials for avatar */
  const userInitials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'UC'

  /** Get role label for display */
  const roleLabel = role === 'Admin' ? 'System Administrator' : role === 'Tech' ? 'Technician' : 'Student'

  const handleStatusChange = async (id: string, newStatus: 'Open' | 'In Progress' | 'Resolved') => {
    // 1. Snapshot previous state for potential rollback
    const previousRecords = [...records];
    const previousSelected = selectedIssue;

    // 2. Optimistic UI Update
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    if (selectedIssue && selectedIssue.id === id) {
      setSelectedIssue(prev => prev ? { ...prev, status: newStatus } : null)
    }

    // 3. Network Request
    try {
      const success = await updateIncidentStatusApi(id, newStatus);
      if (!success) {
        throw new Error("API reported failure");
      }
    } catch (error) {
      // 4. Rollback on failure
      setRecords(previousRecords);
      setSelectedIssue(previousSelected);
      alert("Failed to update the status. Please try again.");
    }
  }

  const filteredSearchResults = searchQuery.trim() ? [
    ...records.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (r.ticketId || r.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(r => ({ type: 'Ticket' as const, id: r.id, name: r.title, sub: `${r.location} · ${r.status}`, item: r })),
    ...assets.filter(a =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(a => ({ type: 'Asset' as const, id: a.id, name: a.name, sub: `${a.location} · ${a.category}`, item: a }))
  ] : []

  return (
    <div className="portal">
      {/* Mobile/Collapsed Sidebar Backdrop */}
      {sideOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSideOpen(false)} 
          title="Click to close sidebar menu" 
        />
      )}

      <aside className={`app-side ${sideOpen ? 'show' : 'collapsed'}`}>
        <div className="app-brand">
          <Link 
            to="/" 
            className="brand-text" 
            style={{ fontSize: '1.2rem', textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} 
            onClick={() => setSideOpen(false)}
            title="Go to Homepage"
          >
            Unicare
          </Link>
          <button 
            className="sidebar-close-btn"
            style={{ color: 'var(--txt-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', alignItems: 'center' }} 
            onClick={() => setSideOpen(false)} 
            title="Close Navigation Menu"
            aria-label="Close Sidebar"
          >
            <X size={20} color="var(--red-bright)" />
          </button>
        </div>

        <nav>
          {allNavLinks
            .filter(([, , , roles]) => (roles as readonly string[]).includes(role))
            .map(([to, label, Icon]) => (
            <NavLink key={to} to={to as string} onClick={() => setSideOpen(false)}>
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Role Badge in Sidebar */}
        <div style={{ padding: '16px', margin: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <b style={{ fontSize: '0.72rem', color: 'var(--txt-muted)', display: 'block', marginBottom: '4px' }}>LOGGED IN AS</b>
          <span style={{ fontSize: '0.82rem', color: 'var(--green-txt)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            ● {roleLabel} Mode
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--txt-sub)', display: 'block', marginTop: '4px' }}>{user?.email}</span>
        </div>
      </aside>

      <div className={`portal-main ${!sideOpen ? 'full-width' : ''}`}>
        <header className="portal-top">
          <button 
            className="hamburger-toggle"
            style={{ color: 'var(--txt)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', alignItems: 'center', justifyContent: 'center' }} 
            onClick={() => setSideOpen(prev => !prev)} 
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu size={22} />
          </button>

          {/* Interactive Live Search Bar */}
          <div className="portal-search" style={{ position: 'relative' }}>
            <Search size={16} color="var(--txt-muted)" />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search complaints, assets, labs..." 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ color: 'var(--txt-muted)' }}>
                <X size={14} />
              </button>
            )}

            {searchQuery.trim() !== '' && (
              <div className="search-results-dropdown">
                {filteredSearchResults.length === 0 ? (
                  <div style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--txt-muted)', textAlign: 'center' }}>
                    No matching complaints or assets found.
                  </div>
                ) : (
                  filteredSearchResults.map((res, idx) => (
                    <div 
                      key={idx} 
                      className="search-result-item"
                      onClick={() => {
                        if (res.type === 'Ticket') {
                          setSelectedIssue(res.item as IssueRecord)
                        } else {
                          navigate('/inventory')
                        }
                        setSearchQuery('')
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: res.type === 'Ticket' ? 'var(--red-bright)' : 'var(--green-txt)' }}>
                          [{res.type.toUpperCase()}] {res.id}
                        </span>
                        <b style={{ display: 'block', fontSize: '0.88rem', color: 'var(--txt)' }}>{res.name}</b>
                        <span style={{ fontSize: '0.78rem', color: 'var(--txt-sub)' }}>{res.sub}</span>
                      </div>
                      <ArrowRight size={14} color="var(--txt-muted)" />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="user-tools">
            {/* Functional Theme Switcher */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  style={{ color: 'var(--txt)', padding: '6px 12px', borderRadius: 'var(--r-pill)', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={15} color="var(--amber-txt)" /> : <Moon size={15} color="var(--red)" />}
                  <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</TooltipContent>
            </Tooltip>

            {/* Role Badge (read-only, shows assigned role from backend) */}
            <div className="role-switch">
              <button className="role-btn active" style={{ cursor: 'default', pointerEvents: 'none' }}>
                {role === 'Student' ? user?.name : role}
              </button>
            </div>

            {/* Notification panel */}
            {isAuthenticated && (
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="notif-bell-trigger"
                    aria-label="Notifications"
                    title="Notifications"
                  >
                    <Bell size={18} />
                    {notifications.filter(n => n.unread).length > 0 && (
                      <span className="notif-badge">
                        {notifications.filter(n => n.unread).length}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>

                <PopoverContent align="end" className="notif-hovercard">
                  <div className="notif-hovercard-header">
                    <b>System Alerts &amp; Activity</b>
                    <button 
                      className="notif-mark-all-btn"
                      onClick={() => {
                        mutateNotifications(notificationsPages?.map(page => page.map((n: any) => ({ ...n, unread: false }))), false);
                        markNotificationsReadApi();
                      }}
                    >
                      Mark all read
                    </button>
                  </div>
                  <ScrollArea className="notif-hovercard-body">
                    <div 
                      style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }}
                      onScroll={(e) => {
                        const target = e.currentTarget;
                        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10 && !notifValidating) {
                          setSize(size + 1);
                        }
                      }}
                    >
                      {notifications.length === 0 && !notifValidating && (
                        <div className="notif-empty">
                          <Bell size={28} />
                          No notifications yet
                        </div>
                      )}
                      {notifications.map(n => (
                        <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                          <div className="notif-item-header">
                            <span className={`notif-item-title ${n.priority === 'Critical' ? 'critical' : ''}`}>{n.title}</span>
                            <span className="notif-item-time">{n.time}</span>
                          </div>
                          <div className="notif-item-meta">
                            <span className="notif-item-location">
                              <MapPin size={11} />
                              {n.location}
                            </span>
                            {n.unread && (
                              <button 
                                className="notif-mark-read-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  mutateNotifications(notificationsPages?.map(page => page.map((no: any) => no.id === n.id ? { ...no, unread: false } : no)), false);
                                  markNotificationReadApi(n.id);
                                }}
                                title="Mark as read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {notifValidating && <div className="notif-loading">Loading...</div>}
                    </div>
                  </ScrollArea>
                  <div className="notif-hovercard-footer">
                    <button 
                      className="btn-dark" 
                      onClick={() => navigate('/issues')}
                    >
                      View All Issues <ArrowUpRight size={13} />
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* User Profile Menu — shows real user info from AuthContext */}
            <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
              <DropdownMenuTrigger asChild>
                <div 
                  className="user-chip" 
                  style={{ cursor: 'pointer' }}
                  title="User Profile Menu"
                >
                  <Avatar style={{ width: '28px', height: '28px' }}>
                    <AvatarFallback style={{ fontSize: '0.75rem', fontWeight: 700 }}>{userInitials}</AvatarFallback>
                  </Avatar>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name || 'User'}</span>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" style={{ width: '270px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 10px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                  <Avatar style={{ width: '40px', height: '40px' }}>
                    <AvatarFallback style={{ fontSize: '1rem', fontWeight: 700 }}>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <b style={{ fontSize: '0.92rem', color: 'var(--txt)', display: 'block' }}>{user?.name || 'User'}</b>
                    <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', fontFamily: 'monospace' }}>{roleLabel}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--txt-sub)', display: 'block', marginTop: '2px' }}>{user?.email}</span>
                  </div>
                </div>

                <DropdownMenuItem onClick={() => { navigate('/issues'); setProfileOpen(false) }}>
                  📋 My Reported Tickets
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate('/inventory'); setProfileOpen(false) }}>
                  📦 My Assigned Assets
                </DropdownMenuItem>
                {isAuthenticated && ['technician', 'admin'].includes(user?.role || '') && (
                  <DropdownMenuItem onClick={handlePushSubscription}>
                    🔔 Enable Push Alerts
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} style={{ color: 'var(--red-bright)' }}>
                  <LogOut size={15} /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to={getDefaultDashboard(user?.role || 'student')} replace />} />
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard records={records} onAddRecord={(newR) => setRecords([newR, ...records])} onSelectIssue={setSelectedIssue} />
            </ProtectedRoute>
          } />
          <Route path="/technician" element={
            <ProtectedRoute allowedRoles={['technician']}>
              <TechnicianDashboard records={records} onStatusChange={handleStatusChange} onSelectIssue={setSelectedIssue} onRefresh={() => setRecords([])} />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'lab_admin']}>
              <AdminDashboard records={records} onSelectIssue={setSelectedIssue} />
            </ProtectedRoute>
} />
          
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin', 'lab_admin']}>
              <UserManagementPortal />
            </ProtectedRoute>
          } />
          <Route path="/manage-technicians" element={
            <ProtectedRoute allowedRoles={['admin', 'lab_admin']}>
              <AdminManageTechnicians />
            </ProtectedRoute>
          } />
          <Route path="/schedule-maintenance" element={
            <ProtectedRoute allowedRoles={['admin', 'lab_admin']}>
              <AdminScheduleMaintenance />
            </ProtectedRoute>

          } />
          <Route path="/issues" element={
            <ProtectedRoute allowedRoles={['admin', 'lab_admin', 'technician']}>
              <Issues records={records} onSelectIssue={setSelectedIssue} />
            </ProtectedRoute>
          } />
          <Route path="/report" element={
            <ProtectedRoute allowedRoles={['admin', 'lab_admin', 'student']}>
              <Report onAddRecord={(newR) => setRecords([newR, ...records])} assets={assets} />
            </ProtectedRoute>
          } />
          <Route path="/help-support" element={
            <ProtectedRoute allowedRoles={['admin', 'lab_admin', 'student', 'technician']}>
              <HelpSupport />
            </ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute allowedRoles={['admin', 'lab_admin', 'technician']}>
              <InventoryAssetsManager />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['admin', 'lab_admin']}>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/maintenance" element={
            <ProtectedRoute allowedRoles={['technician']}>
              <TechnicianDashboard records={records} onStatusChange={handleStatusChange} onSelectIssue={setSelectedIssue} onRefresh={() => setRecords([])} />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to={getDefaultDashboard(user?.role || 'student')} replace />} />
        </Routes>

      </div>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}

/* ── Portal Page Views ─────────────────────────────────────── */
function Page({ children }: { children: React.ReactNode }) {
  return <main className="page">{children}</main>
}

/* Dashboard component has been extracted to components/AdminDashboard.tsx */

function Issues({ records, onSelectIssue }: { records: IssueRecord[]; onSelectIssue: (issue: IssueRecord) => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = records.filter(r =>
    (category === 'All' || r.category === category) &&
    (r.title.toLowerCase().includes(query.toLowerCase()) || (r.ticketId || r.id).toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <Page>
      <div className="page-heading">
        <div>
          <p className="kicker">ISSUE TRACKING DASHBOARD</p>
          <h1>Complaint Registry</h1>
          <span>Filter, inspect, and triage maintenance requests across labs.</span>
        </div>
        <Link to="/report" className="btn-red"><Plus size={15} /> Log Ticket</Link>
      </div>

      <div className="catalog-toolbar">
        <div className="catalog-search-wrap">
          <Search size={18} color="var(--txt-muted)" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search repository..." />
        </div>

        <div className="category-select-wrap">
          <label>Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger style={{ minWidth: '160px', height: '38px', padding: '0 12px', fontSize: '0.85rem' }}>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {(Array.from(new Set(records.map(r => r.category).filter(Boolean))) as string[]).map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="entries-count">{filtered.length} ENTRIES AVAILABLE</div>
      </div>

      <div className="portal-card complaint-ledger-card">
        <div className="table-responsive-wrapper">
          <table className="archive-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Complaint &amp; Individual</th>
                <th>Registry Location</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><span className="ticket-id-tag">{r.ticketId || r.id}</span></td>
                  <td>
                    <div className="table-record-cell">
                      <span className="record-title-bold">{r.title}</span>
                      <div className="record-meta-inline">
                        <span className="meta-reporter-chip">{r.reporter}</span>
                        <span className="meta-category-chip">{r.category}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="table-location-chip">
                      <MapPin size={13} />
                      {r.location}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-status ${r.status === 'Resolved' ? 'available' : r.status === 'In Progress' ? 'in-progress' : 'critical'}`}>
                      <span className="status-dot"></span>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-table-action" onClick={() => onSelectIssue(r)}>
                      <span>View Record</span>
                      <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  )
}

function Report({ onAddRecord }: { onAddRecord: (record: IssueRecord) => void, assets: AssetRecord[] }) {
  const { user } = useAuth()
  
  // Fetch metadata
  const { data: fetchedLocations, error: locationsError } = useSWR('locations', fetchLocationsApi)
  const { data: fetchedCategories, error: categoriesError } = useSWR('categories', fetchCategoriesApi)
  const { data: fetchedPriorities, error: prioritiesError } = useSWR('priorities', fetchPrioritiesApi)
  const metaError = locationsError || categoriesError || prioritiesError
  const metaLoading = !metaError && (!fetchedLocations || !fetchedCategories || !fetchedPriorities)

  const availableLocations: { value: string; label: string; color: string }[] = Array.isArray(fetchedLocations) ? fetchedLocations : []
  const availableCategories: { value: string; label: string }[] = Array.isArray(fetchedCategories) ? fetchedCategories : []
  const availablePriorities: { value: string; label: string }[] = Array.isArray(fetchedPriorities) ? fetchedPriorities : []

  // Form state
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('' as any)
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Photo upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set default values when metadata loads
  useEffect(() => { 
    if (!location && availableLocations.length) setLocation(availableLocations[0].value) 
  }, [availableLocations, location])
  
  useEffect(() => { 
    if (!category && availableCategories.length) setCategory(availableCategories[0].value) 
  }, [availableCategories, category])
  
  useEffect(() => { 
    if (!priority && availablePriorities.length) setPriority(availablePriorities[0].value as any) 
  }, [availablePriorities, priority])

  // Photo upload handlers
  const validateImage = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPG, PNG, or WEBP)'
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5 MB'
    }

    return null
  }

  const handleFileSelect = (file: File) => {
    const error = validateImage(file)
    
    if (error) {
      setUploadError(error)
      setSelectedImage(null)
      setImagePreview(null)
      return
    }

    setUploadError(null)
    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('Please enter an issue title')
      return
    }

    setIsSubmitting(true)
    
    try {
      const payload = {
        title: title.trim(),
        location,
        category,
        priority,
        status: 'Open' as const,
        assignee: 'Unassigned',
        reporter: user?.name || 'Unknown Student',
        date: new Date().toISOString().split('T')[0],
        description: description.trim() || 'No additional details provided.',
      }
      
      // Note: Image attachment integration would go here
      // Currently the backend doesn't support image attachments
      // When implemented, the image would be uploaded to storage
      // and the URL would be added to the payload
      
      const result = await createIssueApi(payload)
      
      if (result) {
        onAddRecord(result)
        setSubmitted(true)
      } else {
        alert("Failed to create the issue. Please try again.")
      }
    } catch (error) {
      console.error('Error submitting complaint:', error)
      alert("An error occurred while submitting the complaint.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setTitle('')
    setDescription('')
    setSelectedImage(null)
    setImagePreview(null)
    setUploadError(null)
    setLocation(availableLocations[0]?.value || '')
    setCategory(availableCategories[0]?.value || '')
    setPriority(availablePriorities[0]?.value as any || '')
  }

  if (submitted) {
    return (
      <Page>
        <div style={{ maxWidth: '520px', margin: '60px auto', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
          <CheckCircle2 size={60} color="var(--green-txt)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.7rem', color: 'var(--txt)', marginBottom: '8px' }}>Complaint Successfully Dispatched!</h2>
          <p style={{ color: 'var(--txt-muted)', marginBottom: '24px', fontSize: '0.92rem' }}>
            Ticket ID has been assigned and queued for {INSTITUTION_NAME} lab maintenance technicians.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn-dark" onClick={handleReset}>
              <Plus size={15} /> Log Another Ticket
            </button>
            <Link to="/student" className="btn-red">View My Tickets</Link>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--red-bright)', fontWeight: 700, letterSpacing: '1.2px', marginBottom: '8px' }}>
            CAMPUS MAINTENANCE
          </p>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '12px' }}>
            Report Lab Complaint
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--txt-muted)', lineHeight: '1.6' }}>
            Report a lab or campus facility issue by describing the problem. Photos are not currently sent with reports.
          </p>
        </div>

        {/* Two Column Layout */}
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '45% 1fr', 
            gap: '28px',
            alignItems: 'start'
          }}>
            {/* Left Card: Upload Photo */}
            <div className="portal-card" style={{ 
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(245, 34, 45, 0.04)'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--red-bright)', 
                  fontWeight: 700, 
                  letterSpacing: '1px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  STEP 1
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '6px' }}>
                  Preview Issue Photo
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--txt-muted)', lineHeight: '1.5' }}>
                  Photos are for local preview only and are not sent with your complaint. Attachment upload is not yet supported.
                </p>
              </div>

              {/* Upload Drop Zone */}
              {!imagePreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    background: isDragging ? 'rgba(245, 34, 45, 0.05)' : 'rgba(255, 245, 247, 0.6)',
                    border: `2px dashed ${isDragging ? 'var(--red-bright)' : 'rgba(245, 34, 45, 0.2)'}`,
                    borderRadius: '16px',
                    padding: '48px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '24px'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div style={{
                    width: '72px',
                    height: '72px',
                    margin: '0 auto 20px',
                    background: 'linear-gradient(135deg, rgba(245, 34, 45, 0.1) 0%, rgba(255, 192, 203, 0.1) 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ImagePlus size={32} color="var(--red-bright)" />
                  </div>
                  
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '8px' }}>
                    Drag and drop your photo here
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', marginBottom: '16px' }}>
                    or browse files from your device
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--txt-sub)', marginBottom: '20px' }}>
                    JPG, PNG or WEBP · Max 5 MB
                  </p>
                  
                  <button
                    type="button"
                    className="btn-red"
                    style={{ 
                      padding: '12px 28px',
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                  >
                    <Upload size={18} />
                    Preview Photo
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <div style={{ 
                  marginBottom: '24px',
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border)',
                  borderRadius: '16px',
                  padding: '16px',
                  position: 'relative'
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Issue preview" 
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      borderRadius: '12px',
                      maxHeight: '300px',
                      objectFit: 'contain'
                    }} 
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: 'absolute',
                      top: '24px',
                      right: '24px',
                      background: 'var(--red-bright)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(245, 34, 45, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    title="Remove image"
                  >
                    <X size={20} />
                  </button>
                  <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--txt-muted)', textAlign: 'center' }}>
                    {selectedImage?.name} — local preview only, not included in your complaint
                  </div>
                </div>
              )}

              {uploadError && (
                <div style={{
                  background: 'rgba(245, 34, 45, 0.1)',
                  border: '1px solid rgba(245, 34, 45, 0.2)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.85rem',
                  color: 'var(--red-bright)'
                }}>
                  <AlertTriangle size={18} />
                  {uploadError}
                </div>
              )}

              {/* Photo Tips */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '12px' }}>
                  Photo tips
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { icon: '✓', text: 'Capture the damaged part clearly' },
                    { icon: '✓', text: 'Include the surrounding equipment when useful' },
                    { icon: '✓', text: 'Avoid including faces or personal information' }
                  ].map((tip, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--txt-muted)' }}>
                      <span style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: 'rgba(82, 196, 26, 0.1)', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        color: 'var(--green-txt)',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {tip.icon}
                      </span>
                      {tip.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Separator */}
              <div style={{ height: '1px', background: 'rgba(0, 0, 0, 0.06)', margin: '24px 0' }} />

              {/* Optional Photo Notice */}
              <div style={{
                background: 'rgba(255, 245, 247, 0.8)',
                border: '1px solid rgba(245, 34, 45, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                gap: '12px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'rgba(245, 34, 45, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Zap size={18} color="var(--red-bright)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '4px' }}>
                    No photo available?
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', lineHeight: '1.5' }}>
                    You can still report the issue by completing the complaint details.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: Ticket Information */}
            <div className="portal-card" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)'
            }}>
              <div style={{ marginBottom: '28px' }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--red-bright)', 
                  fontWeight: 700, 
                  letterSpacing: '1px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  STEP 2
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--txt)' }}>
                  Ticket Information
                </h3>
              </div>

              {metaLoading && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--txt-muted)' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '8px' }}>Loading form options…</p>
                </div>
              )}
              
              {metaError && (
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(245, 34, 45, 0.1)', 
                  border: '1px solid rgba(245, 34, 45, 0.2)',
                  borderRadius: '10px',
                  color: 'var(--red-bright)',
                  marginBottom: '20px'
                }}>
                  Failed to load form options. Please retry later.
                </div>
              )}

              {!metaLoading && !metaError && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Issue Title */}
                  <div className="reg-field">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)' }}>
                      Issue Title <span style={{ color: 'var(--red-bright)' }}>*</span>
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Projector HDMI port damaged"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        color: 'var(--txt)',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>

                  {/* Location and Category Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="reg-field">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)' }}>
                        Location / Lab Room
                      </label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger style={{ height: '46px' }}>
                          <SelectValue placeholder="Select location..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLocations.map(loc => (
                            <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="reg-field">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)' }}>
                        Issue Category
                      </label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger style={{ height: '46px' }}>
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Priority and Reporter Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="reg-field">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)' }}>
                        Priority Level
                      </label>
                      <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                        <SelectTrigger style={{ height: '46px' }}>
                          <SelectValue placeholder="Select priority..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePriorities.map(p => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="reg-field">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)' }}>
                        Reported By
                      </label>
                      <input
                        value={`${user?.name || 'Student User'} (student)`}
                        disabled
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'var(--bg-card-alt)',
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          color: 'var(--txt-muted)',
                          cursor: 'not-allowed',
                          opacity: 0.7
                        }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="reg-field">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)' }}>
                      Describe the Issue
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe symptoms, error codes, or hardware condition..."
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        color: 'var(--txt)',
                        resize: 'vertical',
                        minHeight: '120px',
                        lineHeight: '1.6',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-red"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      marginTop: '8px',
                      opacity: isSubmitting ? 0.6 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CircleAlert size={20} />
                        Dispatch Ticket to Tech Queue
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 1024px) {
          form > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Page>
  )
}
      

function Inventory() {
  const { data: assets = [] } = useSWR<AssetRecord[]>('/assets', fetcher)
  const [activeQRAsset, setActiveQRAsset] = useState<AssetRecord | null>(null)

  return (
    <Page>
      <div className="page-heading">
        <div>
          <p className="kicker">MAINTENANCE DATABASE MANAGEMENT</p>
          <h1>Asset Ledger &amp; QR Tags</h1>
          <span>Hardware register, warranty schedules, and generated QR tags.</span>
        </div>
      </div>

      <div className="portal-card">
        <table className="archive-table">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Hardware Name</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(a => (
              <tr key={a.id}>
                <td><span className="ticket-id-tag">{a.id}</span></td>
                <td><b className="record-title-bold">{a.name}</b></td>
                <td style={{ color: 'var(--txt-muted)' }}>{a.category}</td>
                <td style={{ color: 'var(--txt-muted)' }}>{a.location}</td>
                <td><span className={`badge-status ${a.status === 'Active' ? 'available' : 'critical'}`}>{a.status}</span></td>
                <td>
                  <button className="btn-dark" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setActiveQRAsset(a)}>
                    <QrCode size={14} color="var(--red-bright)" /> View QR Tag
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeQRAsset && <AssetQRModal asset={activeQRAsset} onClose={() => setActiveQRAsset(null)} />}
    </Page>
  )
}

/* ── Help & Support Page ───────────────────────────────────── */
function HelpSupport() {
  const [activeCategory, setActiveCategory] = useState<string>('FAQs')

  const categories = [
    { id: 'FAQs', label: 'FAQs', icon: HelpCircle },
    { id: 'SLAs', label: 'SLAs & Guidelines', icon: Clock3 },
    { id: 'Contact', label: 'Contact Support', icon: Mail },
  ]

  const faqs = [
    {
      question: 'How do I report an issue?',
      answer: 'Navigate to "Report an Issue" from the sidebar menu. Fill in the required details including location, category, and description. You can preview a photo in the photo card, but attaching photos to submitted reports is not yet supported.'
    },
    {
      question: 'What are the response time SLAs?',
      answer: 'Critical issues: 1-2 hours, High priority: 4-8 hours, Medium priority: 1-2 days, Low priority: 3-5 days. Response times may vary based on technician availability.'
    },
    {
      question: 'How can I track my reported issues?',
      answer: 'All your reported issues are visible in your dashboard under "My Active Tickets". You can filter by status and search by ticket ID or title.'
    },
    {
      question: 'What should I do if a technician is unresponsive?',
      answer: 'If a technician is not responding within the SLA timeframe, you can escalate the issue through "Report a Technician" or contact the admin directly.'
    },
  ]

  const guidelines = [
    {
      title: 'Critical Priority',
      time: '1-2 hours',
      description: 'System down, safety hazards, complete lab unavailability'
    },
    {
      title: 'High Priority',
      time: '4-8 hours',
      description: 'Major equipment failure, significant disruption to lab activities'
    },
    {
      title: 'Medium Priority',
      time: '1-2 days',
      description: 'Partial equipment malfunction, moderate impact on operations'
    },
    {
      title: 'Low Priority',
      time: '3-5 days',
      description: 'Minor issues, cosmetic problems, feature requests'
    },
  ]

  return (
    <Page>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--txt)' }}>
          <Settings size={32} color="var(--red-bright)" />
          Help & Support
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--txt-muted)', marginBottom: '32px' }}>
          Find answers to common questions and learn about our service level agreements.
        </p>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
          {categories.map(cat => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '12px 20px',
                  background: activeCategory === cat.id ? 'var(--red-bright)' : 'transparent',
                  color: activeCategory === cat.id ? 'white' : 'var(--txt-muted)',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  marginBottom: '-2px',
                  borderBottom: activeCategory === cat.id ? '2px solid var(--red-bright)' : 'none'
                }}
              >
                <Icon size={18} />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
          {activeCategory === 'FAQs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '8px' }}>Frequently Asked Questions</h2>
              {faqs.map((faq, idx) => (
                <details key={idx} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                  <summary style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--txt)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {faq.question}
                    <Plus size={20} style={{ flexShrink: 0 }} />
                  </summary>
                  <p style={{ marginTop: '12px', color: 'var(--txt-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          )}

          {activeCategory === 'SLAs' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '16px' }}>Service Level Agreements</h2>
              <p style={{ color: 'var(--txt-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
                Our response times are based on issue priority. Technicians will be assigned and respond according to these guidelines:
              </p>
              <div style={{ display: 'grid', gap: '16px' }}>
                {guidelines.map((item, idx) => (
                  <div key={idx} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '4px' }}>{item.title}</h3>
                      <p style={{ color: 'var(--txt-muted)', fontSize: '0.9rem' }}>{item.description}</p>
                    </div>
                    <div style={{ background: 'var(--red-bright)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === 'Contact' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Mail size={64} color="var(--red-bright)" style={{ margin: '0 auto 20px' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '12px' }}>Contact Support Team</h2>
              <p style={{ color: 'var(--txt-muted)', marginBottom: '32px', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 32px' }}>
                Need immediate assistance? Reach out to our support team via email or visit the admin office during business hours.
              </p>
              <div style={{ display: 'grid', gap: '16px', maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt-muted)', marginBottom: '8px' }}>Email Support</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--txt)' }}>support@unicare.edu</div>
                </div>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt-muted)', marginBottom: '8px' }}>Office Hours</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--txt)' }}>Monday - Friday: 9:00 AM - 5:00 PM</div>
                </div>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt-muted)', marginBottom: '8px' }}>Location</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--txt)' }}>Admin Block, Room 204</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Page>
  )
}

function Analytics() {
  const { data: analytics } = useSWR('/analytics', fetcher)

  return (
    <Page>
      <div className="page-heading">
        <div>
          <p className="kicker">ANALYTICS &amp; REPORTING</p>
          <h1>System Telemetry &amp; Performance</h1>
          <span>Monthly resolution trends and SLA compliance metrics.</span>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card"><div><p>Uptime</p><h2>{analytics?.uptime || '99.8%'}</h2><span>Exam Ready</span></div></div>
        <div className="stat-card"><div><p>Avg SLA Speed</p><h2>{analytics?.avgSlaSpeed || '3.2h'}</h2><span>On Target</span></div></div>
        <div className="stat-card"><div><p>Compliance</p><h2>{analytics?.compliance || '96.4%'}</h2><span>+2.1% High</span></div></div>
        <div className="stat-card"><div><p>Preventative Upkeep</p><h2>{analytics?.jobsComplete || '48'}</h2><span>Jobs Complete</span></div></div>
      </div>
    </Page>
  )
}

function AuthModal({ 
  isOpen, 
  onClose
}: { 
  isOpen: boolean
  onClose: () => void
}) {
  const { login, isAuthenticated, user, error, clearError, loading } = useAuth()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
  const [view, setView] = useState<'login' | 'forgot'>('login')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)

  useEffect(() => {
    setFormError(null)
    clearError()
    setForgotError(null)
    setForgotSuccess(false)
  }, [isOpen, clearError, view])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    clearError()

    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both email and password')
      return
    }
    const success = await login(email.trim(), password)
    if (success) {
      onClose()
      const targetRole = user?.role || 'student'
      const roleMap: Record<string, string> = {
        'admin': '/dashboard',
        'technician': '/technician',
        'student': '/student'
      }
      navigate(roleMap[targetRole] || '/', { replace: true })
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError(null)
    setForgotSuccess(false)
    
    if (!email.trim()) {
      setForgotError('Please enter your email')
      return
    }
    
    setForgotLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to request password reset')
      }
      setForgotSuccess(true)
    } catch (err: any) {
      setForgotError(err.message || 'An error occurred. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  const displayError = formError || error

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="auth-card" style={{ maxWidth: '440px', width: '92%', padding: '36px' }}>
        <DialogHeader style={{ display: 'none' }}>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>Sign in to access your maintenance dashboard</DialogDescription>
        </DialogHeader>

        <div className="auth-brand">
          <div className="auth-brand-link">
            <div className="auth-brand-icon">
              <ShieldCheck size={22} />
            </div>
            <span className="auth-brand-text">
              UNI<span className="auth-brand-accent">CARE</span>
            </span>
          </div>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to access your maintenance dashboard</p>

        {displayError && (
          <div className="auth-error">
            <CircleAlert size={16} />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                placeholder="you@institution.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="pwd-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            <div className="auth-field-extras">
              <a href="#" className="forgot-pwd" onClick={e => e.preventDefault()}>Forgot password?</a>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

