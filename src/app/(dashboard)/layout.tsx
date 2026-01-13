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
        }

        .dashboard-main {
          margin-left: 260px;
          margin-top: 64px;
          padding: 2rem;
          min-height: calc(100vh - 64px);
        }

        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
            margin-bottom: 72px;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
