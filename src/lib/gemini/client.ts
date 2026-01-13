import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generate content using Gemini API
 */
export async function generateContent(prompt: string, systemInstruction?: string) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            systemInstruction,
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return {
            success: true,
            text,
        };
    } catch (error: any) {
        console.error('Gemini API Error:', error);

        // Handle specific error types
        if (error.message?.includes('API_KEY_INVALID')) {
            return {
                success: false,
                error: 'Invalid API key. Please check your GEMINI_API_KEY.',
            };
        }

        if (error.message?.includes('QUOTA_EXCEEDED')) {
            return {
                success: false,
                error: 'API quota exceeded. Please try again later.',
            };
        }

        return {
            success: false,
            error: error.message || 'Failed to generate content',
        };
    }
}

/**
 * Generate content with chat history (for conversations)
 */
export async function generateChat(
    messages: { role: 'user' | 'model'; parts: string }[],
    systemInstruction?: string
) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            systemInstruction,
        });

        const chat = model.startChat({
            history: messages.map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.parts }],
            })),
        });

        const result = await chat.sendMessage('');
        const response = result.response;
        const text = response.text();

        return {
            success: true,
            text,
        };
    } catch (error: any) {
        console.error('Gemini Chat Error:', error);

        return {
            success: false,
            error: error.message || 'Failed to generate chat response',
        };
    }
}

/**
 * Send a message in a chat conversation
 */
export async function sendChatMessage(
    message: string,
    history: { role: 'user' | 'model'; parts: string }[],
    systemInstruction?: string
) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            systemInstruction,
        });

        const chat = model.startChat({
            history: history.map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.parts }],
            })),
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const text = response.text();

        return {
            success: true,
            text,
        };
    } catch (error: any) {
        console.error('Gemini Chat Error:', error);

        return {
            success: false,
            error: error.message || 'Failed to send message',
        };
    }
}
