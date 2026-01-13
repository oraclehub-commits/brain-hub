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
            <button className="btn-upgrade-sm">
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
          top: 1rem;
          left: 290px; /* Align with main content */
          right: 1rem;
          height: 64px;
          background: rgba(10, 10, 15, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          z-index: 40;
          transition: all var(--transition-base);
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
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-accent-400);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
        }

        /* Enhanced Free Badge */
        .free-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          padding: 0.25rem 0.25rem 0.25rem 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .badge-free {
            font-size: 0.75rem;
            color: var(--text-muted);
            font-weight: 700;
            letter-spacing: 0.05em;
        }

        .btn-upgrade-sm {
           background: linear-gradient(135deg, var(--color-gold-500), var(--color-gold-600));
           color: #000;
           font-weight: 700;
           font-size: 0.75rem;
           padding: 0.4rem 1rem;
           border-radius: 9999px;
           border: none;
           cursor: pointer;
           transition: transform var(--transition-fast);
        }
        
        .btn-upgrade-sm:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3);
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.4rem;
          padding-right: 0.8rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 9999px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .user-menu-trigger:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .avatar, .avatar-placeholder {
          width: 36px;
          height: 36px;
          border-radius: 50%;
        }

        .avatar-placeholder {
            background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800));
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .user-name {
          font-size: 0.9rem;
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

        /* Float Dropdown */
        .user-dropdown {
          position: absolute;
          top: calc(100% + 1rem);
          right: 0;
          width: 260px;
          padding: 0.5rem;
          background: rgba(15, 15, 25, 0.95);
          z-index: 100;
        }

        .dropdown-header {
            padding: 1rem;
        }

        .dropdown-email {
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .badge-pro {
            background: linear-gradient(135deg, var(--color-gold-500), var(--color-gold-600));
            color: black;
            font-weight: 800;
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
        }

        .dropdown-menu li a,
        .dropdown-menu li button {
             border-radius: 8px;
             margin-bottom: 2px;
        }

        .dropdown-menu li.danger button:hover {
            background: rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 768px) {
          .header {
            left: 0;
            top: 0;
            right: 0;
            width: 100%;
            border-radius: 0;
            border-top: none;
            border-left: none;
            border-right: none;
            background: rgba(10, 10, 15, 0.9);
          }

          .user-name {
            display: none;
          }
          
          .free-badge {
            display: none; /* Hide upgrade button on mobile header to save space */
          }
        }
      `}</style>
    </header>
  );
}
