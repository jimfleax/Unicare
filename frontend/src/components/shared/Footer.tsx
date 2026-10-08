import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, MessageSquare, Check, X, ShieldCheck, Sparkles, Send, Globe, Award, Radio } from 'lucide-react'

export function Footer({ onOpenAuth }: { onOpenAuth?: () => void } = {}) {
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpMessage, setHelpMessage] = useState('')
  const [helpSent, setHelpSent] = useState(false)

  // Newsletter state
  const [newsEmail, setNewsEmail] = useState('')
  const [newsSent, setNewsSent] = useState(false)

  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!helpMessage.trim()) return
    setHelpSent(true)
    setTimeout(() => {
      setHelpSent(false)
      setHelpOpen(false)
      setHelpMessage('')
    }, 2200)
  }

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsEmail.trim()) return
    setNewsSent(true)
    setTimeout(() => {
      setNewsSent(false)
      setNewsEmail('')
    }, 3000)
  }

  return (
    <footer className="uniques-site-footer">
      {/* Top Geometric Transition / Notch Header */}
      <div className="footer-top-accent">
        <div className="footer-notch-cutout">
          <div className="footer-notch-line" />
        </div>
      </div>

      {/* Top Quick Stats Card Grid */}
      <div className="footer-stats-strip">
        <div className="footer-stats-grid">
          
          <div className="footer-stat-card stat-card-red">
            <div className="f-stat-icon-wrap red">
              <Sparkles size={26} />
            </div>
            <div className="f-stat-content">
              <div className="f-stat-number">500+</div>
              <div className="f-stat-label">Uniques Alumni &amp; Builders</div>
            </div>
            <div className="f-stat-glow-bar" />
          </div>

          <div className="footer-stat-card stat-card-amber">
            <div className="f-stat-icon-wrap amber">
              <Award size={26} />
            </div>
            <div className="f-stat-content">
              <div className="f-stat-number">Uniques 1.0 &amp; 2.0</div>
              <div className="f-stat-label">Active Student Cohorts</div>
            </div>
            <div className="f-stat-glow-bar" />
          </div>

          <div className="footer-stat-card stat-card-green">
            <div className="f-stat-icon-wrap green">
              <Radio size={26} />
            </div>
            <div className="f-stat-content">
              <div className="f-stat-number">99.4%</div>
              <div className="f-stat-label">Lab Uptime &amp; SLA Triage</div>
            </div>
            <div className="f-stat-glow-bar" />
          </div>

          <div className="footer-stat-card stat-card-blue">
            <div className="f-stat-icon-wrap blue">
              <ShieldCheck size={26} />
            </div>
            <div className="f-stat-content">
              <div className="f-stat-number">&lt; 10s</div>
              <div className="f-stat-label">Instant QR Ticket Logging</div>
            </div>
            <div className="f-stat-glow-bar" />
          </div>

        </div>
      </div>

      <div className="footer-main-container">
        <div className="footer-columns-grid">
          {/* Brand & Mission Column */}
          <div className="footer-col-brand">
            <Link to="/" className="footer-brand-logo-wrap">
              <div className="footer-tu-shield">
                <img src="/uniwhite.png" alt="The Uniques" style={{ width: 72, height: 72, objectFit: 'contain' }} />
              </div>
              <div className="footer-brand-headings">
                <div className="footer-brand-name">
                  the <span>uniques</span>
                </div>
                <div className="footer-brand-subtitle">COMMUNITY × Unicare</div>
              </div>
            </Link>

            <p className="footer-brand-desc">
              The Uniques Community is a premier student-led technical collective at SVIET, pioneering hands-on projects, industry mentorship, and automated smart campus infrastructure.
            </p>
            
            {/* Quick Community Newsletter Box */}
            <div className="footer-newsletter-wrap">
              <span className="fn-label">Stay Connected with Cohort Updates</span>
              {newsSent ? (
                <div className="fn-success">
                  <Check size={14} color="#22c55e" />
                  <span>Subscribed to Uniques Digest!</span>
                </div>
              ) : (
                <form className="fn-form" onSubmit={handleNewsSubmit}>
                  <input
                    type="email"
                    placeholder="Enter institutional email..."
                    value={newsEmail}
                    onChange={e => setNewsEmail(e.target.value)}
                    required
                  />
                  <button type="submit" aria-label="Subscribe">
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Navigate Column */}
          <div className="footer-col">
            <h4 className="footer-col-heading">NAVIGATE</h4>
            <ul className="footer-link-list">
              <li>
                <Link to="/">
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <a href="#mission">
                  <span>Community Mission</span>
                </a>
              </li>
              <li>
                <a href="#guidelines">
                  <span>Innovation Tracks</span>
                </a>
              </li>
              <li>
                <Link to="/dashboard">
                  <span>Maintenance Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Column */}
          <div className="footer-col">
            <h4 className="footer-col-heading">COMMUNITY</h4>
            <ul className="footer-link-list">
              <li>
                <a href="https://theuniques.in" target="_blank" rel="noopener noreferrer">
                  <span>The Uniques Official</span>
                  <ArrowUpRight size={13} className="ext-icon" />
                </a>
              </li>
              <li>
                <Link to="/student">
                  <span>Uniques 1.0 &amp; 2.0 Registry</span>
                </Link>
              </li>
              <li>
                <Link to="/inventory">
                  <span>Campus Lab Inventory</span>
                </Link>
              </li>
              <li>
                <Link to="/issues">
                  <span>Live Issue Ledger</span>
                </Link>
              </li>
              <li>
                {onOpenAuth ? (
                  <button type="button" className="footer-inline-btn" onClick={() => onOpenAuth()}>
                    <span>Member Sign In</span>
                  </button>
                ) : (
                  <Link to="/login">
                    <span>Member Sign In</span>
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Resources Column with Help Assistant Pill */}
          <div className="footer-col footer-col-resources">
            <h4 className="footer-col-heading">RESOURCES</h4>
            <ul className="footer-link-list">
              <li>
                <Link to="/technician">
                  <span>Technician SLA Hub</span>
                </Link>
              </li>
              <li>
                <button type="button" className="footer-inline-btn" onClick={() => setHelpOpen(true)}>
                  <span>Contact Campus Support</span>
                </button>
              </li>
              <li>
                <Link to="/report">
                  <span>Scan Asset QR Code</span>
                </Link>
              </li>
              <li>
                <Link to="/analytics">
                  <span>Uptime &amp; SLA Reports</span>
                </Link>
              </li>
            </ul>

            {/* "I'm here to help" Interactive Pill Badge */}
            <div className="footer-help-pill-wrap">
              <button
                type="button"
                className="footer-help-pill"
                onClick={() => setHelpOpen(!helpOpen)}
                aria-label="Campus Support Assistant"
              >
                <span className="footer-help-text">I'm here to help</span>
                <div className="footer-help-avatar-wrap">
                  <div className="footer-help-avatar">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span className="footer-help-pulse-dot" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar: Copyright + Social Media Circles */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright-text">
            © 2026 The Uniques Community · SVIET. Crafted for next-generation student innovators.
          </div>

          <div className="footer-social-cluster">
            {/* Website */}
            <a
              href="https://theuniques.in"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-circle-btn"
              aria-label="The Uniques Website"
              title="Official Website"
            >
              <Globe size={16} />
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-circle-btn"
              aria-label="LinkedIn Profile"
              title="LinkedIn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-circle-btn"
              aria-label="Instagram Profile"
              title="Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689-.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-circle-btn"
              aria-label="WhatsApp Support Channel"
              title="WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-circle-btn"
              aria-label="GitHub Repository"
              title="GitHub"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Contact / Support Drawer Modal */}
      {helpOpen && (
        <div className="footer-modal-overlay" onClick={() => setHelpOpen(false)}>
          <div className="footer-modal-card" onClick={e => e.stopPropagation()}>
            <div className="footer-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="footer-modal-icon">
                  <MessageSquare size={18} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--txt)' }}>Campus Helpdesk &amp; Support</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>The Uniques × Unicare SVIET</span>
                </div>
              </div>
              <button type="button" className="footer-modal-close" onClick={() => setHelpOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="footer-modal-body">
              {helpSent ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                    <Check size={26} />
                  </div>
                  <h4 style={{ margin: '0 0 6px', color: 'var(--txt)' }}>Query Received!</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--txt-muted)' }}>
                    Our campus lab team &amp; community coordinators will respond shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleHelpSubmit}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', marginBottom: '14px' }}>
                    Have a question regarding lab equipment, batch access, or issue escalations? Send a note directly to our team:
                  </p>
                  <textarea
                    rows={4}
                    value={helpMessage}
                    onChange={e => setHelpMessage(e.target.value)}
                    placeholder="Type your message or inquiry here..."
                    required
                    style={{
                      width: '100%',
                      background: 'var(--bg-card-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'var(--txt)',
                      fontSize: '0.88rem',
                      resize: 'none',
                      outline: 'none',
                      marginBottom: '14px',
                      fontFamily: 'inherit'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className="btn-dark" style={{ padding: '8px 16px', fontSize: '0.82rem' }} onClick={() => setHelpOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-red" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
