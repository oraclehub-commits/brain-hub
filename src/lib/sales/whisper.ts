import type { SalesTrigger, WhisperMessage, Consultation } from '@/types';

// Analyze consultations for stagnation patterns
export function detectStagnation(consultations: Consultation[]): SalesTrigger | null {
    if (consultations.length < 3) return null;

    // Get last 5 consultations
    const recent = consultations.slice(-5);

    // Simple keyword matching for similar issues
    const topics = recent.map(c => extractTopics(c.user_message));
    const repeatedTopics = findRepeatedTopics(topics);

    if (repeatedTopics.length > 0) {
        return {
            type: 'repeated_issue',
            intensity: Math.min(repeatedTopics.length, 5),
            message: `同じ悩み（${repeatedTopics[0]}）が繰り返し相談されています`,
        };
    }

    return null;
}

// Extract main topics from user message
function extractTopics(message: string): string[] {
    const keywords = [
        '売上', '集客', '発信', 'SNS', 'フォロワー',
        'お金', '時間', 'モチベーション', '自信',
        'クライアント', '商品', 'サービス', '価格',
        '競合', '差別化', 'ブランディング',
        '不安', '焦り', '迷い', '決断',
    ];

    return keywords.filter(kw => message.includes(kw));
}

// Find topics that appear multiple times
function findRepeatedTopics(topicsList: string[][]): string[] {
    const count: Record<string, number> = {};

    topicsList.forEach(topics => {
        topics.forEach(topic => {
            count[topic] = (count[topic] || 0) + 1;
        });
    });

    return Object.entries(count)
        .filter(([, c]) => c >= 3)
        .map(([topic]) => topic);
}

// Detect success patterns
export function detectSuccess(consultations: Consultation[]): boolean {
    if (consultations.length === 0) return false;

    const lastMessage = consultations[consultations.length - 1].user_message;
    const successKeywords = [
        '成功', 'うまくいった', 'できた', '達成',
        '売れた', '契約', '申し込み', '感謝',
    ];

    return successKeywords.some(kw => lastMessage.includes(kw));
}

// Generate appropriate whisper message based on context
export function generateWhisper(
    trigger: 'success' | 'stagnation' | 'completion' | 'health_warning',
    intensity: number = 3
): WhisperMessage {
    const messages: Record<string, WhisperMessage[]> = {
        success: [
            {
                type: 'success',
                message: '素晴らしい成果です。この質を常態化させるには、思考力のレベルアップが不可欠です。',
            },
            {
                type: 'success',
                message: '成功体験を一度きりで終わらせないために、「なぜうまくいったか」を言語化しておくことをお勧めします。',
            },
        ],
        stagnation: [
            {
                type: 'stagnation',
                message: '同じ悩みが繰り返されています。これはツールの問題ではなく、思考OSのアップデートが必要なサインです。',
                cta: '思考レベル診断を受ける',
            },
            {
                type: 'stagnation',
                message: '行動が変わらない限り、結果は変わりません。今の自分の「限界」を正しく認識することが、成長の第一歩です。',
            },
        ],
        completion: [
            {
                type: 'completion',
                message: '今日も一歩前進しました。しかし、真の成長は「やり方」ではなく「考え方」の変化から生まれます。',
            },
            {
                type: 'completion',
                message: 'ツールはあくまで道具です。使い手のレベルが上がらなければ、成果には限界があります。',
            },
        ],
        health_warning: [
            {
                type: 'health_warning',
                message: 'ビジネスの健全度が低下しています。数字から目を背けることは、将来の自分への責任放棄です。',
                cta: '経営力強化講座を見る',
            },
            {
                type: 'health_warning',
                message: '収支のバランスが崩れています。感情ではなく、データに基づいた意思決定を習慣化しましょう。',
            },
        ],
    };

    const options = messages[trigger];
    const index = Math.min(intensity - 1, options.length - 1);

    return options[Math.max(0, index)];
}
