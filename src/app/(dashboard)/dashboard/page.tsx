"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Edit3, Target, CheckSquare, Archive, DollarSign, Sparkles, Brain } from 'lucide-react';
import { DiagnosisResultModal } from '@/components/DiagnosisResultModal';
import { createClient } from '@/lib/supabase/client';

const quickActions = [
  {
    href: '/dashboard/oracle',
    title: 'AI軍師に相談',
    description: '悩みを壁打ちして、思考を整理',
    icon: <MessageSquare size={24} />,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    primary: true,
  },
  {
    href: '/dashboard/sns-writer',
    title: 'SNS投稿を作成',
    description: '1タップで魅力的な投稿を生成',
    icon: <Edit3 size={24} />,
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
  {
    href: '/dashboard/tasks',
    title: '今日のタスク確認',
    description: 'AIが提案する優先タスク',
    icon: <CheckSquare size={24} />,
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  },
  {
    href: '/dashboard/spy-mode',
    title: 'ライバル分析',
    description: '競合の弱点を発見',
    icon: <Target size={24} />,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
];

export default function DashboardPage() {
  /* Existing State */
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [loading, setLoading] = useState(true);

  /* New Stats State */
  const [stats, setStats] = useState({
    weeklyTasks: 0,
    weeklyPosts: 0,
    weeklyRevenue: 0
  });

  const supabase = createClient();

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        await checkPendingDiagnosis();
        await fetchDiagnosisResult();
        await fetchStats();
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session) {
            await checkPendingDiagnosis();
            await fetchDiagnosisResult();
            await fetchStats();
          }
        });
        return () => subscription.unsubscribe();
      }
    };
    initDashboard();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  /* Diagnosis Sync & Fetch Logic */
  const checkPendingDiagnosis = async () => {
    try {
      const pendingDiagnosis = localStorage.getItem('pendingDiagnosis');
      if (pendingDiagnosis) {
        const result = JSON.parse(pendingDiagnosis);
        // Sync to server
        const response = await fetch('/api/diagnosis', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: result.type,
            shadow: result.shadow,
            solution: result.solution
          })
        });
        const data = await response.json();
        if (!response.ok) {
          console.error('❌ Failed to sync diagnosis:', data);
          return;
        }
        localStorage.removeItem('pendingDiagnosis');
      }
    } catch (error) {
      console.error('Failed to sync diagnosis:', error);
    }
  };

  const fetchDiagnosisResult = async () => {
    try {
      const response = await fetch('/api/diagnosis');
      const data = await response.json();
      if (data.success && data.hasDiagnosis) {
        setDiagnosisResult(data.result);
      }
    } catch (error) {
      console.error('Failed to fetch diagnosis:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <section className="welcome-section">
        <h1 className="welcome-title animate-fade-in">
          Welcome back, <span className="text-gradient">Commander</span>
        </h1>
        <p className="welcome-subtitle animate-fade-in" style={{ animationDelay: '0.1s' }}>
          本日の戦略を実行しましょう。
        </p>
      </section>

      {/* Diagnosis Section (HUD Style) */}
      {!loading && (
        <section className="diagnosis-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {diagnosisResult ? (
            <div className="diagnosis-card glass-card">
              <div className="diagnosis-bg-glow" />
              <div className="diagnosis-content">
                <div className="diagnosis-icon-wrapper">
                  <span style={{ fontSize: '2rem' }}>{diagnosisResult.artwork || <Brain size={32} />}</span>
                </div>
                <div className="diagnosis-info">
                  <div className="diagnosis-label">Current Strategy Pattern</div>
                  <h2 className="diagnosis-title">
                    CODE: <span className="text-gradient">{diagnosisResult.type}</span>
                  </h2>
                  <p className="diagnosis-catchcopy">p.{diagnosisResult.name} // {diagnosisResult.catchcopy}</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowResultModal(true)}
                >
                  データ詳細
                </button>
              </div>
            </div>
          ) : (
            <div className="diagnosis-card glass-card empty">
              <div className="diagnosis-empty">
                <Brain size={42} className="text-muted" />
                <div>
                  <h3>No Strategy Data</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>思考OSが未特定です。診断を実行してロックを解除してください。</p>
                </div>
                <Link href="/dashboard/finance" className="btn btn-accent btn-sm">
                  診断を実行
                </Link>
              </div>
            </div>
          )}
        </section>
      )}

      {showResultModal && diagnosisResult && (
        <DiagnosisResultModal
          result={diagnosisResult}
          onClose={() => setShowResultModal(false)}
        />
      )}

      {/* Quick Actions Grid */}
      <section className="quick-actions-section animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h2 className="section-label">COMMAND MODULES</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <Link href={action.href} key={action.href} className="action-card-link">
              <div className={`action-card glass-card ${action.primary ? 'primary' : ''}`}>
                <div
                  className="action-icon-wrapper"
                  style={{ background: action.gradient }}
                >
                  {action.icon}
                </div>
                <div className="action-info">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <div className="action-glow" style={{ background: action.gradient }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Overview */}
      <section className="stats-section">
        <h2 className="section-title">今週の活動</h2>
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-value text-gradient">¥{stats.weeklyRevenue.toLocaleString()}</div>
            <div className="stat-label">週間収益</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value text-gradient">{stats.weeklyPosts}</div>
            <div className="stat-label">SNS投稿</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value text-gradient">{stats.weeklyTasks}</div>
            <div className="stat-label">完了タスク</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value">
              <div className="health-score">
                <div className="health-score-bar">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`health-score-segment ${level <= 3 ? `active level-${level}` : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="stat-label">ビジネス健全度</div>
          </div>
        </div>
      </section>

      {/* Whisper Message */}
      <div className="whisper animate-fade-in" style={{ animationDelay: '0.5s' }}>
        あなたのビジネスは順調に見えます。しかし、数字の把握が曖昧なままだと、
        次のステージで躓きやすくなります。収支ログを活用して、経営者としての視座を高めることをお勧めします。
      </div>

      <style jsx>{`
        .dashboard-home {
          max-width: 1200px;
          margin: 0 auto;
        }

        .welcome-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        .welcome-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .welcome-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .oracle-tip {
          padding: 1.25rem;
        }

        .tip-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-accent-400);
        }

        .tip-icon {
          color: var(--color-accent-400);
        }

        .tip-content {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .diagnosis-section {
          margin-bottom: 2.5rem;
          opacity: 0;
          animation: fade-in 0.4s ease-out forwards;
        }

        .diagnosis-card {
          padding: 2rem;
        }

        /* Diagnosis Card (HUD) */
        .diagnosis-card {
           position: relative;
           overflow: hidden;
           border: 1px solid rgba(139, 92, 246, 0.3);
           background: rgba(15, 15, 25, 0.6);
           margin-bottom: 3rem;
           transition: all 0.3s ease;
        }
        
        .diagnosis-card:hover {
            border-color: rgba(139, 92, 246, 0.5);
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.15);
        }

        .diagnosis-card.empty {
            border-style: dashed;
            background: rgba(255, 255, 255, 0.02);
            padding: 2rem;
            display: flex;
            justify-content: center;
        }
        
        .diagnosis-empty {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .diagnosis-bg-glow {
            position: absolute;
            top: 0;
            right: 0;
            width: 400px;
            height: 100%;
            background: radial-gradient(circle at 100% 50%, rgba(139, 92, 246, 0.15), transparent 70%);
            pointer-events: none;
        }

        .diagnosis-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .diagnosis-icon-wrapper {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary-400);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
        }

        .diagnosis-info {
          flex: 1;
        }

        .diagnosis-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: var(--text-muted);
            margin-bottom: 0.4rem;
        }

        .diagnosis-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          letter-spacing: -0.02em;
        }
        
        .diagnosis-catchcopy {
            color: var(--text-secondary);
            font-family: monospace;
            font-size: 0.9rem;
        }

        /* Quick Actions */
        .section-label {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--text-muted);
            letter-spacing: 0.1em;
            margin-bottom: 1rem;
            padding-left: 0.5rem;
            border-left: 3px solid var(--color-accent-500);
            text-transform: uppercase;
        }

        .quick-actions-section {
          margin-bottom: 3rem;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .action-card-link {
            text-decoration: none;
        }

        .action-card {
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          height: 100%;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .action-card:hover {
          transform: translateY(-4px);
        }

        .action-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1;
        }

        .action-info {
           z-index: 1;
        }

        .action-info h3 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .action-info p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .action-glow {
            position: absolute;
            top: -50px;
            right: -50px;
            width: 100px;
            height: 100px;
            filter: blur(40px);
            opacity: 0.15;
            transition: opacity 0.3s ease;
        }

        .action-card:hover .action-glow {
            opacity: 0.3;
        }
        
        /* Loading & Errors */
        .diagnosis-empty h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        /* Stats (Legacy Support) */
        .stats-section {
            margin-bottom: 2rem;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
        }

        .stat-card {
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            line-height: 1;
        }
        
        .stat-label {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        @media (max-width: 768px) {
          .welcome-title {
            font-size: 2rem;
          }
          
          .diagnosis-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
            padding: 1.5rem;
          }

          .diagnosis-bg-glow {
            width: 100%;
            height: 50%;
            top: 0;
            background: linear-gradient(to bottom, rgba(139, 92, 246, 0.15), transparent);
          }
          
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div >
  );
}
