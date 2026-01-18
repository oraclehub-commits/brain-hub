"use client";

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import LineMissionModal from '@/components/LineMissionModal';
import LineReminderBanner from '@/components/LineReminderBanner';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lineUser, setLineUser] = useState<{ connected: boolean; loading: boolean }>({ connected: false, loading: true });
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [showReminderBanner, setShowReminderBanner] = useState(false);

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

  useEffect(() => {
    async function checkLineConnection() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLineUser({ connected: false, loading: false });
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('line_user_id')
        .eq('id', user.id)
        .single();

      const hasLineConnection = !!userData?.line_user_id;
      setLineUser({ connected: hasLineConnection, loading: false });

      // Only show if not connected
      if (!hasLineConnection) {
        // Check if modal was postponed
        const postponedAt = localStorage.getItem('line_mission_postponed');
        if (postponedAt) {
          const daysSincePostponed = (Date.now() - parseInt(postponedAt)) / (1000 * 60 * 60 * 24);
          if (daysSincePostponed < 3) {
            // Show banner instead of modal during postpone period
            setShowReminderBanner(true);
            return;
          }
        }

        // Check if this is first time (show modal)
        const hasSeenModal = localStorage.getItem('line_mission_shown');
        if (!hasSeenModal) {
          setShowMissionModal(true);
          localStorage.setItem('line_mission_shown', 'true');
        } else {
          setShowReminderBanner(true);
        }
      }
    }

    checkLineConnection();
  }, []);

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
      {/* LINE Integration Components */}
      {!lineUser.loading && !lineUser.connected && (
        <>
          <LineMissionModal
            isOpen={showMissionModal}
            onClose={() => setShowMissionModal(false)}
            onPostpone={() => {
              setShowMissionModal(false);
              setShowReminderBanner(true);
            }}
          />
          {showReminderBanner && (
            <LineReminderBanner onDismiss={() => setShowReminderBanner(false)} />
          )}
        </>
      )}

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
