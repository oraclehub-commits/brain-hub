'use client';

import { useState } from 'react';
import { Archive, FileText, Image, Video, Download } from 'lucide-react';

type ItemType = 'document' | 'image' | 'video';

interface ArchiveItem {
    id: string;
    title: string;
    type: ItemType;
    date: string;
    size: string;
}

const mockItems: ArchiveItem[] = [
    {
        id: '1',
        title: 'クライアントA提案書_最終版.pdf',
        type: 'document',
        date: '2026-01-10',
        size: '2.4 MB',
    },
    {
        id: '2',
        title: 'セミナー資料_2025年12月.pdf',
        type: 'document',
        date: '2025-12-28',
        size: '8.1 MB',
    },
];

export default function ArchivePage() {
    const [items] = useState<ArchiveItem[]>(mockItems);
    const [filter, setFilter] = useState<ItemType | 'all'>('all');

    const filteredItems = filter === 'all'
        ? items
        : items.filter(item => item.type === filter);

    const getIcon = (type: ItemType) => {
        switch (type) {
            case 'document': return <FileText size={24} />;
            case 'image': return <Image size={24} />;
            case 'video': return <Video size={24} />;
        }
    };

    return (
        <div className="archive-page">
            <header className="page-header">
                <Archive className="header-icon" size={24} />
                <div>
                    <h1>アーカイブ</h1>
                    <p className="header-subtitle">重要なファイルを安全に保管し、いつでも取り出せる</p>
                </div>
            </header>

            <div className="archive-layout">
                {/* Filter Bar */}
                <div className="filter-bar glass-card">
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            すべて ({items.length})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'document' ? 'active' : ''}`}
                            onClick={() => setFilter('document')}
                        >
                            📄 ドキュメント ({items.filter(i => i.type === 'document').length})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'image' ? 'active' : ''}`}
                            onClick={() => setFilter('image')}
                        >
                            🖼️ 画像 ({items.filter(i => i.type === 'image').length})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'video' ? 'active' : ''}`}
                            onClick={() => setFilter('video')}
                        >
                            🎥 動画 ({items.filter(i => i.type === 'video').length})
                        </button>
                    </div>
                </div>

                {/* Items List */}
                <div className="items-list">
                    {filteredItems.length === 0 ? (
                        <div className="empty-state glass-card">
                            <Archive size={48} className="empty-icon" />
                            <h3>アーカイブが空です</h3>
                            <p>ファイルをアップロードして保管しましょう</p>
                        </div>
                    ) : (
                        filteredItems.map((item) => (
                            <div key={item.id} className="item-card glass-card">
                                <div className="item-icon">
                                    {getIcon(item.type)}
                                </div>
                                <div className="item-info">
                                    <h3>{item.title}</h3>
                                    <div className="item-meta">
                                        <span>{new Date(item.date).toLocaleDateString('ja-JP')}</span>
                                        <span>•</span>
                                        <span>{item.size}</span>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-sm">
                                    <Download size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Coming Soon Banner */}
                <div className="coming-soon-banner glass-card">
                    <div className="banner-content">
                        <h3>☁️ Google Drive統合（準備中）</h3>
                        <p>Google Driveと自動同期し、重要なファイルを二重にバックアップします</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .archive-page {
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

        .archive-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .filter-bar {
          padding: 1rem;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .filter-tab.active {
          background: var(--primary);
          color: white;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .item-card {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .item-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .item-info {
          flex: 1;
          min-width: 0;
        }

        .item-info h3 {
          margin: 0;
          font-size: 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-meta {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
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

        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-icon {
          color: var(--text-secondary);
          opacity: 0.5;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          color: var(--text-secondary);
          margin: 0;
        }
      `}</style>
        </div>
    );
}
