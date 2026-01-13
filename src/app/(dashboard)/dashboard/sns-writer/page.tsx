'use client';

import { useState } from 'react';
import { Edit3, Copy, Check, Users, Sparkles } from 'lucide-react';

type Platform = 'x' | 'instagram' | 'facebook';
type Mode = 'normal' | 'collab';

const platforms = [
  { id: 'x' as Platform, name: 'X', icon: '𝕏', color: '#000' },
  { id: 'instagram' as Platform, name: 'Instagram', icon: '📸', color: '#E1306C' },
  { id: 'facebook' as Platform, name: 'Facebook', icon: '📘', color: '#1877F2' },
];

export default function SnsWriterPage() {
  const [platform, setPlatform] = useState<Platform>('x');
  const [mode, setMode] = useState<Mode>('normal');
  const [topic, setTopic] = useState('');
  const [collaborationPartner, setCollaborationPartner] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/sns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          mode,
          topic,
          collaborationPartner: mode === 'collab' ? collaborationPartner : undefined,
          eventDetails: mode === 'collab' ? eventDetails : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.content);
      } else {
        console.error('Generation failed:', data.error);
        setResult('エラーが発生しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setResult('通信エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (result) {
      // Extract just the post content (between【投稿文】and【ハッシュタグ】or 【紹介文】)
      const postMatch = result.match(/【投稿文】\n([\s\S]*?)(?=\n【|$)/);
      const introMatch = result.match(/【紹介文】\n([\s\S]*?)(?=\n【|$)/);
      const textToCopy = postMatch?.[1]?.trim() || introMatch?.[1]?.trim() || result;

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="sns-writer-page">
      <header className="page-header">
        <Edit3 className="header-icon" size={24} />
        <div>
          <h1>SNS執筆エンジン</h1>
          <p className="header-subtitle">ボタン一つで、魅力的な投稿を自動生成</p>
        </div>
      </header>

      <div className="writer-layout">
        {/* Input Section */}
        <div className="input-section">
          {/* Mode Toggle */}
          <div className="mode-toggle glass-card">
            <button
              className={`mode-btn ${mode === 'normal' ? 'active' : ''}`}
              onClick={() => setMode('normal')}
            >
              <Edit3 size={16} />
              通常投稿
            </button>
            <button
              className={`mode-btn ${mode === 'collab' ? 'active' : ''}`}
              onClick={() => setMode('collab')}
            >
              <Users size={16} />
              コラボ特化
            </button>
          </div>

          {/* Platform Selection */}
          <div className="platform-selection glass-card">
            <h3 className="section-label">プラットフォーム</h3>
            <div className="platform-buttons">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  className={`platform-btn ${platform === p.id ? 'active' : ''}`}
                  onClick={() => setPlatform(p.id)}
                  style={{ '--platform-color': p.color } as React.CSSProperties}
                >
                  <span className="platform-icon">{p.icon}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div className="topic-input glass-card">
            <h3 className="section-label">
              {mode === 'normal' ? '投稿トピック' : 'コラボ/イベント内容'}
            </h3>
            <textarea
              className="input topic-textarea"
              placeholder={
                mode === 'normal'
                  ? '例: 今日のセッションで気づいた、クライアントが本当に求めているもの'
                  : '例: 〇〇さんとのコラボライブ企画について'
              }
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
            />
          </div>

          {/* Collab Mode Extras */}
          {mode === 'collab' && (
            <div className="collab-extras glass-card">
              <div className="form-group">
                <label className="label">コラボ相手のお名前</label>
                <input
                  type="text"
                  className="input"
                  placeholder="例: 山田花子さん"
                  value={collaborationPartner}
                  onChange={(e) => setCollaborationPartner(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="label">イベント詳細（任意）</label>
                <textarea
                  className="input"
                  placeholder="例: 子育てママ向け時短術のコラボライブ"
                  value={eventDetails}
                  onChange={(e) => setEventDetails(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            className="btn btn-primary generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
          >
            {isGenerating ? (
              <>
                <span className="spinner" /> 生成中...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                投稿を生成
              </>
            )}
          </button>
        </div>

        {/* Result Section */}
        <div className="result-section">
          {result ? (
            <div className="result-card glass-card animate-fade-in">
              <div className="result-header">
                <h3>生成結果</h3>
                <button
                  className={`btn btn-ghost copy-btn ${copied ? 'copied' : ''}`}
                  onClick={copyToClipboard}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'コピー済み' : 'コピー'}
                </button>
              </div>
              <div className="result-content">
                <pre>{result}</pre>
              </div>
            </div>
          ) : (
            <div className="result-placeholder glass-card">
              <Edit3 size={48} className="placeholder-icon" />
              <p>トピックを入力して「投稿を生成」をクリック</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .sns-writer-page {
          max-width: 1100px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .header-icon {
          color: var(--color-accent-500);
        }

        .page-header h1 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .header-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .writer-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .input-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mode-toggle {
          display: flex;
          padding: 0.25rem;
        }

        .mode-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .mode-btn.active {
          background: var(--color-primary-600);
          color: var(--text-primary);
        }

        .mode-btn:hover:not(.active) {
          background: var(--bg-hover);
        }

        .platform-selection,
        .topic-input,
        .collab-extras {
          padding: 1.25rem;
        }

        .section-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .platform-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .platform-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--bg-surface);
          border: 2px solid transparent;
          border-radius: 10px;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .platform-btn.active {
          border-color: var(--platform-color);
          color: var(--text-primary);
        }

        .platform-btn:hover:not(.active) {
          background: var(--bg-hover);
        }

        .platform-icon {
          font-size: 1.25rem;
        }

        .topic-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .generate-btn {
          padding: 1rem;
          font-size: 1rem;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .result-section {
          display: flex;
          flex-direction: column;
        }

        .result-card {
          flex: 1;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
        }

        .result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .result-header h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .copy-btn {
          padding: 0.5rem 0.75rem;
        }

        .copy-btn.copied {
          color: var(--color-success-400);
        }

        .result-content {
          flex: 1;
          overflow-y: auto;
          background: var(--bg-surface);
          border-radius: 10px;
          padding: 1rem;
        }

        .result-content pre {
          white-space: pre-wrap;
          font-family: inherit;
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .result-placeholder {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }

        .placeholder-icon {
          color: var(--text-muted);
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .result-placeholder p {
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .writer-layout {
            grid-template-columns: 1fr;
          }

          .platform-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
