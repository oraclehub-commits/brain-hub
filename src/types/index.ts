// User types
export interface User {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    referral_code: string;
    created_at: string;
    settings: UserSettings;
    oracle_type: OracleType | null;
}

export interface UserSettings {
    notifications_enabled: boolean;
    email_digest: boolean;
    theme: 'dark' | 'light' | 'system';
    gemini_api_key?: string; // User's own API key (optional)
}

export interface OracleType {
    type: string;
    strengths: string[];
    weaknesses: string[];
    diagnosed_at: string;
}

// Subscription types
export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface Subscription {
    id: string;
    user_id: string;
    tier: SubscriptionTier;
    pro_expires_at: string | null;
    pro_source: 'referral' | 'purchase' | null;
    referral_count: number;
}

// Referral types
export interface Referral {
    id: string;
    referrer_id: string;
    referred_id: string;
    created_at: string;
    reward_claimed: boolean;
}

// Task types
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    due_date: string | null;
    priority: number;
    ai_suggestion: string | null;
    created_at: string;
    updated_at: string;
}

// Consultation (壁打ち) types
export interface Consultation {
    id: string;
    user_id: string;
    user_message: string;
    ai_response: string;
    emotion_tag: EmotionTag | null;
    sales_trigger: SalesTrigger | null;
    created_at: string;
}

export type EmotionTag =
    | 'frustrated'
    | 'confused'
    | 'hopeful'
    | 'excited'
    | 'anxious'
    | 'neutral';

export interface SalesTrigger {
    type: 'stagnation' | 'success' | 'repeated_issue' | 'low_health_score';
    intensity: number; // 1-5
    message: string;
}

// SNS types
export type Platform = 'x' | 'instagram' | 'facebook';
export type SnsMode = 'normal' | 'collab';

export interface SnsDraft {
    id: string;
    user_id: string;
    platform: Platform;
    mode: SnsMode;
    content: string;
    metadata: SnsMetadata;
    created_at: string;
}

export interface SnsMetadata {
    topic?: string;
    collaboration_partner?: string;
    slide_outline?: string[];
    hashtags?: string[];
}

// Archive types
export type ArchiveType = 'post' | 'document' | 'material' | 'video';

export interface Archive {
    id: string;
    user_id: string;
    type: ArchiveType;
    title: string;
    gdrive_file_id: string | null;
    content_preview: string;
    ai_analysis: ArchiveAnalysis | null;
    structured_export: object | null;
    created_at: string;
}

export interface ArchiveAnalysis {
    keywords: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    engagement_score?: number;
    rewrite_suggestion?: string;
}

// Finance types
export type FinanceType = 'income' | 'expense';

export interface FinanceLog {
    id: string;
    user_id: string;
    type: FinanceType;
    amount: number;
    category: string;
    description: string;
    log_date: string;
    created_at: string;
}

export interface FinanceHealthScore {
    score: 1 | 2 | 3 | 4 | 5;
    label: string;
    analysis: string;
    recommendations: string[];
}

// Behavior log types
export type ActionType =
    | 'login'
    | 'sns_generate'
    | 'consultation'
    | 'task_complete'
    | 'archive_upload'
    | 'finance_log'
    | 'competitor_analysis'
    | 'referral_share';

export interface BehaviorLog {
    id: string;
    user_id: string;
    action_type: ActionType;
    payload: object;
    created_at: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Whisper (Sales messaging) types
export interface WhisperMessage {
    type: 'success' | 'stagnation' | 'completion' | 'health_warning';
    message: string;
    cta?: string;
}
