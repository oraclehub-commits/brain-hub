'use client';

import { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import Link from 'next/link';

interface LineReminderBannerProps {
    onDismiss?: () => void;
}

/**
 * Persistent reminder banner for LINE connection
 * Shows at top of dashboard for users without LINE connection
 * Can be dismissed and will re-appear after 7 days
 */
export default function LineReminderBanner({ onDismiss }: LineReminderBannerProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if banner was dismissed recently
        const dismissedAt = localStorage.getItem('line_banner_dismissed');
        if (dismissedAt) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                return; // Don't show if dismissed within last 7 days
            }
        }
        setIsVisible(true);
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('line_banner_dismissed', Date.now().toString());
        setIsVisible(false);
        onDismiss?.();
    };

    if (!isVisible) return null;

    return (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-b border-green-500/20 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                            <Bell className="w-5 h-5 text-green-400 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">
                                <span className="inline-flex items-center gap-2">
                                    <span>LINE連携で全機能解放</span>
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                        NEW
                                    </span>
                                </span>
                            </p>
                            <p className="text-xs text-gray-400 hidden sm:block">
                                診断結果の詳細レポート、5,000円ミッション、AI壁打ち高速化が利用可能に
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                            href="/line/callback"
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap"
                        >
                            今すぐ連携
                        </Link>
                        <button
                            onClick={handleDismiss}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            aria-label="バナーを閉じる"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
