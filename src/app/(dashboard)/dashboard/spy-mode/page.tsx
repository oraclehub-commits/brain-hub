'use client';

import { useState, useEffect } from 'react';
import { Eye, Search, TrendingUp, Users, BarChart3, Trash2 } from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube';
  followers: number;
  engagement: number;
  lastPost: string;
}

export default function SpyModePage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/competitors');
      const data = await response.json();

      if (data.success) {
        setCompetitors(data.competitors || []);
      } else {
        setError('データの取得に失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
      console.error('Failed to fetch competitors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このライバルを削除しますか？')) return;

    try {
      const response = await fetch(`/api/competitors?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCompetitors();
      }
    } catch (err) {
      console.error('Failed to delete competitor:', err);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📸';
      case 'facebook': return '📘';
      case 'tiktok': return '🎵';
      case 'youtube': return '🎥';
      default: return '🌐';
    }
  };

  return (
    <div className="spy-mode-page">
      <header className="page-header">
        <Eye className="header-icon" size={24} />
        <div>
          <h1>Spy Mode</h1>
          <p className="header-subtitle">手動入力＋AI分析で、ライバルの動向を丸裸にする</p>
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

              <button
                className="btn btn-ghost btn-sm btn-full"
                onClick={() => handleDelete(competitor.id)}
              >
                <Trash2 size={16} />
                削除
              </button>
            </div>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <div className="coming-soon-banner glass-card">
          <div className="banner-content">
            <h3>🤖 AI分析エンジン（準備中）</h3>
            <p>収集したデータをAIが多角的に分析し、勝ち筋を導き出します</p>
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
    </div >
  );
}
