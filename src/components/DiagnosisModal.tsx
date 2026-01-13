'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Brain, X } from 'lucide-react';

interface DiagnosisModalProps {
  onComplete: (result: any) => void;
  onClose: () => void;
}

const QUESTIONS = [
  {
    q: "後世に伝え残したい、あなたの「愛」の対象は？",
    a: [
      { text: "真理と本質を探求した『知の体系』", types: ['賢者', '職人'] },
      { text: "人々を魅了し、心を動かす『物語や思想』", types: ['魔術師', '共感者'] },
      { text: "世界を革新する、全く新しい『概念や技術』", types: ['開拓者', '錬金術師'] },
      { text: "人々が調和し、協力しあう『共同体』", types: ['調停者', '守護者'] }
    ]
  },
  {
    q: "あなたを最も奮い立たせるのは？",
    a: [
      { text: "手に入る『輝かしい理想の未来』のビジョン", types: ['開拓者', '魔術師'] },
      { text: "避けるべき『最悪の現実』を回避する戦略", types: ['守護者', '賢者'] },
      { text: "誰も見たことのないものを創り出す『創造のプロセス』", types: ['錬金術師', '職人'] },
      { text: "誰かの問題を解決し、貢献できる『感謝の言葉』", types: ['共感者', '調停者'] }
    ]
  },
  {
    q: "森を旅する時、心を奪われるのは？",
    a: [
      { text: "森全体を包む光や風といった『全体の雰囲気』", types: ['調停者', '魔術師'] },
      { text: "一枚の葉の葉脈、一匹の虫の動きといった『細部の神秘』", types: ['職人', '賢者'] },
      { text: "まだ誰も踏み入れたことのない『未知の小道』", types: ['開拓者', '錬金術師'] },
      { text: "共に旅する仲間との『穏やかな時間』", types: ['守護者', '共感者'] }
    ]
  },
  {
    q: "最高の達成感をもたらすのは？",
    a: [
      { text: "信頼する誰かからの『素晴らしい』という賞賛", types: ['共感者', '魔術師'] },
      { text: "自身の内なる声が告げる『完璧だ』という確信", types: ['職人', '賢者'] },
      { text: "困難な目標を『達成した』という客観的な事実", types: ['開拓者', '守護者'] },
      { text: "世界に『新たな価値』を生み出したという実感", types: ['錬金術師', '調停者'] }
    ]
  },
  {
    q: "変革を起こす時、より心を動かされるのは？",
    a: [
      { text: "一人のカリスマが道を切り拓く『英雄の物語』", types: ['開拓者', '魔術師'] },
      { text: "無数の人々が協力し合う『調和の物語』", types: ['調停者', '守護者'] },
      { text: "一つの完璧な製品が世界を変える『職人の物語』", types: ['職人', '錬金術師'] },
      { text: "一つの真実が人々を啓蒙する『賢者の物語』", types: ['賢者', '共感者'] }
    ]
  },
  {
    q: "チームで優先するのは？",
    a: [
      { text: "メンバーの感情に寄り添い『和』を保つこと", types: ['共感者', '調停者'] },
      { text: "目標達成という『任務』を最短で完了すること", types: ['守護者', '開拓者'] },
      { text: "最高のクオリティを追求し『傑作』を創ること", types: ['職人', '錬金術師'] },
      { text: "論理に基づき、最も『合理的』な判断を下すこと", types: ['賢者', '魔術師'] }
    ]
  },
  {
    q: "制約がなければ、時間を忘れて没頭するのは？",
    a: [
      { text: "複雑な問題を解き明かし、体系化すること", types: ['賢者', '調停者'] },
      { text: "人の相談に乗り、その人が笑顔になるのを見ること", types: ['共感者', '守護者'] },
      { text: "アイデアを試し、新しい何かを創造すること", types: ['錬金術師', '開拓者'] },
      { text: "一つの技術やスキルを、ひたすら磨き上げること", types: ['職人', '魔術師'] }
    ]
  }
];

