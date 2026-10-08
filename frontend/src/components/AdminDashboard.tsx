import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, CircleAlert, CheckCircle2, Timer, TrendingUp, TrendingDown,
  Calendar, MapPin, ArrowRight, Plus, Users,
  Clock3, Target, Repeat
} from 'lucide-react'
import type { IssueRecord } from '../types'
import useSWR from 'swr'
import { fetcher } from '../services/api'

import { useAuth } from '../context/AuthContext'

interface AdminDashboardProps {
  records: IssueRecord[]
  onSelectIssue: (issue: IssueRecord) => void
}

function TrendIcon({ value, size }: { value?: string | number; size: number }) {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? '0').replace('%', ''))
  return n < 0 ? <TrendingDown size={size} /> : <TrendingUp size={size} />
}

export function AdminDashboard({ records, onSelectIssue }: AdminDashboardProps) {
  const { data: analytics } = useSWR('/analytics', fetcher, { refreshInterval: 15000 })
  const { data: techData } = useSWR('/users/technicians', fetcher)
  const { data: assetsData } = useSWR('/assets', fetcher)
  const { data: alertsData } = useSWR('/alerts', fetcher)
  const { user } = useAuth()

  const navigate = useNavigate()
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '6m' | '1y'>('6m')
  const { data: trendsData } = useSWR(`/analytics/trends?period=${chartPeriod}`, fetcher)

  // ─── Derived data ───
  const activeRequests = records.filter(r => r.status !== 'Resolved')
  const resolvedRequests = records.filter(r => r.status === 'Resolved')
  const criticalCount = records.filter(r => r.priority === 'Critical' && r.status !== 'Resolved').length
  const highCount = records.filter(r => r.priority === 'High' && r.status !== 'Resolved').length
  const mediumCount = records.filter(r => r.priority === 'Medium' && r.status !== 'Resolved').length
  const lowCount = records.filter(r => r.priority === 'Low' && r.status !== 'Resolved').length

  // Category breakdown
  const categoryMap = new Map<string, number>()
  records.forEach(r => {
    const cat = r.category || 'Other'
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
  })
  const categoryData = Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }))
  const totalCategoryCount = categoryData.reduce((s, c) => s + c.count, 0)

  // Chart data
  const chartData = {
    '7d': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], reported: [5, 8, 6, 9, 7, 3, 4], resolved: [4, 6, 7, 5, 8, 3, 5] },
    '30d': { labels: ['W1', 'W2', 'W3', 'W4'], reported: [18, 24, 21, 19], resolved: [15, 20, 22, 18] },
    '6m': { labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], reported: [42, 51, 47, 63, 58, 71], resolved: [38, 48, 45, 58, 55, 68] },
    '1y': { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], reported: [30, 35, 42, 42, 51, 47, 63, 58, 71, 72, 65, 55], resolved: [28, 32, 38, 38, 48, 45, 58, 55, 68, 70, 62, 53] },
  }[chartPeriod]

  // SVG chart helpers
  const chartW = 540, chartH = 210, chartPad = 42
  const maxVal = Math.max(...chartData.reported, ...chartData.resolved, 1) * 1.15
  const xStep = (chartW - chartPad * 2) / (chartData.labels.length - 1 || 1)
  const toY = (v: number) => chartH - chartPad - ((v / maxVal) * (chartH - chartPad * 2))
  const toX = (i: number) => chartPad + i * xStep
  const makePath = (data: number[]) => data.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')
  const makeArea = (data: number[]) => makePath(data) + ` L${toX(data.length - 1).toFixed(1)},${(chartH - chartPad).toFixed(1)} L${toX(0).toFixed(1)},${(chartH - chartPad).toFixed(1)} Z`

  // Donut
  const donutR = 62, donutStroke = 18, donutCx = 80, donutCy = 80
  const donutCirc = 2 * Math.PI * donutR
  const donutColors = ['var(--red)', 'var(--amber-border)', '#3b82f6', 'var(--green-border)', '#8b5cf6', 'var(--txt-dim)']
  let donutOffset = 0

  // Resolution rate donut
  const totalIssues = records.length || 1
  const resolvePct = Math.round((resolvedRequests.length / totalIssues) * 100)
  const resolveStroke = 14
  const resolveR = 56
  const resolveCirc = 2 * Math.PI * resolveR

  // Campus blocks
  const locationMap = new Map<string, number>()
  records.forEach(r => {
    const loc = r.location || 'Unknown'
    locationMap.set(loc, (locationMap.get(loc) || 0) + 1)
  })
  const fallbackLocColors = ['var(--red)', 'var(--amber-border)', '#3b82f6', 'var(--green-border)']
  const campusBlocks = Array.from(locationMap.entries()).map(([name, issues], i) => ({
    name,
    issues,
    color: fallbackLocColors[i % fallbackLocColors.length]
  }))

  // Greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  // Time ago helper
  const timeAgo = (dateStr: string, timeStr?: string) => {
    const d = new Date(dateStr + (timeStr ? 'T' + timeStr.replace(' PM', '').replace(' AM', '') : ''))
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const priorityMax = Math.max(criticalCount, highCount, mediumCount, lowCount, 1)

  // Technician roster preview
  const fallbackColors = ['var(--red-bright)', '#3b82f6', '#eab308', '#22c55e']
  const techTeam = techData ? techData.map((t: any, i: number) => ({
    name: t.name,
    role: t.role || '—',
    status: t.status || '—',
    color: fallbackColors[i % fallbackColors.length],
    jobs: t.activeJobs || 0
  })) : []

  return (
    <main className="page">
      {/* ═══ HEADER ═══ */}
      <div className="adm-header">
        <div className="adm-header-left">
          <div className="adm-avatar-wrap">
            <div className="adm-avatar">AD</div>
            <span className="adm-avatar-dot" />
          </div>
          <div>
            <p className="adm-greeting">{greeting}, <span>{user?.name?.split(' ')[0] || 'Admin'}!</span></p>
            <h1 className="adm-title">Dashboard</h1>
            <p className="adm-subtitle">Plan, prioritize, and manage your campus maintenance — all in one view.</p>
          </div>
        </div>
        <div className="adm-header-right">
          <div className="adm-header-date">
            <Calendar size={14} />
            <span>{dateStr}</span>
          </div>
          <button className="adm-btn-primary" onClick={() => navigate('/report')}>
            <Plus size={15} /> Report Issue
          </button>
        </div>
      </div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="adm-kpi-row">
        <div className="adm-kpi accent-red" onClick={() => navigate('/inventory')}>
          <div className="adm-kpi-icon-circle icon-red"><Package size={22} /></div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Total Assets</span>
            <span className="adm-kpi-number">{assetsData?.length || 0}</span>
          </div>
          <div className="adm-kpi-badge trend-up"><TrendIcon value={analytics?.assetGrowth} size={12} /> {analytics?.assetGrowth || "0%"} from last month</div>
        </div>

        <div className="adm-kpi accent-amber" onClick={() => navigate('/issues')}>
          <div className="adm-kpi-icon-circle icon-amber"><CircleAlert size={22} /></div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Active Requests</span>
            <span className="adm-kpi-number">{activeRequests.length}</span>
          </div>
          <div className="adm-kpi-badge trend-critical">{criticalCount} Critical</div>
        </div>

        <div className="adm-kpi accent-green" onClick={() => navigate('/analytics')}>
          <div className="adm-kpi-icon-circle icon-green"><CheckCircle2 size={22} /></div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Resolved This Month</span>
            <span className="adm-kpi-number">{analytics?.resolvedThisMonth || 0}</span>
          </div>
          <div className="adm-kpi-badge trend-up"><TrendIcon value={analytics?.resolvedGrowth} size={12} /> {analytics?.resolvedGrowth || "0%"}</div>
        </div>

        <div className="adm-kpi accent-blue" onClick={() => navigate('/analytics')}>
          <div className="adm-kpi-icon-circle icon-blue"><Timer size={22} /></div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Avg Resolution</span>
            <span className="adm-kpi-number">{analytics?.avgResolution || "0h"}</span>
          </div>
          <div className="adm-kpi-badge trend-up">Target &lt; 4h</div>
        </div>
      </div>

      {/* ═══ ANALYTICS + SIDEBAR ═══ */}
      <div className="adm-analytics-row">
        {/* Maintenance Trends Chart */}
        <div className="adm-card adm-chart-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Maintenance Trends</h3>
              <p className="adm-card-sub">Request activity and resolution performance.</p>
            </div>
            <div className="adm-pill-group">
              {(['7d', '30d', '6m', '1y'] as const).map(p => (
                <button key={p} className={`adm-pill ${chartPeriod === p ? 'active' : ''}`} onClick={() => setChartPeriod(p)}>
                  {p === '7d' ? '7D' : p === '30d' ? '30D' : p === '6m' ? '6M' : '1Y'}
                </button>
              ))}
            </div>
          </div>
          <div className="adm-chart-body">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="adm-line-chart">
              {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
                const y = chartH - chartPad - f * (chartH - chartPad * 2)
                const label = Math.round(f * maxVal)
                return (
                  <g key={i}>
                    <line x1={chartPad} y1={y} x2={chartW - chartPad} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
                    <text x={chartPad - 8} y={y + 4} textAnchor="end" fill="var(--txt-sub)" fontSize="10" fontFamily="var(--font-primary)">{label}</text>
                  </g>
                )
              })}
              {chartData.labels.map((l, i) => (
                <text key={i} x={toX(i)} y={chartH - chartPad + 18} textAnchor="middle" fill="var(--txt-sub)" fontSize="10" fontFamily="var(--font-primary)">{l}</text>
              ))}
              <path d={makeArea(chartData.reported)} fill="url(#redGrad)" opacity="0.4" />
              <path d={makeArea(chartData.resolved)} fill="url(#greenGrad)" opacity="0.4" />
              <path d={makePath(chartData.reported)} fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={makePath(chartData.resolved)} fill="none" stroke="var(--green-border)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {chartData.reported.map((v, i) => (
                <circle key={`r${i}`} cx={toX(i)} cy={toY(v)} r="3.5" fill="var(--red)" stroke="var(--bg-card)" strokeWidth="2" />
              ))}
              {chartData.resolved.map((v, i) => (
                <circle key={`g${i}`} cx={toX(i)} cy={toY(v)} r="3.5" fill="var(--green-border)" stroke="var(--bg-card)" strokeWidth="2" />
              ))}
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--red)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--red)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green-border)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--green-border)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="adm-chart-legend">
              <span className="adm-legend-item"><span className="adm-legend-dot" style={{ background: 'var(--red)' }} />Reported</span>
              <span className="adm-legend-item"><span className="adm-legend-dot" style={{ background: 'var(--green-border)' }} />Resolved</span>
            </div>
          </div>
        </div>

        {/* Alerts / Reminders Sidebar */}
        <div className="adm-card adm-alerts-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Alerts & Reminders</h3>
              <p className="adm-card-sub">Scheduled tasks and critical notices.</p>
            </div>
          </div>
          <div className="adm-alerts-list">
            {(alertsData || []).map((item: any, i: number) => (
              <div key={i} className="adm-alert-item">
                <div className={`adm-alert-dot ${item.type === 'alert' ? 'dot-amber' : ''}`} />
                <div className="adm-alert-content">
                  <span className="adm-alert-title">{item.title}</span>
                  <span className="adm-alert-loc"><MapPin size={11} /> {item.loc}</span>
                </div>
                <span className="adm-alert-date">{item.date}</span>
              </div>
            ))}
          </div>
          <button className="adm-card-cta" onClick={() => navigate('/technician')}>View Full Schedule →</button>
        </div>
      </div>

      {/* ═══ TEAM + PROGRESS + DISTRIBUTION ═══ */}
      <div className="adm-triple-row">
        {/* Team Collaboration */}
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Team on Duty</h3>
              <p className="adm-card-sub">Active technicians across campus.</p>
            </div>
            <button className="adm-btn-outline" onClick={() => navigate('/technician')}>+ View Roster</button>
          </div>
          <div className="adm-team-list">
            {techTeam.map((t: any, i: number) => (
              <div key={i} className="adm-team-row">
                <div className="adm-team-avatar" style={{ background: t.color }}>{t.name.split(' ').map((n: string) => n[0]).join('')}</div>
                <div className="adm-team-info">
                  <span className="adm-team-name">{t.name}</span>
                  <span className="adm-team-role">{t.role} · {t.jobs} active jobs</span>
                </div>
                <span className={`adm-team-status ${t.status === 'On Shift' ? 'online' : 'away'}`}>
                  <span className="adm-status-dot" /> {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Issue Resolution Progress */}
        <div className="adm-card adm-progress-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Resolution Rate</h3>
              <p className="adm-card-sub">Overall issue completion.</p>
            </div>
          </div>
          <div className="adm-donut-center">
            <svg viewBox="0 0 160 160" className="adm-resolve-donut">
              <circle cx="80" cy="80" r={resolveR} fill="none" stroke="var(--border)" strokeWidth={resolveStroke} />
              <circle cx="80" cy="80" r={resolveR} fill="none" stroke="var(--green-border)" strokeWidth={resolveStroke}
                strokeDasharray={`${(resolvePct / 100) * resolveCirc} ${resolveCirc}`}
                strokeDashoffset={resolveCirc * 0.25}
                strokeLinecap="round"
                style={{ transition: 'all 0.8s ease' }} />
              <text x="80" y="74" textAnchor="middle" fill="var(--txt)" fontSize="28" fontWeight="800" fontFamily="var(--font-display)">{resolvePct}%</text>
              <text x="80" y="96" textAnchor="middle" fill="var(--txt-sub)" fontSize="11" fontFamily="var(--font-primary)">Resolved</text>
            </svg>
            <div className="adm-resolve-stats">
              <div><span className="adm-rs-dot" style={{ background: 'var(--green-border)' }} /> Resolved <b>{resolvedRequests.length}</b></div>
              <div><span className="adm-rs-dot" style={{ background: 'var(--amber-border)' }} /> In Progress <b>{records.filter(r => r.status === 'In Progress').length}</b></div>
              <div><span className="adm-rs-dot" style={{ background: 'var(--red)' }} /> Open <b>{records.filter(r => r.status === 'Open').length}</b></div>
            </div>
          </div>
        </div>

        {/* Issues by Category (Donut) */}
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">By Category</h3>
              <p className="adm-card-sub">Issue distribution.</p>
            </div>
          </div>
          <div className="adm-donut-center">
            <svg viewBox="0 0 160 160" className="adm-category-donut">
              {categoryData.map((cat, i) => {
                const pct = cat.count / totalCategoryCount
                const dashLen = pct * donutCirc
                const gap = donutCirc - dashLen
                const currentOffset = donutOffset
                donutOffset += dashLen
                return (
                  <circle key={i} cx={donutCx} cy={donutCy} r={donutR} fill="none" stroke={donutColors[i]} strokeWidth={donutStroke}
                    strokeDasharray={`${dashLen} ${gap}`} strokeDashoffset={-currentOffset}
                    transform={`rotate(-90 ${donutCx} ${donutCy})`} style={{ transition: 'all 0.6s ease' }} />
                )
              })}
              <text x={donutCx} y={donutCy - 4} textAnchor="middle" fill="var(--txt)" fontSize="22" fontWeight="800" fontFamily="var(--font-display)">{totalCategoryCount}</text>
              <text x={donutCx} y={donutCy + 14} textAnchor="middle" fill="var(--txt-sub)" fontSize="10" fontFamily="var(--font-primary)">Total</text>
            </svg>
          </div>
          <div className="adm-cat-legend">
            {categoryData.map((cat, i) => (
              <div key={i} className="adm-cat-row">
                <span className="adm-legend-dot" style={{ background: donutColors[i] }} />
                <span className="adm-cat-name">{cat.name}</span>
                <span className="adm-cat-count">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ ACTIVE REQUESTS TABLE ═══ */}
      <div className="adm-card adm-table-card">
        <div className="adm-card-head">
          <div>
            <div className="adm-live-dot"><span /> LIVE</div>
            <h3 className="adm-card-title">Active Maintenance Requests</h3>
            <p className="adm-card-sub">Real-time issue pipeline across campus labs.</p>
          </div>
          <button className="adm-btn-outline" onClick={() => navigate('/issues')}>View All Requests →</button>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Location</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Reported</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 5).map(r => (
                <tr key={r.id}>
                  <td><span className="adm-issue-title">{r.title}</span></td>
                  <td><span className="adm-loc-chip"><MapPin size={12} /> {r.location}</span></td>
                  <td><span className="adm-cat-chip">{r.category}</span></td>
                  <td>
                    <span className={`badge-status ${r.priority.toLowerCase()}`}>
                      <span className="status-dot" /> {r.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-status ${r.status === 'Resolved' ? 'available' : r.status === 'In Progress' ? 'in-progress' : 'critical'}`}>
                      <span className="status-dot" /> {r.status}
                    </span>
                  </td>
                  <td><span className="adm-time-ago">{timeAgo(r.date, r.time)}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="adm-action-btn" onClick={() => onSelectIssue(r)}>View <ArrowRight size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ BOTTOM ROW: PERFORMANCE + PRIORITY + CAMPUS ═══ */}
      <div className="adm-bottom-row">
        {/* Performance Metrics */}
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Performance</h3>
              <p className="adm-card-sub">SLA and resolution metrics.</p>
            </div>
          </div>
          <div className="adm-perf-grid">
            <div className="adm-perf-item">
              <div className="adm-perf-icon"><Clock3 size={16} /></div>
              <span className="adm-perf-label">First Response</span>
              <span className="adm-perf-value">{analytics?.firstResponse || "0 min"}</span>
              <span className="adm-perf-trend"><TrendIcon value={analytics?.firstResponseTrend} size={11} /> {analytics?.firstResponseTrend || "0%"}</span>
            </div>
            <div className="adm-perf-item">
              <div className="adm-perf-icon"><Timer size={16} /></div>
              <span className="adm-perf-label">Avg Resolution</span>
              <span className="adm-perf-value">{analytics?.avgResolution || "0h"}</span>
              <span className="adm-perf-trend"><TrendIcon value={analytics?.avgResolutionTrend} size={11} /> {analytics?.avgResolutionTrend || "0%"}</span>
            </div>
            <div className="adm-perf-item">
              <div className="adm-perf-icon"><Target size={16} /></div>
              <span className="adm-perf-label">SLA Compliance</span>
              <span className="adm-perf-value">{analytics ? Math.round(analytics.slaCompliance) + '%' : '—'}</span>
              <div className="adm-perf-bar"><div className="adm-perf-bar-fill" style={{ width: analytics ? `${Math.round(analytics.slaCompliance)}%` : '0%' }} /></div>
            </div>
            <div className="adm-perf-item">
              <div className="adm-perf-icon"><Repeat size={16} /></div>
              <span className="adm-perf-label">Resolved Issues</span>
              <span className="adm-perf-value">{analytics?.resolvedIncidents || 0}</span>
              <span className="adm-perf-trend"><TrendingUp size={11} /> Total</span>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Priority Breakdown</h3>
              <p className="adm-card-sub">Active workload severity.</p>
            </div>
          </div>
          <div className="adm-priority-list">
            {[
              { label: 'Critical', count: criticalCount, color: 'var(--red)' },
              { label: 'High', count: highCount, color: 'var(--amber-border)' },
              { label: 'Medium', count: mediumCount, color: 'var(--txt-sub)' },
              { label: 'Low', count: lowCount, color: 'var(--border-bright)' },
            ].map((p, i) => (
              <div key={i} className="adm-priority-item">
                <div className="adm-priority-label">
                  <span className="adm-priority-dot" style={{ background: p.color }} />
                  <span>{p.label}</span>
                </div>
                <div className="adm-priority-bar-wrap">
                  <div className="adm-priority-bar" style={{ width: `${(p.count / (priorityMax || 1)) * 100}%`, background: p.color }} />
                </div>
                <span className="adm-priority-count">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Campus Hotspots */}
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Campus Hotspots</h3>
              <p className="adm-card-sub">Issue concentration by block.</p>
            </div>
          </div>
          <div className="adm-campus-list">
            {campusBlocks.sort((a, b) => b.issues - a.issues).map((b, i) => (
              <div key={i} className="adm-campus-row">
                <span className="adm-campus-dot" style={{ background: b.color }} />
                <span className="adm-campus-name">{b.name}</span>
                <div className="adm-campus-bar-wrap">
                  <div className="adm-campus-bar" style={{ width: `${(b.issues / Math.max(...campusBlocks.map(c => c.issues), 1)) * 100}%`, background: b.color }} />
                </div>
                <span className="adm-campus-count">{b.issues}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ QUICK ACTIONS ═══ */}
      <div className="adm-card adm-quick-card">
        <div className="adm-card-head">
          <div>
            <h3 className="adm-card-title">Quick Actions</h3>
            <p className="adm-card-sub">Frequently used admin shortcuts.</p>
          </div>
        </div>
        <div className="adm-quick-row">
          <button className="adm-btn-primary" onClick={() => navigate('/report')}><Plus size={16} /> Report an Issue</button>
          <button className="adm-btn-secondary" onClick={() => navigate('/inventory')}><Package size={16} /> View Inventory</button>
          <button className="adm-btn-secondary" onClick={() => navigate('/technician')}><Calendar size={16} /> Schedule Maintenance</button>
          <button className="adm-btn-secondary" onClick={() => navigate('/technician')}><Users size={16} /> Manage Technicians</button>
        </div>
      </div>
    </main>
  )
}
