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
  LogOut, Eye, EyeOff, Loader2, UserPlus, LogIn
  } from 'lucide-react'
import { SmartRoutingSection, WhatHappensNextSection, ComplaintWorkflowSection } from './components/public/UniquesCommunitySections'
import { PreventiveMaintenanceSection } from './components/public/PreventiveMaintenanceSection'
import { StudentDashboard } from './components/student/StudentDashboard'
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
  ['/report', 'Report via QR', QrCode, ['Admin', 'Student']],
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
  const [notifOpen, setNotifOpen] = useState(false)
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
            style={{ color: 'var(--txt-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} 
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
            style={{ color: 'var(--txt)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
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

            {/* Functional Notifications Popover */}
            {isAuthenticated && (
              <Popover open={notifOpen} onOpenChange={setNotifOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button 
                        style={{ position: 'relative', color: 'var(--txt-muted)', padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }} 
                        aria-label="Notifications"
                      >
                        <Bell size={18} />
                        {notifications.filter(n => n.unread).length > 0 && (
                          <span style={{ position: 'absolute', top: '2px', right: '2px', width: '14px', height: '14px', background: 'var(--red)', borderRadius: '50%', fontSize: '0.65rem', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                            {notifications.filter(n => n.unread).length}
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>

                <PopoverContent align="end" style={{ width: '340px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <b style={{ fontSize: '0.9rem', color: 'var(--txt)' }}>System Alerts &amp; Activity</b>
                    <button 
                      style={{ fontSize: '0.75rem', color: 'var(--red-bright)', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}
                      onClick={() => {
                        mutateNotifications(notificationsPages?.map(page => page.map((n: any) => ({ ...n, unread: false }))), false);
                        markNotificationsReadApi();
                      }}
                    >
                      Mark all read
                    </button>
                  </div>
                  <ScrollArea style={{ maxHeight: '300px' }}>
                    <div 
                      style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '8px' }}
                      onScroll={(e) => {
                        const target = e.currentTarget;
                        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10 && !notifValidating) {
                          setSize(size + 1);
                        }
                      }}
                    >
                      {notifications.map(n => (
                        <div key={n.id} style={{ padding: '10px', background: n.unread ? 'var(--bg-card-alt)' : 'transparent', borderLeft: n.unread ? '3px solid var(--red)' : '3px solid transparent', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                            <span style={{ color: n.priority === 'Critical' ? 'var(--red-bright)' : 'var(--txt)' }}>{n.title}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--txt-sub)' }}>{n.time}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Location: {n.location}</span>
                            {n.unread && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  mutateNotifications(notificationsPages?.map(page => page.map((no: any) => no.id === n.id ? { ...no, unread: false } : no)), false);
                                  markNotificationReadApi(n.id);
                                }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--green-txt)', cursor: 'pointer', padding: '2px' }}
                                title="Mark read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {notifValidating && <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--txt-muted)', padding: '8px' }}>Loading...</div>}
                    </div>
                  </ScrollArea>
                  <button 
                    className="btn-dark" 
                    style={{ width: '100%', marginTop: '12px', padding: '6px', fontSize: '0.78rem' }}
                    onClick={() => { navigate('/issues'); setNotifOpen(false) }}
                  >
                    View All Issues ↗
                  </button>
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

function Report({ onAddRecord, assets }: { onAddRecord: (record: IssueRecord) => void, assets: AssetRecord[] }) {
  const { data: fetchedLocations, error: locationsError } = useSWR('locations', fetchLocationsApi)
  const { data: fetchedCategories, error: categoriesError } = useSWR('categories', fetchCategoriesApi)
  const { data: fetchedPriorities, error: prioritiesError } = useSWR('priorities', fetchPrioritiesApi)
  const metaError = locationsError || categoriesError || prioritiesError
  const metaLoading = !metaError && (!fetchedLocations || !fetchedCategories || !fetchedPriorities)

  const availableLocations: { value: string; label: string; color: string }[] = Array.isArray(fetchedLocations) ? fetchedLocations : []
  const availableCategories: { value: string; label: string }[] = Array.isArray(fetchedCategories) ? fetchedCategories : []
  const availablePriorities: { value: string; label: string }[] = Array.isArray(fetchedPriorities) ? fetchedPriorities : []

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('' as any)
  useEffect(() => { if (!location && availableLocations.length) setLocation(availableLocations[0].value) }, [availableLocations, location])
  useEffect(() => { if (!category && availableCategories.length) setCategory(availableCategories[0].value) }, [availableCategories, category])
  useEffect(() => { if (!priority && availablePriorities.length) setPriority(availablePriorities[0].value as any) }, [availablePriorities, priority])
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (fetchedLocations?.length && location === 'Thinkspace') setLocation(fetchedLocations[0].value)
  }, [fetchedLocations])

  useEffect(() => {
    if (fetchedCategories?.length && category === 'AV Equipment') setCategory(fetchedCategories[0].value)
  }, [fetchedCategories])

  useEffect(() => {
    if (fetchedPriorities?.length && priority === 'High') setPriority(fetchedPriorities[1]?.value as any || fetchedPriorities[0].value)
  }, [fetchedPriorities])
  const [scannedAsset, setScannedAsset] = useState<AssetRecord | null>(null)

  // Camera & Scan states
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Web Audio Beep function for scan feedback
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)
    } catch (e) {
      // Audio context fallback
    }
  }

  // Pre-fill ticket information from scanned asset
  const applyAssetDetails = (asset: AssetRecord) => {
    setScannedAsset(asset)
    setTitle(`Issue reported on ${asset.name}`)
    setLocation(`${asset.location}`)
    setCategory(asset.category)
    setPriority(asset.status === 'Maintenance' ? 'Critical' : 'High')
    setDescription(`Automated complaint registered via QR Tag ${asset.id}. Hardware category: ${asset.category}. Location: ${asset.location}.`)
    playBeep()
  }

  // Clear / Reset scanned data
  const handleResetScan = () => {
    setScannedAsset(null)
    setTitle('')
    setLocation(availableLocations[0]?.value || '')
    setCategory(availableCategories[0]?.value || '')
    setPriority((availablePriorities[0]?.value || '') as any)
    setDescription('')
  }

  // Start Real Web Camera Stream (Laptop & Desktop Compatible)
  const startCamera = async () => {
    setCameraError(null)
    setScanning(true)
    setIsCameraActive(true)

    try {
      let stream: MediaStream
      try {
        // Default video stream (works on laptop/desktop webcams)
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
      } catch (e1) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
        } catch (e2) {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => console.warn('Video play error:', err))
        }
        await videoRef.current.play().catch(() => {})
      }
    } catch (err: any) {
      console.warn('Camera error:', err)
      setCameraError('Laptop camera blocked or unavailable. Please grant camera permission in browser URL bar, or click Simulate Scan below!')
      setIsCameraActive(false)
      setScanning(false)
    }
  }

  // Stop Camera Stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
    setScanning(false)
  }

  // Barcode Detection API listener while camera is on
  useEffect(() => {
    let interval: any
    if (isCameraActive && videoRef.current && 'BarcodeDetector' in window) {
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39'] })
      interval = setInterval(async () => {
        if (!videoRef.current) return
        try {
          const barcodes = await detector.detect(videoRef.current)
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue
            const matched = assets.find(a => a.id.toLowerCase() === code.toLowerCase() || code.includes(a.id))
            if (matched) {
              applyAssetDetails(matched)
            } else {
              setScannedAsset({
                id: code,
                name: `Hardware Asset (${code})`,
                category: availableCategories[0]?.value,
                location: availableLocations[0]?.value || '',
                status: 'Active',
                lastService: new Date().toISOString().split('T')[0],
                nextDue: '2026-12-31',
                health: 88
              })
              setTitle(`Hardware Issue (${code})`)
              playBeep()
            }
          }
        } catch (e) {
          // Frame drop catch
        }
      }, 500)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCameraActive, assets, availableCategories, availableLocations])

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])


  // Handle uploaded QR image file
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    alert('QR decoding from image is not yet implemented.')
  }

  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      id: scannedAsset ? scannedAsset.id : undefined,
      title,
      location,
      category,
      priority,
      status: 'Open' as const,
      assignee: 'Unassigned',
      reporter: user?.name || 'Unknown',
      date: new Date().toISOString().split('T')[0],
      description,
    };
    
    const result = await createIssueApi(payload);
    
    if (result) {
      onAddRecord(result);
      setSubmitted(true);
    } else {
      alert("Failed to create the issue. Please try again.");
    }
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
            <button className="btn-dark" onClick={() => { setSubmitted(false); handleResetScan(); }}>
              <Plus size={15} /> Log Another Ticket
            </button>
            <Link to="/issues" className="btn-red">View Complaint Ledger</Link>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div className="page-heading">
        <div>
          <p className="kicker">QR-BASED COMPLAINT SYSTEM</p>
          <h1>Report Lab Complaint</h1>
          <span>Point camera at any asset tag or select a tag below to auto-fill ticket details.</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '32px' }}>
        {/* Step 1: Camera & Scanner Controls */}
        <div className="portal-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--red-bright)', fontWeight: 700, letterSpacing: '1px' }}>
                STEP 1
              </span>
              <h3 style={{ marginTop: '2px' }}>QR Camera Scanner</h3>
            </div>
            {scannedAsset && (
              <span className="badge-status available" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={13} /> Tag Scanned
              </span>
            )}
          </div>

          {/* Scanner Viewfinder Viewport */}
          <div className={`scanner-viewport ${scannedAsset ? 'success' : ''}`}>
            <video
              ref={videoRef}
              className="scanner-video"
              autoPlay
              playsInline
              muted
              style={{ display: isCameraActive ? 'block' : 'none' }}
            />

            {!isCameraActive && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, padding: '20px', textAlign: 'center' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--red-subtle)', border: '1px solid var(--red-border)', display: 'grid', placeItems: 'center' }}>
                  <Camera size={26} color="var(--red-bright)" />
                </div>
                <span style={{ fontSize: '0.88rem', color: scannedAsset ? 'var(--green-txt)' : 'var(--txt-muted)', fontWeight: 600 }}>
                  {scanning ? 'Reading QR code tag...' : scannedAsset ? `Scanned: ${scannedAsset.id} (${scannedAsset.name})` : 'Point camera at asset tag or simulate scan below'}
                </span>
              </div>
            )}

            {/* Viewfinder Target & Laser Animation Overlay */}
            <div className="scanner-overlay">
              <div className="scanner-target-box">
                <div className="corner-tl"></div>
                <div className="corner-tr"></div>
                <div className="corner-bl"></div>
                <div className="corner-br"></div>
                {(scanning || isCameraActive) && <div className="scanner-laser"></div>}
              </div>
            </div>
          </div>

          {/* Camera Error / Warning Alert */}
          {cameraError && (
            <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', color: 'var(--amber-txt)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Scanned Tag Success Details Card */}
          {scannedAsset && (
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--green-txt)', fontWeight: 700, letterSpacing: '0.5px' }}>SCANNED TAG IDENTIFIED</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--txt)', marginTop: '2px' }}>{scannedAsset.name}</div>
                <span style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>{scannedAsset.id} · {scannedAsset.location}</span>
              </div>
              <button onClick={handleResetScan} style={{ color: 'var(--txt-sub)', padding: '4px', borderRadius: '4px' }} title="Reset Tag">
                <RefreshCw size={15} />
              </button>
            </div>
          )}

          {/* Camera Controls Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {isCameraActive ? (
              <button className="btn-dark" type="button" onClick={stopCamera} style={{ border: '1px solid var(--red-border)', color: 'var(--red-bright)' }}>
                <VideoOff size={15} /> Stop Camera
              </button>
            ) : (
              <button className="btn-red" type="button" onClick={startCamera}>
                <Video size={15} /> Start Web Camera
              </button>
            )}
          </div>

          {/* Upload QR Image */}
          <div>
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            <button className="btn-dark" type="button" style={{ width: '100%', borderStyle: 'dashed' }} onClick={() => fileInputRef.current?.click()}>
              <Upload size={15} /> Upload QR Code Image Tag
            </button>
          </div>

          {/* Registered Assets Quick-Scan List */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--txt-sub)', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>
              QUICK SCAN REGISTERED CAMPUS ASSETS:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {assets.map(asset => (
                <div
                  key={asset.id}
                  className={`quick-asset-tag ${scannedAsset?.id === asset.id ? 'selected' : ''}`}
                  onClick={() => applyAssetDetails(asset)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <QrCode size={16} color={scannedAsset?.id === asset.id ? 'var(--green-txt)' : 'var(--red-bright)'} />
                    <div>
                      <b style={{ color: scannedAsset?.id === asset.id ? 'var(--green-txt)' : '#ffffff' }}>{asset.id}</b> · {asset.name}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--txt-sub)' }}>{asset.location}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Ticket Form */}
        <form className="portal-card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--red-bright)', fontWeight: 700, letterSpacing: '1px' }}>
              STEP 2
            </span>
            <h3 style={{ marginTop: '2px' }}>Ticket Information</h3>
            {scannedAsset && (
              <p style={{ color: 'var(--green-txt)', fontSize: '0.82rem', marginTop: '4px', fontWeight: 600 }}>
                ✓ Fields auto-populated from Scanned Tag #{scannedAsset.id}
              </p>
            )}
          </div>

          <div className="reg-field">
            <label>Complaint Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Projector HDMI port damaged" required />
          </div>

          {metaLoading && <p>Loading form options…</p>}
          {metaError && <p role="alert">Failed to load form options. Please retry later.</p>}
          <div className="form-grid-2">
            <div className="reg-field">
              <label>Location / Room</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
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
              <label>Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
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

          <div className="form-grid-2">
            <div className="reg-field">
              <label>Priority Level</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger>
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
              <label>Reporter Name</label>
              <input value={`${user?.name || 'Unknown'} (${user?.role || 'User'})`} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
          </div>

          <div className="reg-field">
            <label>Detailed Issue Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe symptoms, error codes, or hardware condition..."
              style={{ background: 'var(--bg-black)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'var(--txt)', fontSize: '0.9rem', resize: 'vertical' }}
            />
          </div>

          <button className="btn-red" type="submit" style={{ marginTop: '8px', padding: '14px' }}>
            <CheckCircle2 size={18} /> Dispatch Ticket to Tech Queue
          </button>
        </form>
      </div>
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


