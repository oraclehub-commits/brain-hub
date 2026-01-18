'use client';

import { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';

interface LineMissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostpone: () => void;
}

/**
 * Mission 2: LINE Connection Gateway Modal
 * Displayed on first dashboard visit for users without LINE connection
 */
export default function LineMissionModal({ isOpen, onClose, onPostpone }: LineMissionModalProps) {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = () => {
        setIsConnecting(true);
        // Redirect to LIFF page
        const liffUrl = `${window.location.origin}/line/callback`;
        window.location.href = liffUrl;
    };

    const handlePostpone = () => {
        // Store postpone timestamp (will re-show after 3 days)
        localStorage.setItem('line_mission_postponed', Date.now().toString());
        onPostpone();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={handlePostpone}
            />

            {/* Modal */}
            <div className="relative glass-card p-8 max-w-2xl w-full animate-in fade-in zoom-in duration-300">
                {/* Close button (top right) */}
                <button
                    onClick={handlePostpone}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="後で"
                >
                    <X size={24} />
                </button>

                {/* Header with icon */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4 animate-pulse">
                        <Zap size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        ミッション2：戦術端末（LINE）の起動
                    </h2>
                    <p className="text-gray-400">システム連携により、新機能が解放されます</p>
                </div>

                {/* Benefits */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-purple-400 font-bold">1</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-1">脳タイプ診断結果の詳細レポート</h3>
                            <p className="text-gray-400 text-sm">
                                あなたの診断結果に合わせた「OS書き換え処方箋」がLINEで確認できます
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-blue-400 font-bold">2</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-1">5,000円ミッションの解放</h3>
                            <p className="text-gray-400 text-sm">
                                初回収益達成のためのタスクとサポートにアクセスできます
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-green-400 font-bold">3</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-1">AI壁打ち相談の高速化</h3>
                            <p className="text-gray-400 text-sm">
                                LINEで直接AIに相談でき、即座にフィードバックが受け取れます
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handlePostpone}
                        className="flex-1 btn btn-ghost"
                        disabled={isConnecting}
                    >
                        後で連携する
                        <span className="text-xs text-gray-500 ml-2">(3日後に再通知)</span>
                    </button>
                    <button
                        onClick={handleConnect}
                        className="flex-1 btn btn-primary relative overflow-hidden group"
                        disabled={isConnecting}
                    >
                        {isConnecting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                連携中...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                                </svg>
                                今すぐ連携する
                            </>
                        )}
                    </button>
                </div>

                {/* Security note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    🔒 LINEとの連携は安全に暗号化されています
                </p>
            </div>
        </div>
    );
}
