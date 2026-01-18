'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';

/**
 * LINE LIFF Callback Page
 * Handles LIFF authentication and sends access token to backend
 */
export default function LineCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'initializing' | 'authenticating' | 'success' | 'error'>('initializing');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        async function initializeLiff() {
            try {
                setStatus('initializing');

                const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
                if (!liffId) {
                    throw new Error('LIFF ID not configured');
                }

                // Initialize LIFF
                await liff.init({ liffId });

                // Check if user is logged in to LINE
                if (!liff.isLoggedIn()) {
                    // Redirect to LINE login
                    liff.login({ redirectUri: window.location.href });
                    return;
                }

                setStatus('authenticating');

                // Get access token
                const accessToken = liff.getAccessToken();
                if (!accessToken) {
                    throw new Error('Failed to get LINE access token');
                }

                // Send to backend for user linking
                const response = await fetch('/api/line/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        liffAccessToken: accessToken,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'LINE連携に失敗しました');
                }

                setStatus('success');

                // Close LIFF window and redirect to dashboard
                setTimeout(() => {
                    if (liff.isInClient()) {
                        liff.closeWindow();
                    } else {
                        router.push('/dashboard');
                    }
                }, 2000);

            } catch (err: any) {
                console.error('LIFF initialization error:', err);
                setStatus('error');
                setError(err.message || 'エラーが発生しました');
            }
        }

        initializeLiff();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <div className="glass-card p-8 max-w-md w-full text-center">
                {status === 'initializing' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold mb-2">LINE連携を準備中...</h2>
                        <p className="text-gray-400">少々お待ちください</p>
                    </>
                )}

                {status === 'authenticating' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold mb-2">アカウント連携中...</h2>
                        <p className="text-gray-400">処理を実行しています</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-green-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-green-400">連携完了！🎉</h2>
                        <p className="text-gray-400">ダッシュボードに戻ります...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-red-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-red-400">エラーが発生しました</h2>
                        <p className="text-gray-400 mb-4">{error}</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="btn btn-primary"
                        >
                            ダッシュボードに戻る
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
