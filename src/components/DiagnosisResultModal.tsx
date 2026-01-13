'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Brain, X, Crown } from 'lucide-react';

interface DiagnosisResultModalProps {
  result: any;
  onClose: () => void;
}

export function DiagnosisResultModal({ result, onClose }: DiagnosisResultModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!result || !mounted) return null;

  const content = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="result-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="result-header">
          <div className="result-icon">{result.artwork}</div>
          <h2>あなたは<br /><span className="type-name">{result.name}</span></h2>
          <p className="catchcopy">{result.catchcopy}</p>
        </div>

        <div className="result-content">
          <div className="result-section">
            <h3><span className="section-icon">✨</span>あなたの「光」（才能の正体）</h3>
            <p>{result.shadow}</p>
          </div>

          <div className="result-section warning">
            <h3><span className="section-icon">⚠️</span>あなたの「影」（制限の正体）</h3>
            <p>{result.shadow}</p>
          </div>

          <div className="result-section solution">
            <h3><span className="section-icon">🔑</span>「資産」に変える調律戦略</h3>
            <p>{result.solution}</p>
          </div>
        </div>

        <div className="result-footer">
          <p className="footer-note">
            💎 PRO版では、この診断結果を基にAI軍師があなた専用のアドバイスを提供します
          </p>
          <button className="btn btn-primary" onClick={onClose}>
            閉じる
          </button>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            padding: 1rem;
            backdrop-filter: blur(8px);
            overflow-y: auto;
          }

          .result-modal-wrapper {
            background: linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98));
            border: 1px solid rgba(139, 92, 246, 0.5);
            border-radius: 20px;
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 2.5rem;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }

          .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.2s;
            z-index: 10;
          }

          .modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
            color: var(--text-primary);
          }

          .result-header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .result-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5));
          }

          .result-header h2 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 1rem;
            line-height: 1.3;
          }

          .type-name {
            display: block;
            font-size: 2rem;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-top: 0.5rem;
          }

          .catchcopy {
            font-size: 1.125rem;
            color: var(--text-secondary);
            font-style: italic;
            line-height: 1.6;
            border-left: 4px solid var(--color-accent-500);
            padding-left: 1rem;
            margin: 1.5rem auto 0;
            max-width: 90%;
            text-align: left;
          }

          .result-content {
            margin-bottom: 2rem;
          }

          .result-section {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .result-section.warning {
            background: rgba(239, 68, 68, 0.05);
            border-color: rgba(239, 68, 68, 0.3);
          }

          .result-section.solution {
            background: rgba(34, 197, 94, 0.05);
            border-color: rgba(34, 197, 94, 0.3);
          }

          .result-section h3 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: var(--text-primary);
          }

          .section-icon {
            font-size: 1.25rem;
          }

          .result-section p {
            font-size: 0.9375rem;
            line-height: 1.7;
            color: var(--text-secondary);
          }

          .result-footer {
            text-align: center;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .footer-note {
            font-size: 0.875rem;
            color: var(--color-primary-300);
            margin-bottom: 1.5rem;
            padding: 0.75rem;
            background: rgba(139, 92, 246, 0.1);
            border-radius: 8px;
          }

          @media (max-width: 768px) {
            .result-modal-wrapper {
              padding: 1.5rem;
            }

            .result-icon {
              font-size: 3rem;
            }

            .type-name {
              font-size: 1.5rem;
            }

            .catchcopy {
              font-size: 1rem;
            }
          }
        `}</style>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
