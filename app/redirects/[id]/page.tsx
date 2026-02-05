"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { supabase } from "@/lib/supabase"
import {
    ArrowLeft,
    BarChart3,
    MessageCircle,
    Target,
    Settings,
    LayoutTemplate,
    ExternalLink,
    Loader2
} from "lucide-react"

// --- TYPES ---
interface Redirect {
    id: string
    name: string
    slug: string
    message: string
    destination: string
    clicks: number
    status: 'ACTIVE' | 'ARCHIVED'
}

// --- COMPONENTS (Placeholders) ---
const RedirectReports = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600">
            <BarChart3 className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium text-slate-200">Relatórios de Performance</h3>
        <p className="text-slate-500 max-w-sm mt-2">Visualize métricas detalhadas de cliques, conversões e origem do tráfego.</p>
        <span className="mt-6 px-3 py-1 bg-emerald-950/30 text-emerald-400 text-xs font-mono rounded border border-emerald-900/50">Em Breve</span>
    </div>
)

const RedirectInstance = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600">
            <MessageCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium text-slate-200">Instância & WhatsApp</h3>
        <p className="text-slate-500 max-w-sm mt-2">Gerencie a conexão com o WhatsApp e configure mensagens automáticas.</p>
        <span className="mt-6 px-3 py-1 bg-emerald-950/30 text-emerald-400 text-xs font-mono rounded border border-emerald-900/50">Em Breve</span>
    </div>
)

const RedirectTracking = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600">
            <Target className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium text-slate-200">Pixels & Rastreamento</h3>
        <p className="text-slate-500 max-w-sm mt-2">Configure o Pixel da Meta, Google Ads e TikTok para otimizar suas campanhas.</p>
        <span className="mt-6 px-3 py-1 bg-emerald-950/30 text-emerald-400 text-xs font-mono rounded border border-emerald-900/50">Em Breve</span>
    </div>
)

const RedirectSettings = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600">
            <Settings className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium text-slate-200">Configurações Gerais</h3>
        <p className="text-slate-500 max-w-sm mt-2">Edite nome, slug, número de destino e outras propriedades básicas.</p>
        <span className="mt-6 px-3 py-1 bg-emerald-950/30 text-emerald-400 text-xs font-mono rounded border border-emerald-900/50">Em Breve</span>
    </div>
)

const RedirectPageConfig = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600">
            <LayoutTemplate className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium text-slate-200">Página de Redirecionamento</h3>
        <p className="text-slate-500 max-w-sm mt-2">Personalize o visual da página que seu cliente vê antes de ir para o WhatsApp.</p>
        <span className="mt-6 px-3 py-1 bg-emerald-950/30 text-emerald-400 text-xs font-mono rounded border border-emerald-900/50">Em Breve</span>
    </div>
)

export default function RedirectManagementPage() {
    const params = useParams()
    const router = useRouter()
    const { id } = params as { id: string }

    const [redirect, setRedirect] = useState<Redirect | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("reports")

    useEffect(() => {
        const fetchRedirect = async () => {
            if (!id) return
            try {
                const { data, error } = await supabase
                    .from('redirects')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error
                setRedirect(data)
            } catch (error) {
                console.error("Error fetching redirect:", error)
                // router.push('/redirects') // Optional: redirect back on error
            } finally {
                setLoading(false)
            }
        }
        fetchRedirect()
    }, [id])

    const renderTabContent = () => {
        switch (activeTab) {
            case "reports": return <RedirectReports />
            case "instance": return <RedirectInstance />
            case "tracking": return <RedirectTracking />
            case "settings": return <RedirectSettings />
            case "page": return <RedirectPageConfig />
            default: return <RedirectReports />
        }
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="flex h-full items-center justify-center bg-slate-950">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
            </AppLayout>
        )
    }

    if (!redirect) return (
        <AppLayout>
            <div className="flex h-full items-center justify-center bg-slate-950 flex-col gap-4">
                <p className="text-slate-500">Redirecionador não encontrado.</p>
                <button onClick={() => router.push('/redirects')} className="text-emerald-500 hover:underline">Voltar para lista</button>
            </div>
        </AppLayout>
    )

    return (
        <AppLayout>
            <div className="flex flex-col h-full bg-slate-950">
                {/* Header */}
                <header className="px-6 py-6 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/redirects')}
                                className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                    {redirect.name}
                                </h1>
                                <a
                                    href={`https://impello.co/${redirect.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-emerald-500 hover:text-emerald-400 font-mono flex items-center gap-1 mt-0.5"
                                >
                                    impello.co/{redirect.slug}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
                            <TabButton
                                active={activeTab === "reports"}
                                onClick={() => setActiveTab("reports")}
                                icon={<BarChart3 className="h-4 w-4" />}
                                label="Relatórios"
                            />
                            <TabButton
                                active={activeTab === "instance"}
                                onClick={() => setActiveTab("instance")}
                                icon={<MessageCircle className="h-4 w-4" />}
                                label="Instância/WhatsApp"
                            />
                            <TabButton
                                active={activeTab === "tracking"}
                                onClick={() => setActiveTab("tracking")}
                                icon={<Target className="h-4 w-4" />}
                                label="Rastreamento"
                            />
                            <TabButton
                                active={activeTab === "settings"}
                                onClick={() => setActiveTab("settings")}
                                icon={<Settings className="h-4 w-4" />}
                                label="Configurações"
                            />
                            <TabButton
                                active={activeTab === "page"}
                                onClick={() => setActiveTab("page")}
                                icon={<LayoutTemplate className="h-4 w-4" />}
                                label="Página de Redirecionamento"
                            />
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto bg-slate-950 p-6">
                    <div className="max-w-5xl mx-auto">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

function TabButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${active
                    ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900"
                }`}
        >
            {icon}
            {label}
        </button>
    )
}
