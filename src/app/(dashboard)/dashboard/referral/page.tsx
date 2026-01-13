'use client';

import { useState, useEffect } from 'react';
import { Share2, Copy, Check, Gift, Users, Crown } from 'lucide-react';

interface ReferralData {
    referralCode: string;
    referralCount: number;
    referralsForPro: number;
    remaining: number;
    referrals: Array<{ id: string; created_at: string }>;
    subscription: {
        tier: string;
        proExpiresAt: string | null;
    };
    shareText: {
        x: string;
        facebook: string;
        line: string;
    };
}

export default function ReferralPage() {
    const [data, setData] = useState<ReferralData | null>(null);
    const [copiedCode, setCopiedCode] = useState(false);
    const [redeemCode, setRedeemCode] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redeemMessage, setRedeemMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            const response = await fetch('/api/referral');
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch referral data:', error);
        }
    };

    const copyCode = async () => {
        if (data?.referralCode) {
            await navigator.clipboard.writeText(data.referralCode);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const shareToX = () => {
        if (data?.shareText.x) {
            const encoded = encodeURIComponent(data.shareText.x);
            window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
        }
    };

    const shareToFacebook = () => {
        if (data?.shareText.facebook) {
            const url = `https://brain-hub.pro?ref=${data.referralCode}`;
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        }
    };

    const shareToLine = () => {
        if (data?.shareText.line) {
            const encoded = encodeURIComponent(data.shareText.line);
            window.open(`https://line.me/R/msg/text/?${encoded}`, '_blank');
        }
    };

    const handleRedeem = async () => {
        if (!redeemCode.trim()) return;

        setIsRedeeming(true);
        setRedeemMessage(null);

        try {
            const response = await fetch('/api/referral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referralCode: redeemCode.trim() }),
            });

            const result = await response.json();

            if (result.success) {
                setRedeemMessage({ type: 'success', text: result.data.message });
                setRedeemCode('');
                fetchReferralData();
            } else {
                setRedeemMessage({ type: 'error', text: result.error });
            }
        } catch (error) {
            setRedeemMessage({ type: 'error', text: '処理に失敗しました' });
        } finally {
            setIsRedeeming(false);
        }
    };

    if (!data) {
        return <div className="loading-state">読み込み中...</div>;
    }

    const progress = (data.referralCount / data.referralsForPro) * 100;
    const isPro = data.subscription.tier === 'PRO';

    return (
        <div className="referral-page">
            <header className="page-header">
                <Gift className="header-icon" size={24} />
                <div>
                    <h1>友達を招待</h1>
                    <p className="header-subtitle">3名招待で30日間PROモードを無料解放</p>
                </div>
            </header>

            {/* Progress Card */}
            <div className="progress-card glass-card oracle-glow">
                <div className="progress-header">
                    <div className="progress-icon">
                        <Users size={32} />
                    </div>
                    <div className="progress-info">
                        <h2 className="progress-title">
                            {isPro ? (
                                <>
                                    <Crown size={20} className="crown-icon" />
                                    PROモード有効中
                                </>
                            ) : (
                                `あと ${data.remaining}名 でPRO解放`
                            )}
                        </h2>
                        <p className="progress-count">
                            招待達成: {data.referralCount} / {data.referralsForPro}名
                        </p>
                    </div>
                </div>

                <div className="progress-bar-container">
                    <div
                        className="progress-bar"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>

                {isPro && data.subscription.proExpiresAt && (
                    <p className="pro-expires">
                        有効期限: {new Date(data.subscription.proExpiresAt).toLocaleDateString('ja-JP')}
                    </p>
                )}
            </div>

            {/* Referral Code */}
            <div className="code-section glass-card">
                <h3 className="section-title">あなたの招待コード</h3>
                <div className="code-display">
                    <span className="code-text">{data.referralCode}</span>
                    <button
                        className={`btn btn-ghost copy-btn ${copiedCode ? 'copied' : ''}`}
                        onClick={copyCode}
                    >
                        {copiedCode ? <Check size={18} /> : <Copy size={18} />}
                        {copiedCode ? 'コピー済み' : 'コピー'}
                    </button>
                </div>
            </div>

            {/* Share Buttons */}
            <div className="share-section glass-card">
                <h3 className="section-title">SNSでシェア</h3>
                <div className="share-buttons">
                    <button className="share-btn x" onClick={shareToX}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Xでシェア
                    </button>
                    <button className="share-btn facebook" onClick={shareToFacebook}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </button>
                    <button className="share-btn line" onClick={shareToLine}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                        LINE
                    </button>
                </div>
            </div>

            {/* Redeem Code */}
            <div className="redeem-section glass-card">
                <h3 className="section-title">招待コードを入力</h3>
                <div className="redeem-form">
                    <input
                        type="text"
                        className="input"
                        placeholder="ORACLE-XXXXXX-XXXX"
                        value={redeemCode}
                        onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleRedeem}
                        disabled={isRedeeming || !redeemCode.trim()}
                    >
                        {isRedeeming ? '処理中...' : '適用する'}
                    </button>
                </div>
                {redeemMessage && (
                    <p className={`redeem-message ${redeemMessage.type}`}>
                        {redeemMessage.text}
                    </p>
                )}
            </div>

            <style jsx>{`
        .referral-page {
          max-width: 600px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .header-icon {
          color: var(--color-primary-400);
        }

        .page-header h1 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .header-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .progress-card {
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .progress-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .progress-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-accent-600) 100%);
          border-radius: 12px;
          color: white;
        }

        .progress-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .crown-icon {
          color: var(--color-accent-400);
        }

        .progress-count {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .progress-bar-container {
          height: 8px;
          background: var(--bg-hover);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary-500) 0%, var(--color-accent-500) 100%);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .pro-expires {
          margin-top: 0.75rem;
          font-size: 0.875rem;
          color: var(--color-accent-400);
        }

        .section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .code-section,
        .share-section,
        .redeem-section {
          padding: 1.25rem;
          margin-bottom: 1rem;
        }

        .code-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: var(--bg-surface);
          border: 1px dashed var(--color-primary-500);
          border-radius: 12px;
        }

        .code-text {
          font-size: 1.125rem;
          font-weight: 700;
          font-family: monospace;
          color: var(--color-accent-400);
          letter-spacing: 0.05em;
        }

        .copy-btn {
          padding: 0.5rem 1rem;
        }

        .copy-btn.copied {
          color: var(--color-success-400);
          border-color: var(--color-success-400);
        }

        .share-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .share-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border: none;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .share-btn.x {
          background: #000;
          color: #fff;
        }

        .share-btn.facebook {
          background: #1877f2;
          color: #fff;
        }

        .share-btn.line {
          background: #00b900;
          color: #fff;
        }

        .share-btn:hover {
          transform: translateY(-2px);
          opacity: 0.9;
        }

        .redeem-form {
          display: flex;
          gap: 0.5rem;
        }

        .redeem-message {
          margin-top: 0.75rem;
          font-size: 0.875rem;
          padding: 0.5rem;
          border-radius: 8px;
        }

        .redeem-message.success {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success-400);
        }

        .redeem-message.error {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error-400);
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
}
