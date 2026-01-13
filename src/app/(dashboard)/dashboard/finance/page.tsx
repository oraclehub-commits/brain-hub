'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

type TransactionType = 'income' | 'expense';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);

  useEffect(() => {
    fetchFinanceLogs();
  }, []);

  const fetchFinanceLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/finance');
      const data = await response.json();

      if (data.success) {
        setTransactions(data.logs || []);
        setTotalIncome(data.summary?.totalIncome || 0);
        setTotalExpense(data.summary?.totalExpense || 0);
      } else {
        setError('データの取得に失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
      console.error('Failed to fetch finance logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnose = async () => {
    try {
      setDiagnosing(true);
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'diagnose' }),
      });

      const data = await response.json();
      if (data.success) {
        setDiagnosis(data.diagnosis);
      }
    } catch (err) {
      console.error('Failed to diagnose:', err);
    } finally {
      setDiagnosing(false);
    }
  };

  const balance = totalIncome - totalExpense;

  return (
    <div className="finance-page">
      <header className="page-header">
        <DollarSign className="header-icon" size={24} />
        <div>
          <h1>収支ログ</h1>
          <p className="header-subtitle">ビジネスの健康状態をリアルタイムで把握</p>
        </div>
      </header>

      <div className="finance-layout">
        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card glass-card income">
            <div className="card-header">
              <TrendingUp size={20} />
              <span>収入</span>
            </div>
            <div className="amount">¥{totalIncome.toLocaleString()}</div>
          </div>

          <div className="summary-card glass-card expense">
            <div className="card-header">
              <TrendingDown size={20} />
              <span>支出</span>
            </div>
            <div className="amount">¥{totalExpense.toLocaleString()}</div>
          </div>

          <div className="summary-card glass-card balance">
            <div className="card-header">
              <DollarSign size={20} />
              <span>収支</span>
            </div>
            <div className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
              ¥{balance.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="transactions-section glass-card">
          <div className="section-header">
            <h2>最近の取引</h2>
          </div>

          <div className="transactions-list">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  {transaction.type === 'income' ? (
                    <TrendingUp size={20} className="income-icon" />
                  ) : (
                    <TrendingDown size={20} className="expense-icon" />
                  )}
                </div>
                <div className="transaction-info">
                  <div className="transaction-desc">{transaction.description}</div>
                  <div className="transaction-meta">
                    <span className="category">{transaction.category}</span>
                    <span className="separator">•</span>
                    <Calendar size={12} />
                    <span>{new Date(transaction.date).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  ¥{transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Diagnosis */}
        <div className="ai-diagnosis-section glass-card">
          <div className="diagnosis-header">
            <h3>📊 AI財務診断</h3>
            <p>あなたのビジネスの健康状態をAIが分析し、成長のヒントを提供します</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleDiagnose}
            disabled={diagnosing || loading}
          >
            {diagnosing ? '分析中...' : 'AI診断を実行'}
          </button>
        </div>

        {/* Diagnosis Result Modal */}
        {diagnosis && (
          <div className="modal-overlay" onClick={() => setDiagnosis(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>💎 AI財務診断結果</h2>
              <div className="diagnosis-result">
                {diagnosis}
              </div>
              <button className="btn btn-primary" onClick={() => setDiagnosis(null)}>
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .finance-page {
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

        .finance-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .summary-card {
          padding: 1.5rem;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .amount {
          font-size: 2rem;
          font-weight: bold;
        }

        .summary-card.income .amount {
          color: #10b981;
        }

        .summary-card.expense .amount {
          color: #ef4444;
        }

        .amount.positive {
          color: #10b981;
        }

        .amount.negative {
          color: #ef4444;
        }

        .transactions-section {
          padding: 1.5rem;
        }

        .section-header {
          margin-bottom: 1rem;
        }

        .section-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }

        .transaction-icon {
          flex-shrink: 0;
        }

        .income-icon {
          color: #10b981;
        }

        .expense-icon {
          color: #ef4444;
        }

        .transaction-info {
          flex: 1;
          min-width: 0;
        }

        .transaction-desc {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .transaction-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .category {
          padding: 0.125rem 0.5rem;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 4px;
          color: var(--primary);
        }

        .separator {
          opacity: 0.5;
        }

        .transaction-amount {
          font-size: 1.25rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .transaction-amount.income {
          color: #10b981;
        }

        .transaction-amount.expense {
          color: #ef4444;
        }

        .ai-diagnosis-section {
          padding: 2rem;
          text-align: center;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
        }

        .diagnosis-header h3 {
          margin: 0 0 0.5rem 0;
          color: var(--primary);
        }

        .diagnosis-header p {
          margin: 0 0 1.5rem 0;
          color: var(--text-secondary);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }

        .modal-content {
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98));
          border: 1px solid rgba(139, 92, 246, 0.5);
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          padding: 2rem;
        }

        .modal-content h2 {
          margin: 0 0 1.5rem 0;
          text-align: center;
        }

        .diagnosis-result {
          background: rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 8px;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          white-space: pre-wrap;
        }

        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
