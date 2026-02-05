"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Tenant } from "@/types"
import { Loader2, Save, Activity, MessageCircle, Settings2, Cable, CheckCircle2, Router, Wifi, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"

// --- COMPONENTS INLINE ---
const Card = ({ children, className }: any) => (
    <div className={`rounded-lg border shadow-sm ${className}`}>{children}</div>
)
const CardHeader = ({ children }: any) => <div className="flex flex-col space-y-1.5 p-6 pb-2">{children}</div>
const CardTitle = ({ children, className }: any) => <h3 className={`font-semibold leading-none tracking-tight text-lg ${className}`}>{children}</h3>
const CardDescription = ({ children, className }: any) => <p className={`text-sm ${className}`}>{children}</p>
const CardContent = ({ children, className }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>

const Label = ({ children, ...props }: any) => <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props}>{children}</label>
const Input = ({ className, ...props }: any) => (
    <input className={`flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
)
const Button = ({ children, className, disabled, ...props }: any) => (
    <button disabled={disabled} className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${className}`} {...props}>{children}</button>
)

export default function IntegrationsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [settings, setSettings] = useState<any>({})

    // Load Data
    useEffect(() => {
        async function loadSettings() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data, error } = await supabase
                    .from('settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (data) {
                    setSettings(data)
                }
            }
            setLoading(false)
        }
        loadSettings()
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)
        setSuccess(false)

        const formData = new FormData(e.currentTarget)
        const updates = {
            meta_pixel_id: formData.get('pixelId'),
            meta_capi_token: formData.get('capiToken'),
            google_conversion_id: formData.get('googleConvId'),
            google_conversion_label: formData.get('googleLabel'),
            evolution_api_url: formData.get('evoUrl'),
            evolution_api_key: formData.get('evoKey'),
            updated_at: new Date().toISOString(),
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            // Upsert based on user_id (unique)
            // Note: If 'settings' table has id as PK, but we want one per user, user_id should be unique.
            const { error } = await supabase
                .from('settings')
                .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })

            if (error) throw error

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            console.error(err)
            alert("Erro ao salvar configurações.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <AppLayout>
            <div className="flex h-full items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        </AppLayout>
    )

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-950 p-6 md:p-8 pb-32">
                <div className="max-w-4xl mx-auto space-y-8">

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                                <Cable className="h-8 w-8 text-emerald-500" />
                                Integrações
                            </h1>
                            <p className="text-slate-400 mt-1">Conecte suas ferramentas de marketing e mensagens.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* 1. META ADS */}
                        <Card className="bg-slate-900/50 border-slate-800 overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                            <CardHeader>
                                <CardTitle className="text-blue-400 flex items-center gap-2 text-xl">
                                    Meta Ads
                                </CardTitle>
                                <CardDescription className="text-slate-400">Facebook & Instagram (API de Conversão)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 grid md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label className="text-slate-200">Pixel ID</Label>
                                    <div className="relative">
                                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input name="pixelId" defaultValue={settings.meta_pixel_id} className="pl-9 bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-blue-500" placeholder="1234567890" />
                                    </div>
                                    <p className="text-[10px] text-slate-500">O ID do seu conjunto de dados no Gerenciador de Eventos.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-slate-200">CAPI Token (Acesso)</Label>
                                    <Input name="capiToken" defaultValue={settings.meta_capi_token} className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-blue-500 font-mono text-xs" type="password" placeholder="EAA..." />
                                    <p className="text-[10px] text-slate-500">Token gerado para API de Conversões.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. GOOGLE ADS */}
                        <Card className="bg-slate-900/50 border-slate-800 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
                            <CardHeader>
                                <CardTitle className="text-yellow-500 flex items-center gap-2 text-xl">
                                    Google Ads
                                </CardTitle>
                                <CardDescription className="text-slate-400">Search & YouTube (Tag de Conversão)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 grid md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label className="text-slate-200">Conversion ID</Label>
                                    <Input name="googleConvId" defaultValue={settings.google_conversion_id} className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-yellow-500" placeholder="AW-123..." />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-slate-200">Conversion Label</Label>
                                    <Input name="googleLabel" defaultValue={settings.google_conversion_label} className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-yellow-500" placeholder="AbCdEfG..." />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. WHATSAPP EVOLUTION */}
                        <Card className="bg-slate-900/50 border-slate-800 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                            <CardHeader>
                                <CardTitle className="text-emerald-400 flex items-center gap-2 text-xl">
                                    Evolution API
                                </CardTitle>
                                <CardDescription className="text-slate-400">Automação de WhatsApp (Instância Própria)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label className="text-slate-200">URL da Instância</Label>
                                        <div className="relative">
                                            <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input name="evoUrl" defaultValue={settings.evolution_api_url} className="pl-9 bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-emerald-500" placeholder="https://api.seudominio.com" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-slate-200">API Key</Label>
                                        <Input name="evoKey" defaultValue={settings.evolution_api_key} className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-emerald-500 font-mono" type="password" />
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <Button type="button" className="bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-yellow-500" />
                                        Testar Conexão
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                    </form>

                    {/* Floating Action Bar */}
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-50">
                        <Button onClick={handleSubmit} disabled={saving} className={`
                            shadow-2xl transition-all duration-300 min-w-[200px] h-12 rounded-full font-medium
                            ${success ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-white text-slate-900 hover:bg-slate-100"}
                        `}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Salvando...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5 mr-2" />
                                    Salvo com Sucesso!
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </div>

                </div>
            </div>
        </AppLayout>
    )
}
