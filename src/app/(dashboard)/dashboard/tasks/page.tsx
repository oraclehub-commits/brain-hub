'use client';

import { useState } from 'react';
import { CheckSquare, Plus, Trash2, Calendar, Tag } from 'lucide-react';

type Priority = 'high' | 'medium' | 'low';
type Status = 'todo' | 'in-progress' | 'done';

interface Task {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    status: Status;
    dueDate: string;
    tags: string[];
}

const mockTasks: Task[] = [
    {
        id: '1',
        title: 'LP制作の見積もり作成',
        description: '新規クライアント向けのランディングページ制作',
        priority: 'high',
        status: 'in-progress',
        dueDate: '2026-01-15',
        tags: ['クライアントワーク', '制作'],
    },
    {
        id: '2',
        title: 'SNS投稿（週次）',
        description: 'Instagram, X, Facebookへの定期投稿',
        priority: 'medium',
        status: 'todo',
        dueDate: '2026-01-14',
        tags: ['マーケティング', 'SNS'],
    },
];

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>(mockTasks);
    const [filter, setFilter] = useState<Status | 'all'>('all');

    const filteredTasks = filter === 'all'
        ? tasks
        : tasks.filter(task => task.status === filter);

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
        }
    };

    return (
        <div className="tasks-page">
            <header className="page-header">
                <CheckSquare className="header-icon" size={24} />
                <div>
                    <h1>タスク管理</h1>
                    <p className="header-subtitle">AIが優先順位を提案し、あなたの時間を最適化</p>
                </div>
            </header>

            <div className="tasks-layout">
                {/* Filters */}
                <div className="filter-bar glass-card">
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            すべて ({tasks.length})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'todo' ? 'active' : ''}`}
                            onClick={() => setFilter('todo')}
                        >
                            未着手 ({tasks.filter(t => t.status === 'todo').length})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
                            onClick={() => setFilter('in-progress')}
                        >
                            進行中 ({tasks.filter(t => t.status === 'in-progress').length})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'done' ? 'active' : ''}`}
                            onClick={() => setFilter('done')}
                        >
                            完了 ({tasks.filter(t => t.status === 'done').length})
                        </button>
                    </div>
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        新規タスク
                    </button>
                </div>

                {/* Task List */}
                <div className="tasks-grid">
                    {filteredTasks.length === 0 ? (
                        <div className="empty-state glass-card">
                            <CheckSquare size={48} className="empty-icon" />
                            <h3>タスクがありません</h3>
                            <p>新しいタスクを追加して、効率的に進めましょう！</p>
                        </div>
                    ) : (
                        filteredTasks.map((task) => (
                            <div key={task.id} className="task-card glass-card">
                                <div className="task-header">
                                    <div className="task-title-row">
                                        <h3>{task.title}</h3>
                                        <div
                                            className="priority-badge"
                                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                                        >
                                            {task.priority === 'high' && '高'}
                                            {task.priority === 'medium' && '中'}
                                            {task.priority === 'low' && '低'}
                                        </div>
                                    </div>
                                    <p className="task-description">{task.description}</p>
                                </div>

                                <div className="task-meta">
                                    <div className="task-info">
                                        <Calendar size={14} />
                                        <span>{new Date(task.dueDate).toLocaleDateString('ja-JP')}</span>
                                    </div>
                                    <div className="task-tags">
                                        {task.tags.map((tag) => (
                                            <span key={tag} className="tag">
                                                <Tag size={12} />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="task-actions">
                                    <select
                                        value={task.status}
                                        className="status-select"
                                        onChange={(e) => {
                                            const newTasks = tasks.map(t =>
                                                t.id === task.id
                                                    ? { ...t, status: e.target.value as Status }
                                                    : t
                                            );
                                            setTasks(newTasks);
                                        }}
                                    >
                                        <option value="todo">未着手</option>
                                        <option value="in-progress">進行中</option>
                                        <option value="done">完了</option>
                                    </select>
                                    <button className="btn btn-ghost btn-sm">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Coming Soon Banner */}
                <div className="coming-soon-banner glass-card">
                    <div className="banner-content">
                        <h3>🤖 AI タスク最適化（準備中）</h3>
                        <p>AIがあなたの作業パターンを分析し、最適な優先順位とスケジュールを提案します</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .tasks-page {
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

        .tasks-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
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

        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1rem;
        }

        .task-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .task-header {
          flex: 1;
        }

        .task-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .task-title-row h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .priority-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: bold;
          color: white;
        }

        .task-description {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }

        .task-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .task-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .task-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 4px;
          font-size: 0.75rem;
          color: var(--primary);
        }

        .task-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .status-select {
          flex: 1;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-primary);
          cursor: pointer;
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
          grid-column: 1 / -1;
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

        @media (max-width: 768px) {
          .filter-bar {
            flex-direction: column;
            gap: 1rem;
          }

          .filter-tabs {
            width: 100%;
            overflow-x: auto;
          }

          .tasks-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
