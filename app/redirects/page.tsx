"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { supabase } from "@/lib/supabase"
import {
    GitGraph,
    Plus,
    Search,
    MoreHorizontal,
    Copy,
    ExternalLink,
    Trash2,
    Edit,
    Settings,
    X,
    MessageCircle,
    Target,
    Facebook,
    Globe,
    Video,
    ArrowRight,
    ArrowLeft,
    Check,
    Smartphone,
    Palette,
    Image as ImageIcon,
    Loader2
} from "lucide-react"

// --- TYPES ---
type Platform = 'META' | 'GOOGLE' | 'TIKTOK'
type EventType = 'PageView' | 'Purchase' | 'Lead' | 'InitiateCheckout' | 'Contact'

interface TrackingEvent {
    id: string
    platform: Platform
    eventType: EventType
}

interface RedirectAppearance {
    loadingText: string
    spinnerColor: 'emerald' | 'blue' | 'rose' | 'amber'
    logoUrl?: string
}

interface Redirect {
    id: string
    name: string
    slug: string
    message: string
    destination: string
    clicks: number
    status: 'ACTIVE' | 'ARCHIVED'
    events: TrackingEvent[]
    appearance: RedirectAppearance
    createdAt: string
}

// --- COMPONENTS ---

const Modal = ({ isOpen, onClose, children, size = "md" }: any) => {
    if (!isOpen) return null
    const maxWidth = size === "lg" ? "max-w-4xl" : "max-w-2xl"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className={`relative w-full ${maxWidth} transform overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-2xl transition-all flex flex-col max-h-[90vh]`}>
                {children}
            </div>
        </div>
    )
}

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
    const steps = [
        { num: 1, label: "Dados Básicos" },
        { num: 2, label: "Pixels & Eventos" },
        { num: 3, label: "Aparência" }
    ]
    return (
        <div className="flex items-center justify-between w-full max-w-lg mx-auto mb-8 px-4">
            {steps.map((step) => (
                <div key={step.num} className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${currentStep >= step.num
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                        }`}>
                        {currentStep > step.num ? <Check className="h-4 w-4" /> : step.num}
                    </div>
                    <span className={`text-[10px] font-medium mt-2 uppercase tracking-wide transition-colors ${currentStep >= step.num ? 'text-emerald-500' : 'text-slate-600'
                        }`}>{step.label}</span>
                </div>
            ))}
            <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-800 -z-0 hidden md:block" style={{ left: '50%', transform: 'translateX(-50%)', width: '60%' }} />
            <div className="absolute top-4 left-0 h-0.5 bg-emerald-600 -z-0 hidden md:block transition-all duration-300"
                style={{
                    left: '20%',
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '30%' : '60%'
                }}
            />
        </div>
    )
}

export default function RedirectsPage() {
    const router = useRouter()
    // --- STATE ---
    const [redirects, setRedirects] = useState<Redirect[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const [isWizardOpen, setIsWizardOpen] = useState(false)
    const [wizardStep, setWizardStep] = useState(1)

    // FORM DATA
    const [formData, setFormData] = useState<Partial<Redirect>>({
        name: "",
        slug: "",
        message: "",
        destination: "5511999999999",
        events: [],
        appearance: { loadingText: "Conectando ao especialista...", spinnerColor: "emerald" }
    })

    const [isAddingEvent, setIsAddingEvent] = useState(false)
    const [eventStep, setEventStep] = useState<'PLATFORM' | 'TYPE'>('PLATFORM')
    const [tempEvent, setTempEvent] = useState<Partial<TrackingEvent>>({})

    // --- SUPABASE FETCH ---
    const fetchRedirects = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('redirects')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setRedirects(data as any)
        } catch (error) {
            console.error("Erro ao buscar redirects:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRedirects()
    }, [])

    // --- HANDLERS ---
    const handleCopyLink = (slug: string) => {
        const url = `https://impello.co/${slug}`
        navigator.clipboard.writeText(url)
        alert("Link copiado: " + url) // Simple feedback for now
    }

    const openWizard = () => {
        setFormData({
            name: "",
            slug: "",
            message: "",
            destination: "5511999999999",
            events: [],
            appearance: { loadingText: "Conectando ao especialista...", spinnerColor: "emerald" }
        })
        setWizardStep(1)
        setIsWizardOpen(true)
    }

    const handleSaveRedirect = async () => {
        if (!formData.name || !formData.slug) return

        const newRedirect = {
            name: formData.name,
            slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
            message: formData.message || "",
            destination: formData.destination || "5511999999999",
            status: 'ACTIVE',
            events: formData.events || [],
            appearance: formData.appearance || {},
        }

        try {
            // Optimistic
            const tempId = Math.random().toString()
            const optimisticRedirect = { ...newRedirect, id: tempId, clicks: 0, createdAt: new Date().toISOString() } as unknown as Redirect
            setRedirects([optimisticRedirect, ...redirects])
            setIsWizardOpen(false)

            // Real DB Insert
            const { error } = await supabase.from('redirects').insert(newRedirect)
            if (error) throw error

            await fetchRedirects()
        } catch (err) {
            console.error("Erro ao salvar:", err)
            alert("Erro ao salvar no banco de dados. Verifique o console.")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir?")) return

        try {
            setRedirects(redirects.filter(r => r.id !== id))
            const { error } = await supabase.from('redirects').delete().eq('id', id)
            if (error) throw error
        } catch (err) {
            console.error("Erro deletar:", err)
            fetchRedirects()
        }
    }

    const handleAddEvent = () => {
        if (tempEvent.platform && tempEvent.eventType) {
            const newEvent: TrackingEvent = {
                id: Math.random().toString(),
                platform: tempEvent.platform,
                eventType: tempEvent.eventType
            }
            setFormData(prev => ({ ...prev, events: [...(prev.events || []), newEvent] }))
            setIsAddingEvent(false)
            setTempEvent({})
            setEventStep('PLATFORM')
        }
    }

    const getPlatformIcon = (p: Platform) => {
        switch (p) {
            case 'META': return <Facebook className="h-5 w-5 text-blue-500" />
            case 'GOOGLE': return <Globe className="h-5 w-5 text-yellow-500" />
            case 'TIKTOK': return <Video className="h-5 w-5 text-pink-500" />
        }
    }

    return (
        <AppLayout>
            <div className="flex flex-col h-full bg-slate-950">
                <header className="px-6 py-8 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-100">Meus Redirecionadores</h1>
                            <p className="text-slate-400 text-sm mt-1">Gerencie seus links de entrada e pixels de rastreamento.</p>
                        </div>
                        <button
                            onClick={openWizard}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            Novo Redirecionador
                        </button>
                    </div>
                </header>

                <div className="p-6 md:p-8 flex-1 overflow-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="px-6 py-4">Nome & Link</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Cliques</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {redirects.map(redirect => (
                                    <tr key={redirect.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-200 text-base">{redirect.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <code className="text-xs text-emerald-400/90 font-mono">impello.co/{redirect.slug}</code>
                                                <button onClick={() => handleCopyLink(redirect.slug)} title="Copiar Link">
                                                    <Copy className="h-3 w-3 text-slate-600 hover:text-emerald-400 cursor-pointer" />
                                                </button>
                                                <ExternalLink className="h-3 w-3 text-slate-600 hover:text-emerald-400 cursor-pointer" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${redirect.status === 'ACTIVE'
                                                ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                                }`}>
                                                {redirect.status === 'ACTIVE' ? 'Ativo' : 'Arquivado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-slate-300">{redirect.clicks}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-slate-400">
                                                <button
                                                    onClick={() => router.push(`/redirects/${redirect.id}`)}
                                                    className="p-2 hover:bg-slate-800 rounded-md hover:text-white transition-colors"
                                                    title="Configurações"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(redirect.id)}
                                                    className="p-2 hover:bg-red-950/30 rounded-md hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {redirects.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            Nenhum redirecionador encontrado. Crie o primeiro!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} size="lg">
                    <div className="flex flex-col h-[80vh] md:h-[750px]">
                        <div className="p-6 border-b border-slate-800 bg-slate-900 relative">
                            <button onClick={() => setIsWizardOpen(false)} className="absolute right-6 top-6 text-slate-500 hover:text-white z-20">
                                <X className="h-5 w-5" />
                            </button>
                            <h2 className="text-xl font-bold text-center text-slate-100 mb-6">Criar Redirecionador</h2>
                            <StepIndicator currentStep={wizardStep} />
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-950/30">
                            {wizardStep === 1 && (
                                <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                                    <div className="space-y-4">
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-300 mb-1.5 block">Nome de Identificação</span>
                                            <input
                                                autoFocus
                                                value={formData.name}
                                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                                placeholder="Ex: Campanha Black Friday"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-300 mb-1.5 block">Slug do Link</span>
                                            <div className="flex items-center group">
                                                <div className="bg-slate-800 border border-r-0 border-slate-700 rounded-l-lg px-4 py-3 text-slate-400 text-sm font-mono group-focus-within:border-emerald-500 group-focus-within:text-emerald-500 transition-colors">
                                                    impello.co/
                                                </div>
                                                <input
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-r-lg px-4 py-3 text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600 font-mono"
                                                    placeholder="minha-oferta"
                                                />
                                            </div>
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-300 mb-1.5 block">Número de Destino</span>
                                            <div className="relative">
                                                <Smartphone className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                                                <select
                                                    value={formData.destination}
                                                    onChange={(e) => setFormData(p => ({ ...p, destination: e.target.value }))}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                                                >
                                                    <option value="5511999999999">WhatsApp Principal (55 11 99999-9999)</option>
                                                </select>
                                                <div className="absolute right-3 top-3.5 pointer-events-none">
                                                    <ChevronDownIcon />
                                                </div>
                                            </div>
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-300 mb-1.5 block">Mensagem do WhatsApp</span>
                                            <textarea
                                                value={formData.message}
                                                onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-28"
                                                placeholder="Escreva a mensagem que o cliente enviará..."
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 2 && (
                                <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                                    <div className="space-y-3 min-h-[200px]">
                                        {(!formData.events || formData.events.length === 0) ? (
                                            <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                                                <Target className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                                                <p className="text-slate-400 font-medium">Nenhum evento configurado.</p>
                                                <p className="text-xs text-slate-500 mt-1">Adicione pixels para rastrear suas conversões.</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-3">
                                                {formData.events.map((event, idx) => (
                                                    <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center justify-between shadow-sm">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-800 border border-slate-700">
                                                                {getPlatformIcon(event.platform)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-200">{event.platform === 'META' ? 'Meta Ads' : event.platform === 'GOOGLE' ? 'Google Ads' : 'TikTok Ads'}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                                    <p className="text-sm text-slate-400">{event.eventType}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setFormData(p => ({ ...p, events: p.events?.filter((_, i) => i !== idx) }))}
                                                            className="text-slate-500 hover:text-red-400 p-2 hover:bg-slate-800 rounded-full transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => {
                                                setIsAddingEvent(true)
                                                setEventStep('PLATFORM')
                                                setTempEvent({})
                                            }}
                                            className="w-full py-4 border-2 border-dashed border-emerald-900/50 hover:border-emerald-500/50 bg-emerald-950/10 hover:bg-emerald-950/30 text-emerald-500 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Plus className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-sm">Adicionar Novo Evento</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 3 && (
                                <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300 mb-3 block">Logo da Página</label>
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                                                    <ImageIcon className="h-6 w-6" />
                                                </div>
                                                <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-md transition-colors border border-slate-700">
                                                    Carregar Imagem
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-slate-300 mb-2 block">Texto de Carregamento</label>
                                            <input
                                                value={formData.appearance?.loadingText}
                                                onChange={(e) => setFormData(p => ({ ...p, appearance: { ...p.appearance!, loadingText: e.target.value } }))}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-slate-300 mb-3 block">Cor do Spinner</label>
                                            <div className="flex gap-3">
                                                {(['emerald', 'blue', 'rose', 'amber'] as const).map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setFormData(p => ({ ...p, appearance: { ...p.appearance!, spinnerColor: color } }))}
                                                        className={`h-8 w-8 rounded-full border-2 transition-transform ${formData.appearance?.spinnerColor === color
                                                            ? 'border-white scale-110 ring-2 ring-offset-2 ring-offset-slate-900 ring-slate-500'
                                                            : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                                            }`}
                                                        style={{ backgroundColor: `var(--color-${color}-500)` }}
                                                    >
                                                        <div className={`w-full h-full rounded-full ${getColorClass(color)}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pointer-events-none opacity-80 scale-90 origin-top">
                                        <div className="text-center text-xs text-slate-500 mb-2 uppercase tracking-widest font-bold">Preview Visual</div>
                                        <div className="bg-white rounded-xl h-48 w-full max-w-sm mx-auto shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                                            <Loader2 className={`h-8 w-8 animate-spin mb-3 ${getTextDataColor(formData.appearance?.spinnerColor)}`} />
                                            <p className="text-slate-600 text-xs font-medium">{formData.appearance?.loadingText}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
                            {wizardStep > 1 ? (
                                <button
                                    onClick={() => setWizardStep(p => p - 1)}
                                    className="text-slate-400 hover:text-white text-sm font-medium px-4 py-2 flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Voltar
                                </button>
                            ) : <div />}

                            <button
                                onClick={() => {
                                    if (wizardStep < 3) setWizardStep(p => p + 1)
                                    else handleSaveRedirect()
                                }}
                                disabled={wizardStep === 1 && (!formData.name || !formData.slug)}
                                className={`px-8 py-3 rounded-lg font-bold text-sm shadow-xl transition-all flex items-center gap-2 ${(wizardStep === 1 && (!formData.name || !formData.slug))
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {wizardStep === 3 ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Finalizar e Criar Link
                                    </>
                                ) : (
                                    <>
                                        Próximo: {wizardStep === 1 ? 'Rastreamento' : 'Aparência'}
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {isAddingEvent && (
                        <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <button
                                    onClick={() => setIsAddingEvent(false)}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                {eventStep === 'PLATFORM' && (
                                    <div className="max-w-md w-full space-y-8">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-white">Selecione a Plataforma</h3>
                                            <p className="text-slate-400">Onde o evento será disparado?</p>
                                        </div>
                                        <div className="grid gap-3">
                                            {(['META', 'GOOGLE', 'TIKTOK'] as const).map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => setTempEvent({ ...tempEvent, platform: p })}
                                                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all text-left group ${tempEvent.platform === p
                                                        ? 'bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500'
                                                        : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80'
                                                        }`}
                                                >
                                                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-950 border border-slate-800 group-hover:border-emerald-500/50 transition-colors">
                                                        {getPlatformIcon(p)}
                                                    </div>
                                                    <span className={`font-semibold ${tempEvent.platform === p ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                        {p === 'META' ? 'Meta Ads (Facebook)' : p === 'GOOGLE' ? 'Google Ads' : 'TikTok Ads'}
                                                    </span>
                                                    {tempEvent.platform === p && <Check className="h-5 w-5 text-emerald-500 ml-auto" />}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setEventStep('TYPE')}
                                            disabled={!tempEvent.platform}
                                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${!tempEvent.platform ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-900/20'
                                                }`}
                                        >
                                            Prosseguir
                                        </button>
                                    </div>
                                )}

                                {eventStep === 'TYPE' && (
                                    <div className="max-w-md w-full space-y-8 animate-in slide-in-from-right-8 fade-in">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-white">Qual Evento?</h3>
                                            <p className="text-slate-400">Escolha o tipo de conversão para {tempEvent.platform === 'META' ? 'Meta Ads' : 'Google Ads'}.</p>
                                        </div>
                                        <div className="grid gap-3">
                                            {(['PageView', 'Lead', 'Purchase', 'InitiateCheckout', 'Contact'] as const).map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setTempEvent({ ...tempEvent, eventType: type })}
                                                    className={`p-4 rounded-xl border flex items-center justify-between transition-all text-left ${tempEvent.eventType === type
                                                        ? 'bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500'
                                                        : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50'
                                                        }`}
                                                >
                                                    <span className={`font-medium ${tempEvent.eventType === type ? 'text-emerald-400' : 'text-slate-200'}`}>{type}</span>
                                                    {tempEvent.eventType === type && <Check className="h-5 w-5 text-emerald-500" />}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setEventStep('PLATFORM')}
                                                className="px-6 py-4 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
                                            >
                                                Voltar
                                            </button>
                                            <button
                                                onClick={handleAddEvent}
                                                disabled={!tempEvent.eventType}
                                                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${!tempEvent.eventType
                                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-900/20'
                                                    }`}
                                            >
                                                Adicionar Evento
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </AppLayout>
    )
}

function getColorClass(color: string) {
    if (color === 'emerald') return 'bg-emerald-500'
    if (color === 'blue') return 'bg-blue-500'
    if (color === 'rose') return 'bg-rose-500'
    if (color === 'amber') return 'bg-amber-500'
    return 'bg-slate-500'
}

function getTextDataColor(color?: string) {
    if (color === 'emerald') return 'text-emerald-500'
    if (color === 'blue') return 'text-blue-500'
    if (color === 'rose') return 'text-rose-500'
    if (color === 'amber') return 'text-amber-500'
    return 'text-slate-500'
}

function ChevronDownIcon() {
    return (
        <svg className="h-4 w-4 fill-current text-slate-500" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
        </svg>
    )
}
