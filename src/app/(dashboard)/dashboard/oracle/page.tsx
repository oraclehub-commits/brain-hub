'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, History, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface WhisperData {
  type: string;
  message: string;
  cta?: string;
}

interface Session {
  id: string;
  title: string;
  messages: any[];
  created_at: string;
  updated_at: string;
}

export default function OraclePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [whisper, setWhisper] = useState<WhisperData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userTier, setUserTier] = useState<'FREE' | 'PRO'>('FREE');
  const [totalSessions, setTotalSessions] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch sessions and subscription info on mount
  useEffect(() => {
    fetchSessions();
    fetchSubscription();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/oracle/sessions');
      const data = await response.json();

      if (data.sessions) {
        setSessions(data.sessions);
        setTotalSessions(data.sessions.length);

        // Auto-restore the most recent session
        if (data.sessions.length > 0 && !sessionId) {
          const latestSession = data.sessions[0];
          loadSession(latestSession);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      const data = await response.json();

      if (data.success) {
        setUserTier(data.tier);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const loadSession = (session: Session) => {
    // If FREE tier and session is old, show upgrade modal
    if (userTier === 'FREE') {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const sessionDate = new Date(session.updated_at);

      if (sessionDate < threeDaysAgo && session.messages && session.messages.length > 0) {
        setShowUpgradeModal(true);
        return;
      }
    }

    setSessionId(session.id);

    // Convert database messages to UI messages
    const loadedMessages: Message[] = (session.messages || []).map((msg: any, index: number) => ({
      id: `${session.id}-${index}`,
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: new Date(msg.timestamp || session.updated_at),
    }));

    setMessages(loadedMessages);
    setShowSessions(false);
  };

  const createNewSession = () => {
    setSessionId(null);
    setMessages([]);
    setWhisper(null);
    setShowSessions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Save session ID for future messages
        if (data.sessionId) {
          setSessionId(data.sessionId);
          // Refresh sessions list
          fetchSessions();
        }
      } else {
        console.error('API error:', data.error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '通信エラーが発生しました。もう一度お試しください。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    createNewSession();
  };

  return (
    <div className="oracle-page">
      {/* Header */}
      <header className="oracle-header">
        <div className="header-title">
          <Sparkles className="header-icon" size={24} />
          <div>
            <h1>AI軍師</h1>
            <p className="header-subtitle">あなたのビジネスの壁打ち相手</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-ghost"
            onClick={() => setShowSessions(!showSessions)}
            title="履歴"
          >
            <History size={18} />
            {sessions.length > 0 && <span className="badge">{sessions.length}</span>}
          </button>
          <button className="btn btn-ghost" onClick={clearChat} title="新規会話">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* Sessions Panel */}
      {showSessions && (
        <div className="sessions-panel glass-card">
          <div className="panel-header">
            <h3>過去の会話</h3>
            <button onClick={createNewSession} className="btn btn-primary btn-sm">
              新規会話
            </button>
          </div>
          <div className="sessions-list">
            {sessions.length === 0 ? (
              <p className="empty-message">まだ会話がありません</p>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  className={`session-item ${sessionId === session.id ? 'active' : ''}`}
                  onClick={() => loadSession(session)}
                >
                  <div className="session-title">{session.title}</div>
                  <div className="session-time">
                    {new Date(session.updated_at).toLocaleDateString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🧠 AIの記憶を解放しますか？</h2>
            </div>

            <div className="modal-body">
              <div className="memory-status">
                <div className="status-item">
                  <div className="status-label">現在</div>
                  <div className="status-value free">
                    直近3日間のみ記憶
                  </div>
                </div>
                <div className="arrow">→</div>
                <div className="status-item">
                  <div className="status-label">PROモード</div>
                  <div className="status-value pro">
                    全{totalSessions}件の会話を記憶
                  </div>
                </div>
              </div>

              <div className="benefits">
                <h3>PROモードでできること</h3>
                <ul>
                  <li>✓ 過去の全会話をAIが記憶</li>
                  <li>✓ 数週間前の悩みと現在の状況を関連付け</li>
                  <li>✓ あなたの思考パターンを理解した提案</li>
                  <li>✓ 長期的な成長をサポート</li>
                </ul>
              </div>

              <div className="upgrade-options">
                <a href="/dashboard/referral" className="option-card primary">
                  <h4>🎁 友達を招待してPROをゲット</h4>
                  <p>3人招待で30日間のPROモードが無料</p>
                </a>
                <div className="option-card secondary">
                  <h4>💳 月額980円でPROモード</h4>
                  <p className="coming-soon">準備中</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="btn btn-ghost"
              >
                後で
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon oracle-glow">
              <Sparkles size={48} />
            </div>
            <h2>AI軍師に相談しましょう</h2>
            <p>ビジネスの悩み、アイデアの壁打ち、戦略の相談など、何でもお話しください。</p>
            <div className="suggestion-chips">
              <button
                className="chip"
                onClick={() => setInput('SNSの投稿頻度を上げたいのですが、何を書けばいいかわかりません')}
              >
                SNS発信の悩み
              </button>
              <button
                className="chip"
                onClick={() => setInput('競合と差別化するにはどうすればいいですか？')}
              >
                差別化戦略
              </button>
              <button
                className="chip"
                onClick={() => setInput('売上を安定させるにはどうすればいいですか？')}
              >
                売上安定化
              </button>
            </div>
          </div>
        ) : (
          <div className="messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role}`}
              >
                <div className="message-content">
                  {message.role === 'assistant' ? (
                    <div
                      className="markdown-content"
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdown(message.content)
                      }}
                    />
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <form className="input-area glass-card" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="悩みや相談を入力してください..."
          rows={1}
          disabled={isLoading}
          className="chat-input"
        />
        <button
          type="submit"
          className="btn btn-primary send-btn"
          disabled={!input.trim() || isLoading}
        >
          <Send size={18} />
        </button>
      </form>

      <style jsx>{`
        .oracle-page {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 64px - 4rem);
          max-width: 900px;
          margin: 0 auto;
        }

        .oracle-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 1rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-icon {
          color: var(--color-primary-400);
        }

        .header-title h1 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .header-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .chat-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 2rem;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-elevated);
          border-radius: 50%;
          margin-bottom: 1.5rem;
          color: var(--color-primary-400);
        }

        .empty-state h2 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .suggestion-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }

        .chip {
          padding: 0.5rem 1rem;
          background: var(--bg-hover);
          border: 1px solid var(--glass-border);
          border-radius: 9999px;
          font-size: 0.875rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .chip:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border-color: var(--color-primary-500);
        }

        .messages {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          max-width: 85%;
          padding: 1rem 1.25rem;
          border-radius: 16px;
        }

        .message.user {
          align-self: flex-end;
          background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-700) 100%);
          border-bottom-right-radius: 4px;
        }

        .message.assistant {
          align-self: flex-start;
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-bottom-left-radius: 4px;
        }

        .message-content {
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .message-time {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: right;
        }

        .message.user .message-time {
          color: rgba(255, 255, 255, 0.7);
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 0.5rem 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: var(--color-primary-400);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .input-area {
          display: flex;
          align-items: flex-end;
          gap: 0.75rem;
          padding: 1rem;
          margin-top: auto;
        }

        .chat-input {
          flex: 1;
          max-height: 150px;
          padding: 0.875rem 1rem;
          background: var(--bg-surface);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 0.9375rem;
          resize: none;
          transition: border-color var(--transition-fast);
        }

        .chat-input:focus {
          outline: none;
          border-color: var(--color-primary-500);
        }

        .chat-input::placeholder {
          color: var(--text-muted);
        }

        .send-btn {
          padding: 0.875rem;
        }

        .markdown-content :global(h1),
        .markdown-content :global(h2),
        .markdown-content :global(h3) {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .markdown-content :global(p) {
          margin-bottom: 0.75rem;
        }

        .markdown-content :global(strong) {
          color: var(--color-accent-400);
        }

        .markdown-content :global(hr) {
          margin: 1rem 0;
          border: none;
          border-top: 1px solid var(--glass-border);
        }

        /* Upgrade Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 2rem 2rem 1rem 2rem;
          text-align: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .modal-body {
          padding: 1rem 2rem 2rem 2rem;
        }

        .memory-status {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
        }

        .status-item {
          flex: 1;
          text-align: center;
        }

        .status-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .status-value {
          font-size: 1.125rem;
          font-weight: bold;
          padding: 0.5rem;
          border-radius: 8px;
        }

        .status-value.free {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .status-value.pro {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .arrow {
          font-size: 1.5rem;
          color: var(--primary);
        }

        .benefits {
          margin-bottom: 2rem;
        }

        .benefits h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
        }

        .benefits ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .benefits li {
          padding: 0.5rem 0;
          color: var(--text-secondary);
        }

        .upgrade-options {
          display: grid;
          gap: 1rem;
        }

        .option-card {
          padding: 1.5rem;
          border-radius: 12px;
          border: 2px solid transparent;
          text-decoration: none;
          transition: all 0.2s;
        }

        .option-card.primary {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
          border-color: var(--primary);
        }

        .option-card.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
        }

        .option-card.secondary {
          background: rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.1);
          opacity: 0.6;
        }

        .option-card h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .option-card p {
          margin: 0;
          color: var(--text-secondary);
        }

        .coming-soon {
          font-style: italic;
        }

        .modal-footer {
          padding: 1rem 2rem 2rem 2rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .memory-status {
            flex-direction: column;
          }

          .arrow {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </div>
  );
}

// Simple markdown formatter
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*)/g, '<h3>$1</h3>')
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/# (.*)/g, '<h1>$1</h1>')
    .replace(/---/g, '<hr>')
    .replace(/\n/g, '<br>');
}
