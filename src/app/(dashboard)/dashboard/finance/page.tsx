'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Plus, X, Search, Filter, Save, FileText, Tag, Briefcase, Sparkles } from 'lucide-react';

type TransactionType = 'income' | 'expense';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  tax_rate?: string;
  transaction_partner?: string;
  notes?: string;
}

const CATEGORIES = {
  income: ['売上', '雑収入', 'その他'],
  expense: [
    '仕入', '消耗品費', '旅費交通費', '通信費', '広告宣伝費',
    '地代家賃', '水道光熱費', '支払手数料', '外注工賃',
    '接待交際費', '新聞図書費', '会議費', '租税公課', '雑費'
  ]
};

const TAX_RATES = ['10%', '8% (軽減)', '0% (不課税)', '非課税'];

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as TransactionType,
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '消耗品費',
    description: '',
    transactionPartner: '',
    taxRate: '10%',
    notes: ''
  });

  // Export State & PRO Check
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [userTier, setUserTier] = useState({ isPro: false, features: {} as any });

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setIsParsing(true);
    try {
      const res = await fetch('/api/finance/parse', {
        method: 'POST',
        body: JSON.stringify({ text: aiInput }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setNewTransaction(prev => ({
          ...prev,
          ...data.data,
          date: data.data.date || prev.date // Keep today if not found
        }));
        setAiInput(''); // Clear input on success
      } else {
        alert('解析に失敗しました');
      }
    } catch (e) {
      console.error(e);
      alert('解析エラーが発生しました');
    } finally {
      setIsParsing(false);
    }
  };

  useEffect(() => {
    fetchFinanceLogs();
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/user/subscription');
      const data = await res.json();
      if (data.success) {
        setUserTier({ isPro: data.tier === 'PRO', features: data.features });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = async (format: 'standard' | 'yayoi' | 'freee') => {
    if (format !== 'standard' && !userTier.isPro) {
      alert('🌟 この機能はPROプラン限定です！\n\n弥生会計・freee形式での出力機能を使えば、\n確定申告の準備がワンクリックで完了します。');
      return;
    }

    if (!confirm(`${format === 'standard' ? 'CSV' : format}形式でエクスポートしますか？`)) return;

    try {
      setIsExporting(true);
      const res = await fetch('/api/finance/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });
      const data = await res.json();

      if (data.success) {
        const blob = new Blob([data.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('エクスポートに失敗しました: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('エラーが発生しました');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const fetchFinanceLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/finance');
      const data = await response.json();

      if (data.success) {
        setTransactions(data.logs || []);
        setTotalIncome(data.summary?.totalIncome || 0);
        setTotalExpense(data.summary?.totalExpense || 0);
      }
    } catch (err) {
      console.error('Failed to fetch finance logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.amount) return;

    try {
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newTransaction.type,
          amount: Number(newTransaction.amount),
          category: newTransaction.category,
          description: newTransaction.description,
          date: new Date(newTransaction.date).toISOString(),
          tax_rate: newTransaction.taxRate,
          transaction_partner: newTransaction.transactionPartner,
          notes: newTransaction.notes
        }),
      });

      const responseText = await response.text();
      console.log('API Response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        alert('サーバーエラーが発生しました。コンソールを確認してください。');
        return;
      }

      if (data.success) {
        setIsModalOpen(false);
        setNewTransaction({
          type: 'expense',
          date: new Date().toISOString().split('T')[0],
          amount: '',
          category: '消耗品費',
          description: '',
          transactionPartner: '',
          taxRate: '10%',
          notes: ''
        });
        fetchFinanceLogs();
      } else {
        alert('登録エラー: ' + data.error);
      }
    } catch (err) {
      console.error('Failed to create transaction:', err);
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

        <div className="flex gap-2 ms-auto relative">
          <button
            className="btn btn-ghost"
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
          >
            <FileText size={18} /> エクスポート
          </button>

          {showExportMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 glass-card p-2 z-50 shadow-xl border-gray-700">
              <button
                className="w-full text-left p-2 hover:bg-white/10 rounded flex items-center gap-2"
                onClick={() => handleExport('standard')}
              >
                <div className="flex-1">CSV (標準)</div>
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                className={`w-full text-left p-2 hover:bg-white/10 rounded flex items-center gap-2 ${!userTier.isPro && 'opacity-75'}`}
                onClick={() => handleExport('yayoi')}
              >
                <div className="flex-1">弥生会計形式</div>
                {!userTier.isPro && <span className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 px-1 rounded">PRO</span>}
              </button>
              <button
                className={`w-full text-left p-2 hover:bg-white/10 rounded flex items-center gap-2 ${!userTier.isPro && 'opacity-75'}`}
                onClick={() => handleExport('freee')}
              >
                <div className="flex-1">freee形式</div>
                {!userTier.isPro && <span className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 px-1 rounded">PRO</span>}
              </button>
            </div>
          )}

          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> 取引を記録
          </button>
        </div>
      </header >

      <div className="finance-layout">
        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card glass-card income">
            <div className="card-header"><TrendingUp size={20} /><span>収入</span></div>
            <div className="amount">¥{totalIncome.toLocaleString()}</div>
          </div>
          <div className="summary-card glass-card expense">
            <div className="card-header"><TrendingDown size={20} /><span>支出</span></div>
            <div className="amount">¥{totalExpense.toLocaleString()}</div>
          </div>
          <div className="summary-card glass-card balance">
            <div className="card-header"><DollarSign size={20} /><span>収支</span></div>
            <div className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>¥{balance.toLocaleString()}</div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="transactions-section glass-card">
          <div className="section-header">
            <h2>Account Ledger</h2>
          </div>

          <div className="transactions-list">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon-col">
                  {transaction.type === 'income' ?
                    <TrendingUp size={20} className="income-icon" /> :
                    <TrendingDown size={20} className="expense-icon" />
                  }
                </div>
                <div className="transaction-main">
                  <div className="transaction-row-top">
                    <span className="transaction-desc">{transaction.description || '摘要なし'}</span>
                    <span className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="transaction-row-bottom">
                    <span className="meta-tag"><Calendar size={12} /> {new Date(transaction.date).toLocaleDateString('ja-JP')}</span>
                    <span className="meta-tag"><Tag size={12} /> {transaction.category}</span>
                    {transaction.transaction_partner && (
                      <span className="meta-tag"><Briefcase size={12} /> {transaction.transaction_partner}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {transactions.length === 0 && !loading && (
              <div className="empty-state text-center p-4">データがありません</div>
            )}
          </div>
        </div>

        {/* AI Diagnosis */}
        <div className="ai-diagnosis-section glass-card">
          <div className="diagnosis-header">
            <h3>📊 AI財務診断</h3>
            <p>あなたのビジネスの健康状態をAIが分析し、成長のヒントを提供します</p>
          </div>
          <button className="btn btn-primary" onClick={handleDiagnose} disabled={diagnosing || loading}>
            {diagnosing ? '分析中...' : 'AI診断を実行'}
          </button>
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>新規取引登録</h2>
                <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>

              {/* AI Input Section */}
              <div className="ai-input-section mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="例: スタバで会議 500円"
                    className="flex-1 p-2 rounded bg-white/10 border border-white/10"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiParse()}
                  />
                  <button
                    type="button"
                    onClick={handleAiParse}
                    disabled={isParsing || !aiInput}
                    className="btn btn-primary btn-sm"
                  >
                    {isParsing ? <span className="loading-spinner text-xs" /> : <Sparkles size={16} />}
                    AI入力
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  AIが内容を解析してフォームを自動入力します
                </p>
              </div>

              <form onSubmit={handleCreateTransaction} className="finance-form">
                {/* Type Switcher */}
                <div className="type-switcher">
                  <button
                    type="button"
                    className={`type-btn ${newTransaction.type === 'income' ? 'active income' : ''}`}
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'income', category: '売上' })}
                  >
                    収入
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${newTransaction.type === 'expense' ? 'active expense' : ''}`}
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'expense', category: '消耗品費' })}
                  >
                    支出
                  </button>
                </div>

                <div className="form-group">
                  <label>日付 & 金額</label>
                  <div className="form-row">
                    <input
                      type="date"
                      value={newTransaction.date}
                      onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      required
                    />
                    <div className="input-with-unit">
                      <span>¥</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={newTransaction.amount}
                        onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>取引詳細</label>
                  <div className="form-row">
                    <select
                      value={newTransaction.category}
                      onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                      required
                    >
                      {CATEGORIES[newTransaction.type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select
                      value={newTransaction.taxRate}
                      onChange={e => setNewTransaction({ ...newTransaction, taxRate: e.target.value })}
                    >
                      {TAX_RATES.map(rate => (
                        <option key={rate} value={rate}>{rate}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>取引先 & 摘要</label>
                  <input
                    type="text"
                    placeholder="取引先名 (任意)"
                    value={newTransaction.transactionPartner}
                    onChange={e => setNewTransaction({ ...newTransaction, transactionPartner: e.target.value })}
                    className="mb-2"
                  />
                  <input
                    type="text"
                    placeholder="摘要 (例: PCモニター購入)"
                    value={newTransaction.description}
                    onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>備考</label>
                  <textarea
                    rows={2}
                    value={newTransaction.notes}
                    onChange={e => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full">
                  <Save size={18} /> 記録する
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Diagnosis Result Modal */}
        {diagnosis && (
          <div className="modal-overlay" onClick={() => setDiagnosis(null)}>
            <div className="modal-content glass-card result-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>💎 AI財務診断結果</h2>
                <button onClick={() => setDiagnosis(null)}><X size={20} /></button>
              </div>
              <div className="diagnosis-result">
                {diagnosis}
              </div>
              <button className="btn btn-primary btn-full mt-4" onClick={() => setDiagnosis(null)}>
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .finance-page { max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .header-icon { color: var(--primary); }
        .header-subtitle { color: var(--text-secondary); margin-top: 0.25rem; }
        .ms-auto { margin-left: auto; }
        
        .finance-layout { display: flex; flex-direction: column; gap: 1.5rem; }
        
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
        .summary-card { padding: 1.5rem; }
        .card-header { display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; }
        .amount { font-size: 2rem; font-weight: bold; }
        .summary-card.income .amount, .amount.positive { color: #10b981; }
        .summary-card.expense .amount, .amount.negative { color: #ef4444; }

        .transactions-section { padding: 1.5rem; }
        .section-header h2 { margin: 0; font-size: 1.25rem; }
        .transactions-list { display: flex; flex-direction: column; gap: 0.75rem; }
        
        .transaction-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(0, 0, 0, 0.2); border-radius: 8px; transition: transform 0.2s; }
        .transaction-item:hover { transform: translateX(4px); background: rgba(255, 255, 255, 0.05); }
        
        .transaction-icon-col { flex-shrink: 0; }
        .income-icon { color: #10b981; }
        .expense-icon { color: #ef4444; }
        
        .transaction-main { flex: 1; min-width: 0; }
        .transaction-row-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
        .transaction-desc { font-weight: 500; font-size: 1rem; }
        .transaction-amount { font-weight: bold; font-family: monospace; font-size: 1.1rem; }
        .transaction-amount.income { color: #10b981; }
        .transaction-amount.expense { color: #ef4444; }
        
        .transaction-row-bottom { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
        .meta-tag { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; }

        .btn-full { width: 100%; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mt-4 { margin-top: 1rem; }

        /* Modal & Form */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
        .modal-content { width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; padding: 2rem; border: 1px solid var(--border-color); }
        .result-modal { max-width: 600px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-header h2 { margin: 0; font-size: 1.25rem; }
        
        .finance-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); }
        .form-row { display: flex; gap: 0.75rem; }
        .form-row > * { flex: 1; }
        
        input, select, textarea { width: 100%; padding: 0.75rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--text-primary); }
        .input-with-unit { position: relative; display: flex; align-items: center; }
        .input-with-unit span { position: absolute; left: 0.75rem; color: var(--text-secondary); }
        .input-with-unit input { padding-left: 2rem; }

        .type-switcher { display: flex; background: rgba(0,0,0,0.3); padding: 4px; border-radius: 8px; margin-bottom: 0.5rem; }
        .type-btn { flex: 1; padding: 0.5rem; border: none; background: transparent; color: var(--text-secondary); border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .type-btn.active { color: white; shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .type-btn.income.active { background: #10b981; }
        .type-btn.expense.active { background: #ef4444; }
        
        .diagnosis-result { background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; line-height: 1.8; white-space: pre-wrap; }
        .ai-diagnosis-section { padding: 2rem; text-align: center; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1)); border-radius: 12px; margin-top: 1rem; }
      `}</style>
    </div >
  );
}
