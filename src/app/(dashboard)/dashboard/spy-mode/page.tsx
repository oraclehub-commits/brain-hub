'use client';

import { useState, useEffect } from 'react';
import { Eye, Plus, TrendingUp, Users, Trash2, Brain, FileText, ExternalLink, X, Save } from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube';
  followers: string;
  url: string;
  post_frequency: string;
  recent_posts: string[];
  notes: string;
  analysis_result: any;
  updated_at: string;
}

export default function SpyModePage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null); // For result modal

  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    platform: 'instagram' as const,
    url: '',
    followers: '',
    postFrequency: '',
    recentPosts: '', // Textarea input (split by newlines)
    notes: ''
  });

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
      }
    } catch (err) {
      console.error('Failed to fetch competitors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Split recent posts by newline and filter empty strings
      const postsArray = newCompetitor.recentPosts
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCompetitor,
          recentPosts: postsArray
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        setNewCompetitor({
          name: '',
          platform: 'instagram',
          url: '',
          followers: '',
          postFrequency: '',
          recentPosts: '',
          notes: ''
        });
        await fetchCompetitors();
      } else {
        alert(`登録失敗: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to add competitor:', err);
      alert('エラーが発生しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このライバルを削除しますか？')) return;
    try {
      await fetch(`/api/competitors?id=${id}`, { method: 'DELETE' });
      await fetchCompetitors();
    } catch (err) {
      console.error('Deletion failed:', err);
    }
  };

  const handleAnalyze = async (competitor: Competitor) => {
    if (analyzingId) return;
    setAnalyzingId(competitor.id);

    try {
      const response = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: competitor.id,
          name: competitor.name,
          platform: competitor.platform,
          followers: competitor.followers,
          postFrequency: competitor.post_frequency,
          recentPosts: competitor.recent_posts,
          notes: competitor.notes
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state immediately
        const updatedCompetitors = competitors.map(c =>
          c.id === competitor.id ? { ...c, analysis_result: data.analysis } : c
        );
        setCompetitors(updatedCompetitors);
        setSelectedAnalysis(data.analysis); // Auto open result
      } else {
        alert(`AI分析失敗: ${data.error}`);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzingId(null);
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
          <h1>Spy Mode (Manual + AI)</h1>
          <p className="header-subtitle">手動入力＋AI分析で、ライバルの動向を丸裸にする</p>
        </div>
      </header>

      <div className="spy-layout">
        <div className="actions-bar">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> 新規ライバル登録
          </button>
        </div>

        <div className="competitors-grid">
          {competitors.map((competitor) => (
            <div key={competitor.id} className="competitor-card glass-card">
              <div className="card-header">
                <div className="name-row">
                  <span className="platform-icon">{getPlatformIcon(competitor.platform)}</span>
                  <h3>{competitor.name}</h3>
                </div>
                {competitor.url && (
                  <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="link-icon">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              <div className="stats-list">
                <div className="stat-item">
                  <Users size={14} className="text-muted" />
                  <span>{competitor.followers || '-'} フォロワー</span>
                </div>
                <div className="stat-item">
                  <TrendingUp size={14} className="text-muted" />
                  <span>投稿頻度: {competitor.post_frequency || '-'}</span>
                </div>
              </div>

              <div className="card-actions">
                {competitor.analysis_result ? (
                  <button
                    className="btn btn-accent btn-sm btn-full"
                    onClick={() => setSelectedAnalysis(competitor.analysis_result)}
                  >
                    <Brain size={16} /> 分析結果を見る
                  </button>
                ) : (
                  <button
                    className="btn btn-outline btn-sm btn-full"
                    onClick={() => handleAnalyze(competitor)}
                    disabled={analyzingId === competitor.id}
                  >
                    {analyzingId === competitor.id ? 'AI分析中...' : 'AI分析を実行'}
                  </button>
                )}

                <button
                  className="btn-icon-only text-muted"
                  onClick={() => handleDelete(competitor.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {competitors.length === 0 && !loading && (
            <div className="empty-state">
              <p>ライバルがまだ登録されていません。「新規ライバル登録」から情報を入力してください。</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>新規ライバル登録</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCompetitor} className="spy-form">
              <div className="form-group">
                <label>基本情報</label>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="アカウント名"
                    required
                    value={newCompetitor.name}
                    onChange={e => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                  />
                  <select
                    value={newCompetitor.platform}
                    onChange={e => setNewCompetitor({ ...newCompetitor, platform: e.target.value as any })}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
                <input
                  type="url"
                  placeholder="プロフィールURL (Optional)"
                  value={newCompetitor.url}
                  onChange={e => setNewCompetitor({ ...newCompetitor, url: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="form-group">
                <label>規模・頻度</label>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="フォロワー数 (例: 1.5万人)"
                    value={newCompetitor.followers}
                    onChange={e => setNewCompetitor({ ...newCompetitor, followers: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="投稿頻度 (例: 週3回)"
                    value={newCompetitor.postFrequency}
                    onChange={e => setNewCompetitor({ ...newCompetitor, postFrequency: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>直近の投稿内容 (AI分析用)</label>
                <textarea
                  placeholder="直近の投稿内容やタイトルを改行区切りで入力してください..."
                  rows={4}
                  value={newCompetitor.recentPosts}
                  onChange={e => setNewCompetitor({ ...newCompetitor, recentPosts: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>考察メモ</label>
                <textarea
                  placeholder="気づいた点など..."
                  rows={2}
                  value={newCompetitor.notes}
                  onChange={e => setNewCompetitor({ ...newCompetitor, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                <Save size={18} /> 保存する
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Analysis Result Modal */}
      {selectedAnalysis && (
        <div className="modal-overlay" onClick={() => setSelectedAnalysis(null)}>
          <div className="modal-content glass-card result-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Brain className="text-accent" /> AI分析レポート</h2>
              <button onClick={() => setSelectedAnalysis(null)}><X size={20} /></button>
            </div>
            <div className="analysis-body">
              <section>
                <h3 className="text-warning">⚠️ 弱点・攻略の糸口</h3>
                <ul>
                  {selectedAnalysis.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                </ul>
              </section>
              <section>
                <h3 className="text-success">💎 差別化戦略</h3>
                <ul>
                  {selectedAnalysis.differentiation?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
              </section>
              <section className="advice-section">
                <h3>📢 軍師の総評</h3>
                <p>{selectedAnalysis.advice}</p>
              </section>
            </div>
          </div>
        </div>
      )}

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
        .header-icon { color: var(--primary); }
        .header-subtitle { color: var(--text-secondary); margin-top: 0.25rem; }
        
        .actions-bar { margin-bottom: 1.5rem; }
        
        .competitors-grid {
           display: grid;
           grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
           gap: 1.5rem;
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
           align-items: center;
        }
        .name-row {
           display: flex;
           align-items: center;
           gap: 0.5rem;
        }
        .name-row h3 { font-size: 1.1rem; font-weight: 600; margin: 0; }
        .platform-icon { font-size: 1.25rem; }
        .link-icon { color: var(--text-muted); transition: color 0.2s; }
        .link-icon:hover { color: var(--primary); }

        .stats-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        .stat-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .text-muted { color: var(--text-muted); }

        .card-actions {
            margin-top: auto;
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        .btn-full { flex: 1; }
        .btn-icon-only {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.4rem;
            border-radius: 4px;
            transition: background 0.2s;
        }
        .btn-icon-only:hover { background: rgba(255,255,255,0.1); color: var(--error); }

        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal-content {
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 2rem;
            border: 1px solid var(--border-color);
        }
        .result-modal {
            max-width: 600px;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        .modal-header h2 { font-size: 1.5rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.5rem; }
        .modal-header button { background: none; border: none; color: var(--text-muted); cursor: pointer; }
        .modal-header button:hover { color: var(--text-primary); }

        .spy-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary); }
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: var(--text-primary);
        }
        .form-row { display: flex; gap: 1rem; }
        .form-row > * { flex: 1; }
        .mt-2 { margin-top: 0.5rem; }

        /* Analysis Result */
        .analysis-body section { margin-bottom: 2rem; }
        .analysis-body h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.75rem; }
        .text-warning { color: #f59e0b; }
        .text-success { color: #10b981; }
        .analysis-body ul { padding-left: 1.5rem; }
        .analysis-body li { margin-bottom: 0.5rem; color: var(--text-secondary); }
        .advice-section {
            background: rgba(255, 255, 255, 0.05);
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid var(--primary);
        }
        .advice-section p { line-height: 1.6; color: var(--text-primary); }
        
        .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 4rem;
            color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
