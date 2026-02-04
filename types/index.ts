export type ContactSource = 'META' | 'GOOGLE' | 'DIRECT';
export type FunnelStatus = 'PENDING' | 'OPEN' | 'RESOLVED';
export type MessageDirection = 'IN' | 'OUT';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    evolution_config?: any;
    ad_config?: any;
}

export interface Contact {
    id: string;
    tenant_id: string;
    phone: string;
    name: string | null;
    profile_pic?: string | null;

    // Attribution
    last_source: ContactSource;
    latest_fbclid?: string | null;
    latest_gclid?: string | null;
    last_click_at?: string; // ISO String

    funnel_status: FunnelStatus;

    // UI helpers (optional)
    unread_count?: number;
    last_message?: string;
    last_message_at?: string;
}

export interface Message {
    id: string;
    contact_id: string;
    direction: MessageDirection;
    content: string;
    status: MessageStatus;
    created_at: string;
    type?: 'TEXT' | 'SYSTEM';
}

export interface Order {
    id: string;
    contact_id: string;
    amount: number;
    platform_source: ContactSource;
    sent_to_capi: boolean;
    sent_to_google: boolean;
    created_at: string;
}
