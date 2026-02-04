"use client"

import { useState, useRef, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { ConversionSheet } from "@/components/chat/conversion-sheet"
import { Contact, Message } from "@/types"
import { Search, Send, MoreVertical, MessageSquare, CheckCircle2, User, TrendingUp } from "lucide-react"

// --- MOCK DATA FOR UI DEVELOPMENT ---
const MOCK_CONTACTS: Contact[] = [
    {
        id: "1", tenant_id: "t1", phone: "5511988881111", name: "Joana Meta",
        last_source: "META", latest_fbclid: "fb.1.123", funnel_status: "OPEN",
        last_click_at: new Date().toISOString()
    },
    {
        id: "2", tenant_id: "t1", phone: "5511988882222", name: "Carlos Google",
        last_source: "GOOGLE", latest_gclid: "Cj0K...", funnel_status: "PENDING",
        last_click_at: new Date(Date.now() - 86400000).toISOString()
    },
]

const MOCK_MESSAGES: Message[] = [
    { id: "m1", contact_id: "1", direction: "IN", content: "Olá, vi o anúncio no Insta!", status: "READ", created_at: new Date(Date.now() - 3600000).toISOString(), type: 'TEXT' },
    { id: "m2", contact_id: "1", direction: "OUT", content: "Olá Joana! Tudo bem?", status: "READ", created_at: new Date(Date.now() - 3500000).toISOString(), type: 'TEXT' },
    { id: "m3", contact_id: "1", direction: "IN", content: "Quanto custa?", status: "READ", created_at: new Date(Date.now() - 3400000).toISOString(), type: 'TEXT' },
]

export default function ChatPage() {
    // State
    const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS)
    const [selectedContact, setSelectedContact] = useState<Contact | null>(MOCK_CONTACTS[0])
    const [messages, setMessages] = useState<Message[]>([])
    const [msgInput, setMsgInput] = useState("")
    const [isConversionSheetOpen, setIsConversionSheetOpen] = useState(false)

    // Session Stats
    const [sessionSalesTotal, setSessionSalesTotal] = useState(0)

    const scrollRef = useRef<HTMLDivElement>(null)

    // Mock Fetch Messages
    useEffect(() => {
        if (selectedContact?.id === "1") {
            setMessages(MOCK_MESSAGES)
        } else {
            setMessages([])
        }
    }, [selectedContact])

    // Scroll Helper
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSendMessage = () => {
        if (!msgInput.trim()) return
        const newMsg: Message = {
            id: Math.random().toString(),
            contact_id: selectedContact!.id,
            direction: 'OUT',
            content: msgInput,
            status: 'SENT',
            created_at: new Date().toISOString(),
            type: 'TEXT'
        }
        setMessages(prev => [...prev, newMsg])
        setMsgInput("")
    }

    const handleSaleConfirmed = (amount: number, platform: string) => {
        // Update Stats
        setSessionSalesTotal(prev => prev + amount)

        // Inject System Message
        const sysMsg: Message = {
            id: Math.random().toString(),
            contact_id: selectedContact!.id,
            direction: 'OUT', // Doesn't matter for system but keeps TS happy
            content: `✅ Venda de R$ ${amount.toFixed(2)} registrada com sucesso. Atribuída ao ${platform}.`,
            status: 'READ',
            created_at: new Date().toISOString(),
            type: 'SYSTEM'
        }
        setMessages(prev => [...prev, sysMsg])
    }

    return (
        <AppLayout>
            <div className="flex h-full w-full bg-slate-950">

                {/* LEFT COLUMN: CONTACT LIST */}
                <div className="w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-900/50">
                    <div className="p-4 border-b border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-100">Mensagens</h2>
                            {sessionSalesTotal > 0 && (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-900/50">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>Hoje: R$ {sessionSalesTotal.toFixed(2)}</span>
                                </div>
                            )}
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
                        {contacts.map((contact) => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className={`p-4 border-b border-slate-800/50 cursor-pointer transition-colors ${selectedContact?.id === contact.id ? "bg-slate-800 border-l-2 border-l-emerald-500" : "hover:bg-slate-800"}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-slate-200 truncate">{contact.name || contact.phone}</span>
                                    <span className="text-xs text-slate-500">{contact.last_click_at ? new Date(contact.last_click_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
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
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: CHAT WINDOW */}
                {selectedContact ? (
                    <div className="hidden md:flex flex-1 flex-col bg-slate-950 relative">
                        {/* Header */}
                        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/30">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                                    {selectedContact.profile_pic ? (
                                        <img src={selectedContact.profile_pic} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-5 w-5 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-100">{selectedContact.name || selectedContact.phone}</h3>
                                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Online
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsConversionSheetOpen(true)}
                                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Registrar Venda
                                </button>
                                <button className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-100">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/50" ref={scrollRef}>
                            {messages.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-slate-600 space-y-2">
                                    <MessageSquare className="h-12 w-12 opacity-20" />
                                    <p>Este é o início da sua conversa simulada.</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    if (msg.type === 'SYSTEM') {
                                        return (
                                            <div key={msg.id} className="flex justify-center my-4">
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-sm animate-in zoom-in-95 duration-200">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {msg.content}
                                                </div>
                                            </div>
                                        )
                                    }

                                    const isOut = msg.direction === 'OUT';
                                    return (
                                        <div key={msg.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] px-4 py-2 text-sm shadow-sm ${isOut
                                                ? 'bg-emerald-900/40 border border-emerald-900 text-emerald-100 rounded-tl-lg rounded-bl-lg rounded-br-lg'
                                                : 'bg-slate-800 text-slate-200 rounded-tr-lg rounded-br-lg rounded-bl-lg'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <span className={`text-[10px] mt-1 block ${isOut ? 'text-emerald-500/70' : 'text-slate-500'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isOut && <span className="ml-1 uppercase">✓ {msg.status.toLowerCase()}</span>}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-slate-800 bg-slate-900/30">
                            <form
                                className="flex gap-2"
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                            >
                                <input
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                                    placeholder="Digite uma mensagem..."
                                    value={msgInput}
                                    onChange={(e) => setMsgInput(e.target.value)}
                                />
                                <button type="submit" disabled={!msgInput.trim()} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg p-3 transition-colors">
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>
                        </div>

                        {/* THE PULSE COMPONENT */}
                        {selectedContact && (
                            <ConversionSheet
                                isOpen={isConversionSheetOpen}
                                onClose={() => setIsConversionSheetOpen(false)}
                                contact={selectedContact}
                                onSaleConfirmed={handleSaleConfirmed}
                            />
                        )}
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-4 text-slate-600">
                        <MessageSquare className="h-16 w-16 opacity-20" />
                        <p>Selecione um contato para monitorar</p>
                    </div>
                )}

            </div>
        </AppLayout>
    )
}
