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
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" stroke="url(#logo-gradient)" strokeWidth="2" />
                        <circle cx="16" cy="16" r="8" fill="url(#logo-gradient)" opacity="0.8" />
                        <circle cx="16" cy="16" r="3" fill="#0a0a0f" />
                        <defs>
                            <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                                <stop stopColor="#8b5cf6" />
                                <stop offset="1" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <span className="logo-text text-gradient">Oracle Hub</span>
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
                                {item.badge && <span className="nav-badge">{item.badge}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Bottom Navigation */}
            <div className="sidebar-bottom">
                <ul className="nav-list">
                    {bottomNavItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                    <li>
                        <button className="nav-link logout-btn">
                            <span className="nav-icon"><LogOut size={20} /></span>
                            <span className="nav-label">ログアウト</span>
                        </button>
                    </li>
                </ul>
            </div>

            <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 260px;
          background: var(--bg-surface);
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          z-index: 50;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .logo-icon {
          width: 36px;
          height: 36px;
        }

        .logo-icon svg {
          width: 100%;
          height: 100%;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
        }

        .nav-list {
          list-style: none;
          padding: 0 0.75rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          margin-bottom: 0.25rem;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }

        .nav-link:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .nav-link.active {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%);
          color: var(--text-primary);
          border-left: 3px solid var(--color-primary-500);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .nav-label {
          flex: 1;
        }

        .nav-badge {
          font-size: 0.65rem;
          padding: 0.15rem 0.5rem;
          background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-accent-600) 100%);
          border-radius: 9999px;
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-bottom {
          padding: 1rem 0;
          border-top: 1px solid var(--glass-border);
        }

        .logout-btn:hover {
          color: var(--color-error-400);
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            height: auto;
            top: auto;
            bottom: 0;
            flex-direction: row;
            border-right: none;
            border-top: 1px solid var(--glass-border);
          }

          .sidebar-logo,
          .sidebar-bottom {
            display: none;
          }

          .sidebar-nav {
            width: 100%;
            padding: 0;
          }

          .nav-list {
            display: flex;
            justify-content: space-around;
            padding: 0.5rem;
          }

          .nav-link {
            flex-direction: column;
            padding: 0.5rem;
            font-size: 0.7rem;
            gap: 0.25rem;
          }

          .nav-badge {
            display: none;
          }
        }
      `}</style>
        </aside>
    );
}
