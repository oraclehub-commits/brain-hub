"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Zap, Users, ArrowRight, Brain } from 'lucide-react';
import { DiagnosisModal } from '@/components/DiagnosisModal';

export default function LandingPage() {
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);

  const handleDiagnosisComplete = (result: any) => {
    setDiagnosisResult(result);
    setShowDiagnosisModal(false);
    // 診断結果をlocalStorageに保存（ログイン後に使用）
    localStorage.setItem('pendingDiagnosis', JSON.stringify(result));

    // ログインページへリダイレクト
    window.location.href = '/login?diagnosis=complete';
  };

  return (
    <div className="landing-page">
      {showDiagnosisModal && (
        <DiagnosisModal
          onComplete={handleDiagnosisComplete}
          onClose={() => setShowDiagnosisModal(false)}
        />
      )}

      {/* Hero Section */}
      <section className="hero">
        <nav className="nav">
          <div className="nav-logo">
            <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
              <circle cx="16" cy="16" r="14" stroke="url(#nav-gradient)" strokeWidth="2" />
              <circle cx="16" cy="16" r="8" fill="url(#nav-gradient)" opacity="0.8" />
              <circle cx="16" cy="16" r="3" fill="#0a0a0f" />
              <defs>
                <linearGradient id="nav-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-gradient">Oracle Hub</span>
          </div>
          <div className="nav-actions">
            <button
              onClick={() => setShowDiagnosisModal(true)}
              className="btn btn-ghost"
            >
              <Brain size={18} />
              脳タイプ診断
            </button>
            <Link href="/login" className="btn btn-primary nav-cta">
              無料で始める
            </Link>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            あなたのビジネスを加速するAI司令室
          </div>
          <h1 className="hero-title">
            <span className="text-gradient">思考OSを診断し、</span>
            <br />
            ビジネスを自動化する
          </h1>
          <p className="hero-subtitle">
            AI軍師があなたの壁打ち相手になり、SNS投稿から競合分析、
            タスク管理まで全てをサポート。起業家のための究極のオールインワンツール。
          </p>
          <div className="hero-cta">
            <button
              onClick={() => setShowDiagnosisModal(true)}
              className="btn btn-accent btn-lg"
            >
              <Brain size={20} />
              まず30秒で脳タイプ診断
            </button>
            <Link href="/login" className="btn btn-primary btn-lg">
              今すぐ無料で始める
              <ArrowRight size={20} />
            </Link>
            <p className="hero-note">クレジットカード不要 • 無料プランあり</p>
          </div>
        </div>

        {/* Background elements */}
        <div className="hero-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">
          <span className="text-gradient">オールインワン</span>の機能
        </h2>
        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
              <Sparkles size={24} />
            </div>
            <h3>AI軍師（壁打ち）</h3>
            <p>ビジネスの悩みをAIに相談。あなたの思考OSの限界を指摘し、成長を加速。</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
              <Zap size={24} />
            </div>
            <h3>SNS自動執筆</h3>
            <p>X、Instagram、Facebookに最適化された投稿を1タップで生成。コラボ文も秒で作成。</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Shield size={24} />
            </div>
            <h3>ライバル分析</h3>
            <p>競合のURLを貼るだけで、弱点と差別化ポイントを特定。戦略的に攻める。</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <Users size={24} />
            </div>
            <h3>友達招待でPRO</h3>
            <p>3名招待で30日間PROモードが無料解放。お互いにWin-Winの特典。</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card glass-card oracle-glow">
          <h2>あなたのビジネスを次のステージへ</h2>
          <p>今すぐOracle Hubを無料で体験してください</p>
          <Link href="/login" className="btn btn-primary btn-lg">
            無料アカウントを作成
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 A1 Oracle Hub. All rights reserved.</p>
        <nav className="footer-nav">
          <a href="/terms">利用規約</a>
          <a href="/privacy">プライバシーポリシー</a>
          <a href="/contact">お問い合わせ</a>
        </nav>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
        }

        /* Navigation */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-cta {
          text-decoration: none;
        }

        /* Hero */
        .hero {
          position: relative;
          padding: 4rem 2rem 6rem;
          overflow: hidden;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 9999px;
          font-size: 0.875rem;
          color: var(--color-primary-300);
          margin-bottom: 2rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2.5rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1.125rem;
          gap: 0.75rem;
        }

        .hero-note {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .hero-orbs {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: var(--color-primary-600);
          top: -200px;
          left: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: var(--color-accent-500);
          bottom: -100px;
          right: -100px;
        }

        /* Features */
        .features {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 3rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          padding: 1.5rem;
          text-align: center;
          transition: transform var(--transition-base);
        }

        .feature-card:hover {
          transform: translateY(-4px);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          color: white;
          margin: 0 auto 1rem;
        }

        .feature-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* CTA */
        .cta-section {
          padding: 4rem 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-card {
          text-align: center;
          padding: 3rem;
        }

        .cta-card h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .cta-card p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        /* Footer */
        .footer {
          padding: 2rem;
          text-align: center;
          border-top: 1px solid var(--glass-border);
        }

        .footer p {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .footer-nav {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
        }

        .footer-nav a {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer-nav a:hover {
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.25rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .nav {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
