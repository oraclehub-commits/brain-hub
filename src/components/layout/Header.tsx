'use client';

import { useState, useEffect } from 'react';
import { User, Crown, ChevronDown, Brain } from 'lucide-react';
import type { Subscription } from '@/types';

interface HeaderProps {
  userName?: string;
  avatarUrl?: string;
  subscription?: Subscription;
}

export function Header({ userName, avatarUrl, subscription }: HeaderProps) {
  const [proTimeLeft, setProTimeLeft] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Calculate Pro mode countdown
  useEffect(() => {
    if (subscription?.tier !== 'PRO' || !subscription.pro_expires_at) return;

    const updateCountdown = () => {
      const now = new Date();
      const expires = new Date(subscription.pro_expires_at!);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setProTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        setProTimeLeft(`${days}日${hours}時間`);
      } else {
        setProTimeLeft(`${hours}時間`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [subscription]);

  const isPro = subscription?.tier === 'PRO';

  return (
    <header className="header">
      <div className="header-content">
        {/* Pro Mode Countdown */}
        {isPro && proTimeLeft && (
          <div className="pro-countdown">
            <Crown size={16} />
            <span>PROモード: 残り {proTimeLeft}</span>
          </div>
        )}

        {/* Free user badge */}
        {!isPro && (
          <div className="free-badge">
            <span className="badge badge-free">FREE</span>
            <button className="btn btn-accent btn-sm">
              PROにアップグレード
            </button>
          </div>
        )}

        {/* User Menu */}
        <div className="user-menu">
          <button
            className="user-menu-trigger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName || 'User'} className="avatar" />
            ) : (
              <div className="avatar-placeholder">
                <User size={20} />
              </div>
            )}
            <span className="user-name">{userName || 'ゲスト'}</span>
            <ChevronDown size={16} className={`chevron ${isMenuOpen ? 'open' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className="user-dropdown glass-card animate-fade-in">
              <div className="dropdown-header">
                <p className="dropdown-email">{userName}</p>
                <span className={`badge ${isPro ? 'badge-pro' : 'badge-free'}`}>
                  {isPro ? 'PRO' : 'FREE'}
                </span>
              </div>
              <div className="dropdown-divider" />
              <ul className="dropdown-menu">
                <li><a href="/dashboard/settings">設定</a></li>
                <li><a href="/dashboard/referral">友達を招待</a></li>
                <li className="danger"><button>ログアウト</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 260px;
          right: 0;
          height: 64px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--glass-border);
          z-index: 40;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1rem;
          height: 100%;
          padding: 0 1.5rem;
        }

        .pro-countdown {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-accent-400);
        }

        .free-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
        }

        .user-menu {
          position: relative;
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          background: transparent;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .user-menu-trigger:hover {
          background: var(--bg-hover);
          border-color: var(--color-primary-500);
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .chevron {
          color: var(--text-muted);
          transition: transform var(--transition-fast);
        }

        .chevron.open {
          transform: rotate(180deg);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 240px;
          padding: 0.75rem;
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
        }

        .dropdown-email {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--glass-border);
          margin: 0.5rem 0;
        }

        .dropdown-menu {
          list-style: none;
        }

        .dropdown-menu li a,
        .dropdown-menu li button {
          display: block;
          width: 100%;
          padding: 0.625rem 0.5rem;
          text-align: left;
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-decoration: none;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .dropdown-menu li a:hover,
        .dropdown-menu li button:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .dropdown-menu li.danger button {
          color: var(--color-error-400);
        }

        @media (max-width: 768px) {
          .header {
            left: 0;
          }

          .user-name {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
