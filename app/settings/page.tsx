"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Tenant } from "@/types"
import { Loader2, Save, Activity, MessageCircle, Settings2, Router, Wifi, CheckCircle2 } from "lucide-react"

// --- COMPONENTS INLINE (Para evitar erro de import se o shadcn falhar) ---

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

// --- TABS COMPONENT (Tailwind Only) ---
const Tabs = ({ children, defaultValue, className }: any) => {
    const [activeTab, setActiveTab] = useState(defaultValue)
    return (
        <div className={className}>
            {/* Pass active state down to children via cloneElement pattern or Context (Simplified here with prop injection for this file structure) */}
            {/* Actually, easier to control state here and render conditionally if we were building from scratch, 
                but since I want to match the declarative syntax, I will use a Context or simple state mapping.
                Let's use a simpler approach: Just render the children and let them consume context if they were complex.
                For this file, I will rewrite the usage in the render to use simple State logic instead of Compound Components to avoid complexity.
             */}
            {/* REWRITE: I'll change the usage below to use simple conditional rendering instead of the complex component */}
            {children(activeTab, setActiveTab)}
        </div>
    )
}


// --- MOCK DATA ---
const MOCK_TENANT_SETTINGS: Tenant = {
    id: "mock-1",
    name: "Impello Demo Store",
    slug: "demo-store",
    evolution_config: {
        phone: "5511999999999",
        url: "https://api.evolution.com",
        apiKey: "xyz-123-mock-key"
    },
    ad_config: {
        meta: { pixelId: "123456789012345", capiToken: "EAA..." },
        google: { conversionId: "AW-123456789", conversionLabel: "AbCdEfG" }
    }
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [tenant, setTenant] = useState<Tenant | null>(null)
    const [activeTab, setActiveTab] = useState("general") // Default tab

    // Load Mock Data
    useEffect(() => {
        setTimeout(() => {
            setTenant(MOCK_TENANT_SETTINGS)
            setLoading(false)
        }, 500)
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)
        setSuccess(false)

        // Mock Server Delay
        await new Promise(r => setTimeout(r, 1000))

        setSaving(false)
        setSuccess(true)

        // Reset success badge after 3s
        setTimeout(() => setSuccess(false), 3000)
    }

    if (loading) return (
        <AppLayout>
            <div className="flex h-full items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        </AppLayout>
    )

    if (!tenant) return null

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-950 p-6 md:p-8 pb-32">
                <div className="max-w-4xl mx-auto space-y-8">

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-100">Configurações</h1>
                            <p className="text-slate-400">Gerencie sua loja, pixels e conexões.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="space-y-6">

                            {/* Navigation Tabs (Manual Layout) */}
                            <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg w-full md:w-auto grid grid-cols-3 md:flex h-auto">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("general")}
                                    className={`flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'general' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <Settings2 className="h-4 w-4 mr-2 hidden md:block" />
                                    Geral
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("tracking")}
                                    className={`flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'tracking' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <Activity className="h-4 w-4 mr-2 hidden md:block" />
                                    Pixel/Ads
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("whatsapp")}
                                    className={`flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <MessageCircle className="h-4 w-4 mr-2 hidden md:block" />
                                    WhatsApp
                                </button>
                            </div>

                            {/* --- TAB: GERAL --- */}
                            {activeTab === "general" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <Card className="bg-slate-900/50 border-slate-800">
                                        <CardHeader>
                                            <CardTitle className="text-slate-100 flex items-center gap-2">
                                                <Settings2 className="h-5 w-5 text-emerald-500" />
                                                Dados da Loja
                                            </CardTitle>
                                            <CardDescription className="text-slate-400">Informações visíveis no seu link de redirecionamento.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name" className="text-slate-200">Nome da Marca</Label>
                                                <Input id="name" name="name" defaultValue={tenant.name} className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-emerald-500" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="slug" className="text-slate-200">Endereço da Loja (Slug)</Label>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-slate-800 px-3 py-2.5 rounded-md text-slate-400 text-sm border border-slate-700">impello.com/</div>
                                                    <Input id="slug" name="slug" defaultValue={tenant.slug} className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-emerald-500" />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="whatsapp" className="text-slate-200">WhatsApp de Atendimento</Label>
                                                <Input id="whatsapp" name="whatsapp" defaultValue={tenant.evolution_config?.phone} className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-emerald-500" placeholder="5511999999999" />
                                                <p className="text-xs text-slate-500">Número para onde os clientes serão redirecionados.</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* --- TAB: TRACKING --- */}
                            {activeTab === "tracking" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Meta Card */}
                                        <Card className="bg-slate-900/50 border-slate-800 overflow-hidden relative group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                                            <CardHeader>
                                                <CardTitle className="text-blue-400 flex items-center gap-2">
                                                    Meta Ads
                                                </CardTitle>
                                                <CardDescription className="text-slate-400">Facebook & Instagram</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid gap-2">
                                                    <Label className="text-slate-200">Pixel ID</Label>
                                                    <div className="relative">
                                                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                        <Input name="pixelId" defaultValue={tenant.ad_config?.meta?.pixelId} className="pl-9 bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-blue-500" placeholder="1234567890" />
                                                    </div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label className="text-slate-200">CAPI Token</Label>
                                                    <Input name="capiToken" defaultValue={tenant.ad_config?.meta?.capiToken} className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-blue-500 font-mono text-xs" type="password" placeholder="EAA..." />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Google Card */}
                                        <Card className="bg-slate-900/50 border-slate-800 overflow-hidden relative">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
                                            <CardHeader>
                                                <CardTitle className="text-yellow-500 flex items-center gap-2">
                                                    Google Ads
                                                </CardTitle>
                                                <CardDescription className="text-slate-400">Search & YouTube</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid gap-2">
                                                    <Label className="text-slate-200">Conversion ID</Label>
                                                    <Input name="googleConvId" defaultValue={tenant.ad_config?.google?.conversionId} className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-yellow-500" placeholder="AW-123..." />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label className="text-slate-200">Conversion Label</Label>
                                                    <Input name="googleLabel" defaultValue={tenant.ad_config?.google?.conversionLabel} className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-yellow-500" placeholder="AbCdEfG..." />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: WHATSAPP --- */}
                            {activeTab === "whatsapp" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <Card className="bg-slate-900/50 border-slate-800">
                                        <CardHeader>
                                            <CardTitle className="text-emerald-400 flex items-center gap-2">
                                                <Router className="h-5 w-5" />
                                                Evolution API
                                            </CardTitle>
                                            <CardDescription className="text-slate-400">Conecte sua instância para enviar e receber mensagens automaticamente.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4 max-w-2xl">
                                            <div className="grid gap-2">
                                                <Label className="text-slate-200">URL da Instância</Label>
                                                <div className="relative">
                                                    <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                    <Input name="evoUrl" defaultValue={tenant.evolution_config?.url} className="pl-9 bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-emerald-500" placeholder="https://api.seudominio.com" />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-slate-200">API Key</Label>
                                                <Input name="evoKey" defaultValue={tenant.evolution_config?.apiKey} className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-emerald-500 font-mono" type="password" />
                                            </div>
                                            <div className="pt-2">
                                                <Button type="button" className="bg-transparent border border-emerald-800 text-emerald-500 hover:bg-emerald-950/50 hover:text-emerald-400 w-full md:w-auto">
                                                    Testar Conexão (Ping)
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                        </div>

                        {/* Floating Action Bar */}
                        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-50">
                            <Button type="submit" disabled={saving} className={`
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
                    </form>
                </div>
            </div>
        </AppLayout>
    )
}
