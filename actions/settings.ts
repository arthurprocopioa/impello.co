"use server"

import { supabase } from "@/lib/supabase"
import { Tenant } from "@/types"
import { revalidatePath } from "next/cache"

// MVP: Hardcoded Tenant ID just like in the Seed
const TENANT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

export async function getTenantSettings() {
    const { data: tenant, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', TENANT_ID)
        .single()

    if (error) {
        console.error("Error fetching settings:", error)
        return null
    }

    return tenant as Tenant
}

export async function updateSettings(formData: FormData) {
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const whatsapp = formData.get("whatsapp") as string

    // Ad Configs
    const pixelId = formData.get("pixelId") as string
    const capiToken = formData.get("capiToken") as string
    const googleConvId = formData.get("googleConvId") as string
    const googleLabel = formData.get("googleLabel") as string

    // Evolution Configs
    const evoUrl = formData.get("evoUrl") as string
    const evoKey = formData.get("evoKey") as string

    const { error } = await supabase
        .from('tenants')
        .update({
            name,
            slug,
            evolution_config: {
                phone: whatsapp,
                url: evoUrl,
                apiKey: evoKey
            },
            ad_config: {
                meta: { pixelId, capiToken },
                google: { conversionId: googleConvId, conversionLabel: googleLabel }
            }
        })
        .eq('id', TENANT_ID)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/settings')
    return { success: true }
}
