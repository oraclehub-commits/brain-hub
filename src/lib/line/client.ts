import { createClient } from '@supabase/supabase-js';

const LINE_API_BASE = 'https://api.line.me/v2';
const LINE_MESSAGING_BASE = 'https://api.line.me/v2/bot';

interface LineProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
}

interface RichMenuResponse {
    richMenuId: string;
}

/**
 * LINE Messaging API Client
 * Handles LINE authentication, profile retrieval, and rich menu management
 */
export class LineClient {
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    /**
     * Get LINE user profile from LIFF Access Token
     */
    async getProfile(liffAccessToken: string): Promise<LineProfile> {
        const response = await fetch(`${LINE_API_BASE}/profile`, {
            headers: {
                Authorization: `Bearer ${liffAccessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to get LINE profile: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Set rich menu for a specific user
     */
    async setUserRichMenu(userId: string, richMenuId: string): Promise<void> {
        const response = await fetch(
            `${LINE_MESSAGING_BASE}/user/${userId}/richmenu/${richMenuId}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to set rich menu: ${response.statusText}`);
        }
    }

    /**
     * Get current rich menu for a user
     */
    async getUserRichMenu(userId: string): Promise<string | null> {
        const response = await fetch(
            `${LINE_MESSAGING_BASE}/user/${userId}/richmenu`,
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            }
        );

        if (response.status === 404) {
            return null; // No rich menu set
        }

        if (!response.ok) {
            throw new Error(`Failed to get rich menu: ${response.statusText}`);
        }

        const data: RichMenuResponse = await response.json();
        return data.richMenuId;
    }

    /**
     * Send text message to a user
     */
    async sendMessage(userId: string, text: string): Promise<void> {
        const response = await fetch(`${LINE_MESSAGING_BASE}/message/push`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify({
                to: userId,
                messages: [
                    {
                        type: 'text',
                        text,
                    },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.statusText}`);
        }
    }
}

/**
 * Get LINE client instance with channel access token
 */
export function getLineClient(): LineClient {
    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!accessToken) {
        throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set');
    }

    return new LineClient(accessToken);
}
