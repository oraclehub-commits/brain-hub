"use client";

import Link from 'next/link';
import { MessageSquare, Edit3, Target, CheckSquare, Archive, DollarSign, Sparkles } from 'lucide-react';

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
  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <section className="welcome-section animate-fade-in">
        <div className="welcome-content">
          <h1 className="welcome-title">
            おかえりなさい、<span className="text-gradient">ゲスト</span>さん
          </h1>
          <p className="welcome-subtitle">
            今日も一緒に、あなたのビジネスを加速させましょう。
          </p>
        </div>
        <div className="oracle-tip glass-card">
          <div className="tip-header">
            <Sparkles size={18} className="tip-icon" />
            <span>Oracleからの提案</span>
          </div>
          <p className="tip-content">
            最近SNS投稿が減っているようです。継続的な発信がフォロワーとの信頼構築に繋がります。
            今日1投稿を目標にしてみませんか？
          </p>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="quick-actions">
        <h2 className="section-title">クイックアクション</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className={`action-card glass-card ${action.primary ? 'primary' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className="action-icon"
                style={{ background: action.gradient }}
              >
                {action.icon}
              </div>
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
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
            <div className="stat-value text-gradient">12</div>
            <div className="stat-label">相談回数</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value text-gradient">8</div>
            <div className="stat-label">SNS投稿</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value text-gradient">15</div>
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

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .quick-actions {
          margin-bottom: 2.5rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1rem;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          text-decoration: none;
          transition: all var(--transition-base);
          animation: fade-in 0.4s ease-out forwards;
          opacity: 0;
        }

        .action-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-primary-500);
        }

        .action-card.primary {
          grid-column: span 2;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%);
          border-color: var(--color-primary-500);
        }

        .action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          color: white;
          flex-shrink: 0;
        }

        .action-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .action-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .stats-section {
          margin-bottom: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .stat-card {
          text-align: center;
          padding: 1.5rem 1rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .welcome-section {
            grid-template-columns: 1fr;
          }

          .action-card.primary {
            grid-column: span 1;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
