'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: 'https://www.googleapis.com/auth/drive.file',
            },
        });

        if (error) {
            console.error('Login error:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Logo & Branding */}
                <div className="login-header">
                    <div className="logo-large">
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="32" cy="32" r="28" stroke="url(#login-gradient)" strokeWidth="3" />
                            <circle cx="32" cy="32" r="16" fill="url(#login-gradient)" opacity="0.8" />
                            <circle cx="32" cy="32" r="6" fill="#0a0a0f" />
                            <defs>
                                <linearGradient id="login-gradient" x1="0" y1="0" x2="64" y2="64">
                                    <stop stopColor="#8b5cf6" />
                                    <stop offset="1" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1 className="login-title text-gradient">A1 Oracle Hub</h1>
                    <p className="login-subtitle">
                        あなたの思考OSを診断し、<br />
                        ビジネスを自動化する司令室
                    </p>
                </div>

                {/* Features Preview */}
                <div className="features-preview glass-card">
                    <ul className="feature-list">
                        <li>💭 AI軍師による壁打ち相談</li>
                        <li>✍️ SNS投稿の自動執筆</li>
                        <li>🎯 ライバル分析 & 戦略提案</li>
                        <li>📊 ビジネス健全度診断</li>
                    </ul>
                </div>

                {/* Login Button */}
                <button
                    className="login-button btn-primary"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="loading-spinner" />
                    ) : (
                        <>
                            <Chrome size={20} />
                            Googleでログイン
                        </>
                    )}
                </button>

                <p className="login-note">
                    ログインすることで、<a href="/terms">利用規約</a>と<a href="/privacy">プライバシーポリシー</a>に同意したものとみなされます。
                </p>
            </div>

            {/* Background Effects */}
            <div className="bg-orbs">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .login-container {
          max-width: 400px;
          width: 100%;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .login-header {
          margin-bottom: 2rem;
        }

        .logo-large {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .logo-large svg {
          width: 100%;
          height: 100%;
        }

        .login-title {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }

        .login-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .features-preview {
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .feature-list {
          list-style: none;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .feature-list li {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .login-button {
          width: 100%;
          padding: 1rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(139, 92, 246, 0.4);
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-note {
          margin-top: 1.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .login-note a {
          color: var(--color-primary-400);
          text-decoration: none;
        }

        .login-note a:hover {
          text-decoration: underline;
        }

        /* Background Orbs */
        .bg-orbs {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: var(--color-primary-600);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: var(--color-accent-500);
          bottom: -50px;
          right: -50px;
          animation-delay: -7s;
        }

        .orb-3 {
          width: 200px;
          height: 200px;
          background: var(--color-primary-500);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -14s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.05);
          }
          50% {
            transform: translate(-10px, 10px) scale(0.95);
          }
          75% {
            transform: translate(-20px, -10px) scale(1.02);
          }
        }
      `}</style>
        </div>
    );
}
