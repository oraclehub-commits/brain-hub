"use client";

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Fetch user data and subscription from Supabase
  const mockUser = {
    name: 'ゲストユーザー',
    avatarUrl: null,
  };

  const mockSubscription = {
    id: '1',
    user_id: '1',
    tier: 'FREE' as const,
    pro_expires_at: null,
    pro_source: null,
    referral_count: 0,
  };

  return (
    <div className="dashboard-layout">
      {/* Background Ambience */}
      <div className="ambient-sphere primary" />
      <div className="ambient-sphere accent" />

      <Sidebar />
      <Header
        userName={mockUser.name}
        avatarUrl={mockUser.avatarUrl || undefined}
        subscription={mockSubscription}
      />
      <main className="dashboard-main">
        {children}
      </main>

      <style jsx>{`
        .dashboard-layout {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        .ambient-sphere {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          z-index: -1;
          pointer-events: none;
        }

        .ambient-sphere.primary {
          width: 600px;
          height: 600px;
          top: -100px;
          left: -100px;
          background: var(--color-primary-600);
        }

        .ambient-sphere.accent {
          width: 500px;
          height: 500px;
          bottom: -100px;
          right: -100px;
          background: var(--color-accent-500);
        }

        .dashboard-main {
          margin-left: 290px; /* 260px (sidebar) + 1rem (gap) + 1rem (left) */
          margin-right: 1rem;
          margin-top: 1rem;
          padding: 2rem;
          min-height: calc(100vh - 2rem);
          background: transparent;
          /* Optional: Glass panel for main content area if needed, but keeping clean for now */
        }

        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
            margin-right: 0;
            margin-top: 64px; /* Header height */
            margin-bottom: 80px; /* Bottom nav height */
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
