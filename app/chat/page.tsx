"use client"

import { useState, useRef, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { ConversionSheet } from "@/components/chat/conversion-sheet"
import { ChatProfile } from "@/components/chat/chat-profile"
import { Contact, Message } from "@/types"
import { Search, Send, MoreVertical, MessageSquare, CheckCircle2, User, TrendingUp, Filter, Clock, Zap, PlusCircle, Check, ArrowLeft, PanelRightOpen, PanelRightClose, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"

// --- QUICK REPLIES DATA ---
const QUICK_REPLIES = [
    { label: "/pix", text: "Nossa chave PIX é: 12.345.678/0001-99 (CNPJ). O comprovante pode ser enviado por aqui mesmo!", desc: "Chave PIX" },
    { label: "/loc", text: "Estamos localizados na Rua das Flores, 123 - Centro. Esperamos sua visita!", desc: "Endereço" },
    { label: "/tarde", text: "Boa tarde! Como posso ajudar você hoje?", desc: "Saudação Tarde" },
    { label: "/intro", text: "Olá! Meu nome é João, sou consultor da Impello. Vi que você se interessou pelos nossos produtos.", desc: "Apresentação" },
]

export default function ChatPage() {
    // State - Core
    const [contacts, setContacts] = useState<any[]>([])
    const [selectedContact, setSelectedContact] = useState<any | null>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [msgInput, setMsgInput] = useState("")
    const [isConversionSheetOpen, setIsConversionSheetOpen] = useState(false)
    const [sessionSalesTotal, setSessionSalesTotal] = useState(0)
    const [loadingContacts, setLoadingContacts] = useState(true)

    // State - Productivity Features
    const [filterStatus, setFilterStatus] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL")
    const [showQuickReplies, setShowQuickReplies] = useState(false)
    const [showFollowUp, setShowFollowUp] = useState(false)

    // State - Profile Sidebar
    const [isProfileOpen, setIsProfileOpen] = useState(true)

    const scrollRef = useRef<HTMLDivElement>(null)

    // DB FETCH CONTACTS
    const fetchContacts = async () => {
        setLoadingContacts(true)
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('last_interaction_at', { ascending: false })

        if (data) setContacts(data)
        setLoadingContacts(false)
    }

    useEffect(() => {
        fetchContacts()

        // Subscribe to new contacts (Optional for real-time)
        const channel = supabase
            .channel('public:contacts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, (payload) => {
                fetchContacts()
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    // DB FETCH MESSAGES
    useEffect(() => {
        if (selectedContact?.id) {
            const fetchMessages = async () => {
                const { data } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('contact_id', selectedContact.id)
                    .order('created_at', { ascending: true })
                if (data) setMessages(data)
            }
            fetchMessages()

            // Realtime logic for messages
            const channel = supabase
                .channel(`chat:${selectedContact.id}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `contact_id=eq.${selectedContact.id}` }, (payload) => {
                    setMessages((prev) => [...prev, payload.new])
                })
                .subscribe()

            return () => { supabase.removeChannel(channel) }
        } else {
            setMessages([])
        }
    }, [selectedContact])

    // Filter Logic
    const filteredContacts = contacts.filter(c => {
        if (filterStatus === "ALL") return true
        if (filterStatus === "OPEN") return c.funnel_status === "OPEN" || c.funnel_status === "PENDING"
        if (filterStatus === "RESOLVED") return c.funnel_status === "RESOLVED"
        return true
    })

    // Scroll Helper
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Input Handler for Slash Commands
    const handleInputChange = (val: string) => {
        setMsgInput(val)
        if (val === "/") {
            setShowQuickReplies(true)
        } else if (val === "") {
            setShowQuickReplies(false)
        }
    }

    const handleSendMessage = async () => {
        if (!msgInput.trim() || !selectedContact) return

        // Auto-Reopen Logic
        if (selectedContact.funnel_status === 'RESOLVED') {
            await supabase.from('contacts').update({ funnel_status: 'OPEN' }).eq('id', selectedContact.id)
            setSelectedContact({ ...selectedContact, funnel_status: 'OPEN' })
            fetchContacts()
        }

        const newMsg = {
            contact_id: selectedContact.id,
            direction: 'OUT',
            content: msgInput,
            status: 'SENT',
            type: 'TEXT'
        }

        // Optimistic UI could go here, but with Supabase RT it's fast enough usually
        setMsgInput("")
        setShowQuickReplies(false)

        await supabase.from('messages').insert(newMsg)

        // Update contact timestamp
        await supabase.from('contacts').update({ last_interaction_at: new Date().toISOString() }).eq('id', selectedContact.id)
    }

    const selectQuickReply = (text: string) => {
        setMsgInput(text)
        setShowQuickReplies(false)
    }

    const handleSaleConfirmed = async (amount: number, platform: string) => {
        setSessionSalesTotal(prev => prev + amount)
        const sysMsg = {
            contact_id: selectedContact.id,
            direction: 'OUT',
            content: `✅ Venda de R$ ${amount.toFixed(2)} registrada com sucesso. Atribuída ao ${platform}.`,
            status: 'READ',
            type: 'SYSTEM'
        }
        await supabase.from('messages').insert(sysMsg)
    }

    const toggleResolve = async () => {
        if (!selectedContact) return

        const isResolved = selectedContact.funnel_status === 'RESOLVED'
        const newStatus = isResolved ? 'OPEN' : 'RESOLVED'

        // Update UI immediately (Optimistic)
        setSelectedContact({ ...selectedContact, funnel_status: newStatus })
        setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, funnel_status: newStatus } : c))

        // DB Update
        await supabase.from('contacts').update({ funnel_status: newStatus }).eq('id', selectedContact.id)

        const sysMsg = {
            contact_id: selectedContact.id,
            direction: 'OUT',
            content: isResolved ? `↩️ Conversa reaberta manualmente.` : `🏁 Atendimento marcado como Resolvido.`,
            status: 'READ',
            type: 'SYSTEM'
        }
        await supabase.from('messages').insert(sysMsg)
    }

    const scheduleFollowUp = async (timeLabel: string) => {
        setShowFollowUp(false)
        if (!selectedContact) return
        const sysMsg = {
            contact_id: selectedContact.id,
            direction: 'OUT',
            content: `⏰ Follow-up agendado para: ${timeLabel}`,
            status: 'READ',
            type: 'SYSTEM'
        }
        await supabase.from('messages').insert(sysMsg)
    }

    const handleCreateTestContact = async () => {
        const fakeName = prompt("Nome do Contato:") || "Visitante Teste"
        const fakePhone = prompt("Telefone:") || "5511999999999"

        const { error } = await supabase.from('contacts').insert({
            name: fakeName,
            phone: fakePhone,
            last_source: 'DIRECT',
            funnel_status: 'OPEN'
        })

        if (error) alert("Erro ao criar contato")
        else fetchContacts()
    }

    return (
        <AppLayout>
            <div className="flex h-full w-full bg-slate-950 overflow-hidden">

                {/* LEFT COLUMN: CONTACT LIST */}
                <div className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex-col bg-slate-900/50 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-slate-100">Mensagens</h2>
                            <button onClick={handleCreateTestContact} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md transition-colors" title="Criar Contato Teste">
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        {/* FILTERS */}
                        <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800">
                            <button
                                onClick={() => setFilterStatus("ALL")}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${filterStatus === 'ALL' ? 'bg-slate-800 text-slate-100 shadow' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilterStatus("OPEN")}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${filterStatus === 'OPEN' ? 'bg-slate-800 text-slate-100 shadow' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Pendentes
                            </button>
                            <button
                                onClick={() => setFilterStatus("RESOLVED")}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${filterStatus === 'RESOLVED' ? 'bg-slate-800 text-slate-100 shadow' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Resolvidos
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                                placeholder="Buscar contato..."
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingContacts ? (
                            <div className="p-8 text-center text-slate-500 text-xs">Carregando contatos...</div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                                <span>Nenhum contato encontrado.</span>
                                <button onClick={handleCreateTestContact} className="text-emerald-500 text-xs hover:underline">Criar um teste</button>
                            </div>
                        ) : filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className={`p-4 border-b border-slate-800/50 cursor-pointer transition-colors ${selectedContact?.id === contact.id ? "bg-slate-800 border-l-2 border-l-emerald-500" : "hover:bg-slate-800"}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-medium truncate ${contact.funnel_status === 'RESOLVED' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{contact.name || contact.phone}</span>
                                    <span className="text-xs text-slate-500">{contact.last_interaction_at ? new Date(contact.last_interaction_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-slate-400 truncate w-4/5">
                                        {contact.phone}
                                    </p>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${contact.last_source === 'META' ? 'border-blue-900 text-blue-400 bg-blue-950/30' :
                                        contact.last_source === 'GOOGLE' ? 'border-yellow-900 text-yellow-400 bg-yellow-950/30' :
                                            'border-slate-700 text-slate-400'
                                        }`}>
                                        {contact.last_source}
                                    </span>
                                    {contact.funnel_status === 'RESOLVED' && (
                                        <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-900 text-emerald-500 bg-emerald-950/30 flex items-center gap-1">
                                            <Check className="h-3 w-3" /> Resolvido
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: CHAT WINDOW */}
                {selectedContact ? (
                    <div className="flex-1 flex w-full relative">
                        {/* MAIN CHAT AREA */}
                        <div className="flex-1 flex flex-col bg-slate-950 min-w-0">

                            {/* Header */}
                            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-900/30 z-10 relative">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <button
                                        className="md:hidden text-slate-400"
                                        onClick={() => setSelectedContact(null)}
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {selectedContact.profile_pic ? (
                                            <img src={selectedContact.profile_pic} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-medium text-slate-100 flex items-center gap-2 truncate">
                                            {selectedContact.name || selectedContact.phone}
                                            {selectedContact.funnel_status === 'RESOLVED' && <span className="text-xs text-slate-500 border border-slate-700 rounded px-1.5 py-0.5 hidden sm:inline-block">Resolvido</span>}
                                        </h3>
                                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Online
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 sm:gap-2">

                                    {/* Follow Up */}
                                    <div className="relative hidden sm:block">
                                        <button
                                            onClick={() => setShowFollowUp((prev) => !prev)}
                                            className={`h-9 w-9 flex items-center justify-center rounded-md transition-colors ${showFollowUp ? 'bg-amber-900/40 text-amber-500' : 'text-slate-400 hover:text-amber-400 hover:bg-amber-950/20'}`}
                                        >
                                            <Clock className="h-5 w-5" />
                                        </button>
                                        {showFollowUp && (
                                            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 p-1 flex flex-col gap-1">
                                                <p className="text-[10px] text-slate-500 px-2 py-1 uppercase font-bold tracking-wider">Agendar Retorno</p>
                                                {["Em 30 minutos", "Amanhã de manhã", "Em 3 dias", "Próxima Semana"].map(label => (
                                                    <button
                                                        key={label}
                                                        onClick={() => scheduleFollowUp(label)}
                                                        className="text-left px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-800 rounded hover:text-white transition-colors"
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

                                    <button
                                        onClick={() => setIsConversionSheetOpen(true)}
                                        className="h-9 px-3 sm:px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20 whitespace-nowrap"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Venda</span>
                                    </button>

                                    {/* TOGGLE PROFILE BUTTON */}
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className={`h-9 w-9 flex items-center justify-center rounded-md transition-colors ${isProfileOpen ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-100'}`}
                                    >
                                        {isProfileOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* NEW: RESOLUTION BAR (A Tarja Visualmente Melhorada) */}
                            <button
                                onClick={toggleResolve}
                                className={`w-full py-3 flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 border-b shadow-sm relative overflow-hidden group ${selectedContact.funnel_status === 'RESOLVED'
                                    ? 'bg-slate-900/80 border-slate-800 text-slate-500 hover:bg-slate-900 hover:text-slate-400'
                                    : 'bg-gradient-to-r from-emerald-950/30 via-emerald-900/20 to-emerald-950/30 border-emerald-900/50 text-emerald-500 hover:text-emerald-400 hover:border-emerald-500/30'
                                    }`}
                            >
                                {/* Hover Effect Layer */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${selectedContact.funnel_status === 'RESOLVED' ? 'bg-slate-800/10' : 'bg-emerald-500/5'
                                    }`} />

                                {selectedContact.funnel_status === 'RESOLVED' ? (
                                    <>
                                        <div className="h-2 w-2 rounded-full bg-slate-600" />
                                        <span>Conversa Arquivada</span>
                                        <span className="opacity-50 font-normal normal-case tracking-normal ml-2 text-[10px] border border-slate-800 rounded px-1.5 py-0.5">Clique para reabrir</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span>Marcar como Resolvido</span>
                                        <CheckCircle2 className="h-4 w-4 ml-1 opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                    </>
                                )}
                            </button>

                            {/* MESSAGES & INPUT (Existing) */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/50" ref={scrollRef}>
                                {messages.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center text-slate-600 space-y-2">
                                        <MessageSquare className="h-12 w-12 opacity-20" />
                                        <p>Inicie a conversa agora mesmo.</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        if (msg.type === 'SYSTEM') {
                                            const isAlert = msg.content.includes("Follow-up")
                                            const isResolve = msg.content.includes("Resolvido") || msg.content.includes("reaberta")
                                            return (
                                                <div key={msg.id} className="flex justify-center my-4">
                                                    <div className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-sm animate-in zoom-in-95 duration-200 border ${isAlert ? 'bg-amber-950/30 text-amber-500 border-amber-900/50' :
                                                        isResolve ? 'bg-slate-800 text-slate-400 border-slate-700' :
                                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        }`}>
                                                        {isAlert ? <Clock className="h-3 w-3" /> : isResolve ? <Check className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            )
                                        }
                                        const isOut = msg.direction === 'OUT';
                                        return (
                                            <div key={msg.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-2 text-sm shadow-sm ${isOut
                                                    ? 'bg-emerald-900/40 border border-emerald-900 text-emerald-100 rounded-tl-lg rounded-bl-lg rounded-br-lg'
                                                    : 'bg-slate-800 text-slate-200 rounded-tr-lg rounded-br-lg rounded-bl-lg'
                                                    }`}>
                                                    <p>{msg.content}</p>
                                                    <span className={`text-[10px] mt-1 block ${isOut ? 'text-emerald-500/70' : 'text-slate-500'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isOut && <span className="ml-1 uppercase">✓</span>}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {/* Input Area + Quick Replies */}
                            <div className="relative">
                                {showQuickReplies && (
                                    <div className="absolute bottom-full left-4 mb-2 w-72 sm:w-96 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 z-50">
                                        <div className="p-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-500 font-medium">
                                            RESPOSTAS RÁPIDAS
                                        </div>
                                        <div className="max-h-64 overflow-y-auto p-1">
                                            {QUICK_REPLIES.map((qa) => (
                                                <button
                                                    key={qa.label}
                                                    onClick={() => selectQuickReply(qa.text)}
                                                    className="w-full text-left p-2 hover:bg-slate-800 rounded flex flex-col gap-0.5 group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-emerald-500 font-mono text-xs bg-emerald-950/30 px-1.5 rounded">{qa.label}</span>
                                                        <span className="text-slate-500 text-[10px] uppercase">{qa.desc}</span>
                                                    </div>
                                                    <p className="text-slate-300 text-sm truncate group-hover:text-white transition-colors">{qa.text}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 border-t border-slate-800 bg-slate-900/30 relative z-40">
                                    <form
                                        className="flex gap-2"
                                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setShowQuickReplies((prev) => !prev)}
                                            className={`p-3 rounded-lg border transition-colors hidden sm:flex ${showQuickReplies ? 'bg-yellow-500 text-slate-900 border-yellow-500' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-yellow-400 hover:border-yellow-500/50'}`}
                                            title="Respostas Rápidas (/)"
                                        >
                                            <Zap className="h-5 w-5" />
                                        </button>

                                        <input
                                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                                            placeholder="Digite uma mensagem..."
                                            value={msgInput}
                                            onChange={(e) => handleInputChange(e.target.value)}
                                        />
                                        <button type="submit" disabled={!msgInput.trim()} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg p-3 transition-colors">
                                            <Send className="h-5 w-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* THE PULSE COMPONENT */}
                            <ConversionSheet
                                isOpen={isConversionSheetOpen}
                                onClose={() => setIsConversionSheetOpen(false)}
                                contact={selectedContact}
                                onSaleConfirmed={handleSaleConfirmed}
                            />
                        </div>

                        {/* 3RD COLUMN: PROFILE SIDEBAR */}
                        {isProfileOpen && (
                            <ChatProfile contact={selectedContact} onClose={() => setIsProfileOpen(false)} />
                        )}

                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-4 text-slate-600">
                        <MessageSquare className="h-16 w-16 opacity-20" />
                        <p>Selecione um contato para monitorar</p>
                        <button onClick={handleCreateTestContact} className="text-emerald-600 hover:text-emerald-500 font-medium">
                            + Criar Contato Teste
                        </button>
                    </div>
                )}

            </div>
        </AppLayout>
    )
}
