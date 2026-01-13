'use client';

import { useState } from 'react';
import { Eye, Search, TrendingUp, Users, BarChart3 } from 'lucide-react';

interface Competitor {
    id: string;
    name: string;
    platform: 'instagram' | 'x' | 'facebook';
    followers: number;
    engagement: number;
    lastPost: string;
}

const mockCompetitors: Competitor[] = [
    {
        id: '1',
        name: '山田花子（コーチング）',
        platform: 'instagram',
        followers: 15200,
        engagement: 4.8,
        lastPost: '3時間前',
    },
    {
        id: '2',
        name: '田中太郎（マーケティング）',
        platform: 'x',
        followers: 8900,
        engagement: 3.2,
        lastPost: '1日前',
    },
];

export default function SpyModePage() {
    const [competitors] = useState<Competitor[]>(mockCompetitors);

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'instagram': return '📸';
            case 'x': return '𝕏';
            case 'facebook': return '📘';
            default: return '🌐';
        }
    };

    return (
        <div className="spy-mode-page">
            <header className="page-header">
                <Eye className="header-icon" size={24} />
                <div>
                    <h1>Spy Mode</h1>
                    <p className="header-subtitle">ライバルの動向を密かに観察し、戦略を練る</p>
                </div>
            </header>

            <div className="spy-layout">
                {/* Search Bar */}
                <div className="search-bar glass-card">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="ライバルのアカウント名やURLを入力..."
                        className="search-input"
                    />
                    <button className="btn btn-primary">追加</button>

                </div>

                {/* Competitors Grid */}
                <div className="competitors-grid">
                    {competitors.map((competitor) => (
                        <div key={competitor.id} className="competitor-card glass-card">
                            <div className="card-header">
                                <div className="name-row">
                                    <span className="platform-icon">{getPlatformIcon(competitor.platform)}</span>
                                    <h3>{competitor.name}</h3>
                                </div>
                                <span className="last-post">{competitor.lastPost}</span>
                            </div>

                            <div className="stats-grid">
                                <div className="stat">
                                    <Users size={16} />
                                    <div>
                                        <div className="stat-value">{competitor.followers.toLocaleString()}</div>
                                        <div className="stat-label">フォロワー</div>
                                    </div>
                                </div>
                                <div className="stat">
                                    <TrendingUp size={16} />
                                    <div>
                                        <div className="stat-value">{competitor.engagement}%</div>
                                        <div className="stat-label">エンゲージメント</div>
                                    </div>
                                </div>
                            </div>

                            <button className="btn btn-ghost btn-sm btn-full">
                                <BarChart3 size={16} />
                                詳細分析
                            </button>
                        </div>
                    ))}
                </div>

                {/* Coming Soon Banner */}
                <div className="coming-soon-banner glass-card">
                    <div className="banner-content">
                        <h3>🕵️ AIライバル分析（準備中）</h3>
                        <p>AIがライバルの投稿内容、エンゲージメント傾向、最適な投稿タイミングを分析します</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .spy-mode-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .header-icon {
          color: var(--primary);
        }

        .header-subtitle {
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .spy-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .competitors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .competitor-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .name-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .platform-icon {
          font-size: 1.25rem;
        }

        .name-row h3 {
          margin: 0;
          font-size: 1rem;
        }

        .last-post {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding: 1rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: bold;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .btn-full {
          width: 100%;
        }

        .coming-soon-banner {
          padding: 2rem;
          text-align: center;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
        }

        .banner-content h3 {
          margin: 0 0 0.5rem 0;
          color: var(--primary);
        }

        .banner-content p {
          margin: 0;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .competitors-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
