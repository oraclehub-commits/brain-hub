'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database, Cloud, FileText, ExternalLink, RefreshCw, Save } from 'lucide-react';

interface ArchiveItem {
  id: string;
  title: string;
  drive_link: string;
  summary: string;
  created_at: string;
}

export default function ArchivePage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchArchives();
    checkDriveAuth();
  }, []);

  const checkDriveAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    // プロバイダートークンがない場合は再連携が必要
    if (!session?.provider_token) {
      setNeedsAuth(true);
    }
  };

  const handleDriveAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/drive.file',
        redirectTo: `${window.location.origin}/dashboard/archive`,
        queryParams: {
          access_type: 'offline', // リフレッシュトークン用（今回は簡易実装）
          prompt: 'consent',     // 強制的に同意画面を表示してトークンを確実に入手
        }
      }
    });
  };

  const fetchArchives = async () => {
    try {
      const res = await fetch('/api/archives');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch archives', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportTest = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.provider_token) {
      alert('Google Driveへのアクセス権限が必要です。再連携ボタンを押してください。');
      setNeedsAuth(true);
      return;
    }

    try {
      setExporting(true);
      const title = `Log_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')}`;
      const content = `# Chat Log - ${new Date().toLocaleString()}\n\nこれはテスト用のエクスポートログです。\n\n- ユーザーの悩み: アーカイブ機能の実装\n- 解決策: Google Drive連携\n`;

      const res = await fetch('/api/archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          provider_token: session.provider_token,
          title,
          content,
          summary: 'テストエクスポート'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('エクスポート完了！');
        fetchArchives();
      } else {
        alert('エクスポート失敗: ' + data.error);
        if (data.error.includes('credentials')) {
          setNeedsAuth(true); // トークン切れの可能性
        }
      }
    } catch (err) {
      console.error(err);
      alert('エラーが発生しました');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="archive-page">
      <header className="page-header">
        <Database className="header-icon" size={24} />
        <div>
          <h1>アーカイブ (外部脳)</h1>
          <p className="header-subtitle">Google Drive上の記憶インデックス</p>
        </div>
      </header>

      {/* Auth Status / Action */}
      <div className="auth-section glass-card mb-6">
        <div className="auth-status">
          <Cloud size={24} className={needsAuth ? 'text-gray-400' : 'text-green-400'} />
          <div>
            <h3 className="text-lg font-bold">Google Drive Status</h3>
            <p className="text-sm text-gray-400">
              {needsAuth
                ? '連携が必要です（ファイル書き込み権限）'
                : '接続済み - 外部脳として機能中'}
            </p>
          </div>
        </div>
        <div>
          {needsAuth ? (
            <button className="btn btn-primary" onClick={handleDriveAuth}>
              <RefreshCw size={16} className="mr-2" />
              Driveと連携する
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={handleExportTest} disabled={exporting}>
              <Save size={16} className="mr-2" />
              {exporting ? '保存中...' : 'テストログを保存'}
            </button>
          )}
        </div>
      </div>

      {/* Archives List */}
      <div className="archives-list glass-card">
        <h2 className="section-title mb-4">記憶インデックス</h2>
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">アーカイブはありません</div>
        ) : (
          <div className="grid gap-4">
            {items.map(item => (
              <div key={item.id} className="archive-item">
                <div className="item-icon">
                  <FileText size={20} />
                </div>
                <div className="item-info">
                  <div className="item-title">{item.title}</div>
                  <div className="item-meta">
                    <span>{new Date(item.created_at).toLocaleString('ja-JP')}</span>
                    <span className="separator">•</span>
                    <span>{item.summary}</span>
                  </div>
                </div>
                <a
                  href={item.drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-icon"
                  title="Driveで開く"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
                .archive-page { max-width: 800px; margin: 0 auto; }
                .page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
                .header-icon { color: var(--primary); }
                .header-subtitle { color: var(--text-secondary); margin-top: 0.25rem; }
                
                .auth-section { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; }
                .auth-status { display: flex; align-items: center; gap: 1rem; }
                
                .archives-list { padding: 1.5rem; }
                .archive-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; transition: background 0.2s; }
                .archive-item:hover { background: rgba(255,255,255,0.05); }
                
                .item-icon { color: var(--text-secondary); }
                .item-info { flex: 1; min-width: 0; }
                .item-title { font-weight: 600; margin-bottom: 0.25rem; }
                .item-meta { font-size: 0.85rem; color: var(--text-secondary); display: flex; gap: 0.5rem; }
                
                .btn-icon { padding: 0.5rem; border-radius: 8px; color: var(--text-secondary); transition: all 0.2s; }
                .btn-icon:hover { color: white; background: rgba(255,255,255,0.1); }
                
                .text-green-400 { color: #4ade80; }
                .text-gray-400 { color: #9ca3af; }
                .mr-2 { margin-right: 0.5rem; }
            `}</style>
    </div>
  );
}
