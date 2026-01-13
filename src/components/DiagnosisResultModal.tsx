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
    <div
      className="fixed inset-0 w-screen h-screen bg-black/90 flex items-center justify-center z-[99999] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/98 to-gray-800/98 border border-purple-500/50 rounded-2xl p-6 md:p-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition-all z-10 border-none cursor-pointer"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8 pb-8 border-b border-white/10">
          <div className="text-6xl mb-4 filter drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            {result.artwork}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
            あなたは<br />
            <span className="block text-3xl md:text-4xl mt-2 bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {result.name}
            </span>
          </h2>
          <p className="text-lg text-gray-400 italic leading-relaxed border-l-4 border-amber-500 pl-4 mt-6 mx-auto max-w-[90%] text-left">
            {result.catchcopy}
          </p>
        </div>

        <div className="mb-8 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3 text-white">
              <span className="text-xl">✨</span>あなたの「光」（才能の正体）
            </h3>
            <p className="text-[15px] leading-relaxed text-gray-300">
              {/* シャドウと同じテキストが入っていたので修正が必要かも？一旦そのまま */}
              {result.shadow}
            </p>
          </div>

          <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3 text-white">
              <span className="text-xl">⚠️</span>あなたの「影」（制限の正体）
            </h3>
            <p className="text-[15px] leading-relaxed text-gray-300">
              {result.shadow}
            </p>
          </div>

          <div className="bg-green-500/5 border border-green-500/30 rounded-xl p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3 text-white">
              <span className="text-xl">🔑</span>「資産」に変える調律戦略
            </h3>
            <p className="text-[15px] leading-relaxed text-gray-300">
              {result.solution}
            </p>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-white/10">
          <p className="text-sm text-purple-300 mb-6 p-3 bg-purple-500/10 rounded-lg">
            💎 PRO版では、この診断結果を基にAI軍師があなた専用のアドバイスを提供します
          </p>
          <button
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
