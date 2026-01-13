'use client';

import { useState, useEffect } from 'react';
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


export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    priority: Priority;
    dueDate: string;
  }>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const submitNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateTask({
      // id is handled by backend
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'todo',
      dueDate: newTask.dueDate,
      tags: []
    } as any); // Type assertion for omit id
    setIsCreateModalOpen(false);
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      const data = await response.json();

      if (data.success) {
        setTasks(data.tasks || []);
      } else {
        setError('タスクの取得に失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status,
          dueDate: taskData.dueDate,
          tags: taskData.tags,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchTasks(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Status) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });

      if (response.ok) {
        await fetchTasks(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('このタスクを削除しますか？')) return;

    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTasks(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

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
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} />
            新規タスク
          </button>
        </div>

        {/* Task List */}
        <div className="tasks-grid">
          {loading ? (
            <div className="empty-state glass-card">
              <CheckSquare size={48} className="empty-icon animate-pulse" />
              <h3>読み込み中...</h3>
            </div>
          ) : error ? (
            <div className="empty-state glass-card">
              <h3>エラー</h3>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchTasks}>再試行</button>
            </div>
          ) : filteredTasks.length === 0 ? (
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
                    onChange={(e) => handleUpdateStatus(task.id, e.target.value as Status)}
                  >
                    <option value="todo">未着手</option>
                    <option value="in-progress">進行中</option>
                    <option value="done">完了</option>
                  </select>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
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

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in">
            <h2 className="modal-title">新規タスク作成</h2>
            <form onSubmit={submitNewTask} className="task-form">
              <div className="form-group">
                <label>タイトル</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="例: SNS投稿のネタ出し"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>詳細</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="タスクの詳細を入力..."
                  rows={3}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>優先度</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                    className="form-select"
                  >
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>期限</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  作成する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        /* ... existing styles ... */
        .tasks-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        
        .modal-content {
            width: 100%;
            max-width: 500px;
            padding: 2rem;
            background: #1a1a24;
            border: 1px solid var(--glass-border);
            border-radius: 16px;
        }
        
        .modal-title {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: var(--text-primary);
        }
        
        .task-form {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .form-group label {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        
        .form-input, .form-select {
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: white;
            font-size: 1rem;
            width: 100%;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 1rem;
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
    </div >
  );
}
