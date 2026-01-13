'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  MessageSquare,
  Edit3,
  Target,
  CheckSquare,
  Archive,
  DollarSign,
  Settings,
  Share2,
  LogOut
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: <Home size={20} /> },
  { href: '/dashboard/oracle', label: 'AI軍師', icon: <MessageSquare size={20} />, badge: '壁打ち' },
  { href: '/dashboard/sns-writer', label: 'SNS執筆', icon: <Edit3 size={20} /> },
  { href: '/dashboard/spy-mode', label: 'Spyモード', icon: <Target size={20} /> },
  { href: '/dashboard/tasks', label: 'タスク管理', icon: <CheckSquare size={20} /> },
  { href: '/dashboard/archive', label: 'アーカイブ', icon: <Archive size={20} /> },
  { href: '/dashboard/finance', label: '収支ログ', icon: <DollarSign size={20} /> },
];

const bottomNavItems: NavItem[] = [
  { href: '/dashboard/referral', label: '招待', icon: <Share2 size={20} /> },
  { href: '/dashboard/settings', label: '設定', icon: <Settings size={20} /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar glass-card">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-container">
          <div className="logo-icon oracle-glow">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" stroke="url(#logo-gradient)" strokeWidth="2" />
              <circle cx="16" cy="16" r="8" fill="url(#logo-gradient)" opacity="0.8" />
              <circle cx="16" cy="16" r="3" fill="#020205" />
              <path d="M16 2V6M16 26V30M2 16H6M26 16H30" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="1" />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="logo-text-wrapper">
            <span className="logo-text text-gradient">Oracle Hub</span>
            <span className="logo-sub">Brain OS v1.0</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge oracle-glow">{item.badge}</span>}
                {pathname === item.href && (
                  <div className="active-indicator" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        {/* Pro Upgrade Card (Sales Whisper) */}
        <div className="pro-card glass-card">
          <div className="pro-header">
            <span className="pro-icon">💎</span>
            <span className="pro-title">PROプラン</span>
          </div>
          <p className="pro-desc">AI軍師の全機能を開放し、ビジネスを加速させる</p>
          <button className="btn-upgrade">
            アップグレード
          </button>
          <div className="pro-glow" />
        </div>

        <ul className="nav-list bottom-list">
          {bottomNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nav-link sm ${pathname === item.href ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
          <li>
            <button className="nav-link sm logout-btn">
              <span className="nav-icon"><LogOut size={18} /></span>
              <span className="nav-label">ログアウト</span>
            </button>
          </li>
        </ul>
      </div>

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 1rem;
          top: 1rem;
          bottom: 1rem;
          width: 260px;
          display: flex;
          flex-direction: column;
          z-index: 50;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .sidebar-logo {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: linear-gradient(to bottom, rgba(139, 92, 246, 0.05), transparent);
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.3));
        }

        .logo-text-wrapper {
          display: flex;
          flex-direction: column;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .logo-sub {
          font-size: 0.65rem;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 1rem;
          overflow-y: auto;
          /* Custom Scrollbar for Sidebar */
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }

        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0;
          margin: 0;
        }

        .nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem; /* Ensure gap between icon and text */
          padding: 0.875rem 1rem;
          border-radius: 12px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all var(--transition-base);
          border: 1px solid transparent;
          overflow: hidden;
          white-space: nowrap; /* Prevent text wrapping */
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.05);
        }

        .nav-link.active {
          color: var(--text-primary);
          background: linear-gradient(90deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05));
          border-color: rgba(139, 92, 246, 0.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: var(--color-primary-500);
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 8px var(--color-primary-500);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: color var(--transition-base);
        }

        .nav-link:hover .nav-icon,
        .nav-link.active .nav-icon {
          color: var(--color-primary-400);
        }

        .nav-badge {
          font-size: 0.6rem;
          padding: 0.2rem 0.5rem;
          background: var(--color-primary-600);
          border-radius: 4px;
          color: white;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .sidebar-bottom {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(0, 0, 0, 0.2);
        }

        .pro-card {
          position: relative;
          padding: 1rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, rgba(234, 179, 8, 0.05), rgba(234, 179, 8, 0.01));
          border: 1px solid rgba(234, 179, 8, 0.2);
          overflow: hidden;
        }

        .pro-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .pro-title {
          font-weight: 700;
          color: var(--color-gold-400);
          letter-spacing: 0.05em;
        }

        .pro-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .btn-upgrade {
          width: 100%;
          padding: 0.5rem;
          border: none;
          background: linear-gradient(135deg, var(--color-gold-500), var(--color-gold-600));
          color: #000;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: transform var(--transition-fast);
        }

        .btn-upgrade:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3);
        }

        .pro-glow {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 60px;
          height: 60px;
          background: var(--color-gold-500);
          opacity: 0.1;
          filter: blur(20px);
          pointer-events: none;
        }

        .bottom-list {
          gap: 0.25rem;
        }

        .nav-link.sm {
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
        }

        .logout-btn:hover .nav-icon {
          color: var(--color-error-400);
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            top: auto;
            width: 100%;
            height: auto;
            flex-direction: row;
            border-radius: 20px 20px 0 0;
            padding: 0;
            background: rgba(10, 10, 15, 0.95);
            backdrop-filter: blur(20px);
            border: none;
            border-top: 1px solid var(--glass-border);
            z-index: 100;
          }

          .sidebar-logo, .sidebar-bottom {
            display: none;
          }

          .sidebar-nav {
            padding: 0.5rem;
          }

          .nav-list {
            flex-direction: row;
            justify-content: space-around;
            gap: 0;
          }

          .nav-link {
            flex-direction: column;
            padding: 0.5rem;
            font-size: 0.65rem;
            gap: 0.25rem;
            border: none;
            background: transparent !important;
          }

          .nav-icon {
            margin-bottom: 2px;
          }
          
          .active-indicator {
            display: none;
          }
          
          .nav-link.active .nav-icon {
             color: var(--color-primary-400);
             filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.5));
          }
        }
      `}</style>
    </aside>
  );
}
