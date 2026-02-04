"use server"

import { supabase } from "@/lib/supabase"
import { Contact, Order } from "@/types"

// Mock Event Payload Types
interface CapiPayload {
    event_name: "Purchase";
    event_time: number;
    user_data: {
        ph: string[]; // SHA256 Phone
        fbc?: string;
        fbp?: string;
    };
    custom_data: {
        value: number;
        currency: "BRL";
    };
}

interface OfflineConvPayload {
    gclid: string;
    conversion_time: string;
    conversion_value: number;
    currency_code: "BRL";
}

export async function registerSale(contact: Contact, amount: number, paymentStatus: string) {
    // 1. Create Order in Supabase
    // We use a clean simple insert here. In real app, consider checking auth.
    const { data: order, error } = await supabase
        .from('orders')
        .insert({
            tenant_id: contact.tenant_id,
            contact_id: contact.id,
            amount: amount,
            platform_source: contact.last_source,
            sent_to_capi: false,
            sent_to_google: false
        })
        .select()
        .single()

    if (error) {
        console.error("Error creating order:", error)
        return { success: false, error: error.message }
    }

    // 2. Dispatch Attribution Events (Async Simulation)
    let capiSent = false
    let gadsSent = false

    if (contact.last_source === 'META' && contact.latest_fbclid) {
        capiSent = await simulateCAPI(contact, amount)
    } else if (contact.last_source === 'GOOGLE' && contact.latest_gclid) {
        gadsSent = await simulateOfflineConversion(contact, amount)
    }

    // 3. Update Order flags
    await supabase
        .from('orders')
        .update({ sent_to_capi: capiSent, sent_to_google: gadsSent })
        .eq('id', order.id)

    return { success: true, orderId: order.id }
}

// --- Simulators ---

async function simulateCAPI(contact: Contact, amount: number): Promise<boolean> {
    const payload: CapiPayload = {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
            ph: [sha256(contact.phone)], // In real app, verify phone formatting (remove +55, clean chars)
            fbc: contact.latest_fbclid || undefined // format: fb.1.timestamp.code
        },
        custom_data: {
            value: amount,
            currency: "BRL"
        }
    }

    console.log("🚀 [CAPI] Sending Event to Meta:", JSON.stringify(payload, null, 2))
    // await fetch('https://graph.facebook.com/v19.0/PIXEL_ID/events', ...)
    return true
}

async function simulateOfflineConversion(contact: Contact, amount: number): Promise<boolean> {
    const payload: OfflineConvPayload = {
        gclid: contact.latest_gclid!,
        conversion_time: new Date().toISOString(),
        conversion_value: amount,
        currency_code: "BRL"
    }

    console.log("🦖 [GADS] Sending Offline Conversion:", JSON.stringify(payload, null, 2))
    // await googleAdsClient.uploadClickConversions(...)
    return true
}

// Simple Helper for mock hashing
function sha256(str: string) {
    // Real implementation would use crypto module
    return "hashed_" + str
}
