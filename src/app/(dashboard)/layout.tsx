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
          margin-left: 280px; /* Sidebar width + gap */
          margin-right: 1rem;
          margin-top: 0;
          padding-top: 100px; /* Ensure content starts below the floating header */
          padding-left: 2rem;
          padding-right: 2rem;
          padding-bottom: 2rem;
          min-height: 100vh;
          background: transparent;
        }

        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
            margin-right: 0;
            margin-top: 0;
            padding-top: 80px; /* Header height + gap */
            padding-bottom: 100px; /* Bottom nav height */
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