export function DiagnosisModal({ onComplete, onClose }: DiagnosisModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleAnswer = async (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 診断完了
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/diagnosis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers })
        });

        const data = await response.json();
        if (data.success) {
          onComplete(data.result);
        }
      } catch (error) {
        console.error('Diagnosis failed:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQuestion];

  if (!mounted) return null;

  const content = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="diagnosis-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="diagnosis-header">
          <Brain size={32} className="diagnosis-icon" />
          <h2>🧠 脳タイプ診断</h2>
          <p>30秒で、あなたの「思考OS」を特定します</p>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="question-section">
          <p className="question-number">質問 {currentQuestion + 1} / {QUESTIONS.length}</p>
          <h3 className="question-text">{question.q}</h3>

          <div className="answers-grid">
            {question.a.map((answer, index) => (
              <button
                key={index}
                className="answer-btn"
                onClick={() => handleAnswer(index)}
                disabled={isSubmitting}
              >
                <span className="answer-label">A{index + 1}.</span>
                <span className="answer-text">{answer.text}</span>
              </button>
            ))}
          </div>
        </div>

        {isSubmitting && (
          <div className="diagnosis-loading">
            <div className="spinner" />
            <p>あなたの脳タイプを分析中...</p>
          </div>
        )}
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
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            padding: 1rem;
            backdrop-filter: blur(4px);
            overflow-y: auto;
          }

          .diagnosis-modal {
            background: linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98));
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 2rem;
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
            z-index: 9999;
          }

          .modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
            color: var(--text-primary);
          }

          .diagnosis-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .diagnosis-icon {
            color: var(--color-primary-400);
            margin: 0 auto 1rem;
            display: block;
          }

          .diagnosis-header h2 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .diagnosis-header p {
            color: var(--text-secondary);
            font-size: 0.875rem;
          }

          .progress-bar {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 2rem;
          }

          .progress-fill {
            height: 100%;\r
            background: linear-gradient(90deg, #8b5cf6, #3b82f6);
            transition: width 0.3s ease;
          }

          .question-number {
            font-size: 0.875rem;
            color: var(--color-primary-400);
            margin-bottom: 0.75rem;
            font-weight: 600;
          }

          .question-text {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            line-height: 1.5;
            color: var(--text-primary);
          }

          .answers-grid {
            display: grid;
            gap: 0.75rem;
          }

          .answer-btn {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: var(--text-primary);
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
            width: 100%;
          }

          .answer-btn:hover:not(:disabled) {
            background: rgba(139, 92, 246, 0.2);
            border-color: var(--color-primary-500);
            transform: translateY(-2px);
          }

          .answer-btn:active:not(:disabled) {
            transform: translateY(0);
          }

          .answer-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .answer-label {
            color: var(--color-primary-400);
            font-weight: 600;
            flex-shrink: 0;
          }

          .answer-text {
            flex: 1;
            font-size: 0.9375rem;
            line-height: 1.5;
          }

          .diagnosis-loading {
            position: absolute;
            inset: 0;
            background: rgba(17, 24, 39, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            z-index: 20;
          }

          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(139, 92, 246, 0.2);
            border-top-color: var(--color-primary-500);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .modal-overlay {
              padding: 0.5rem;
            }

            .diagnosis-modal {
              padding: 1.5rem;
              max-height: 95vh;
            }

            .diagnosis-header h2 {
              font-size: 1.5rem;
            }

            .question-text {
              font-size: 1.125rem;
            }

            .answer-text {
              font-size: 0.875rem;
            }

            .answer-btn {
              padding: 0.875rem;
            }
          }

          @media (max-width: 480px) {
            .diagnosis-header h2 {
              font-size: 1.25rem;
            }

            .question-text {
              font-size: 1rem;
            }
            }
          }
        `}</style>
    </div>
  );

  return createPortal(content, document.body);
}
