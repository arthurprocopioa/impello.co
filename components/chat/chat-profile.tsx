"use client"

import { Contact } from "@/types"
import { User, Calendar, CreditCard, Tag, Save, X, Facebook, Globe, Smartphone, StickyNote } from "lucide-react"
import { useState } from "react"

interface ChatProfileProps {
    contact: Contact
    onClose?: () => void
}

export function ChatProfile({ contact, onClose }: ChatProfileProps) {
    const [note, setNote] = useState("Cliente prefere contato após as 14h.\nGosta de produtos premium.")
    const [isSaving, setIsSaving] = useState(false)

    const handleSaveNote = () => {
        setIsSaving(true)
        setTimeout(() => setIsSaving(false), 1000)
    }

    // Mock Tags based on source
    const tags = ["Lead Quente"]
    if (contact.last_source === 'META') tags.push("Meta Ads", "Instagram")
    if (contact.last_source === 'GOOGLE') tags.push("Google Search")
    if (contact.funnel_status === 'RESOLVED') tags.push("Cliente Recorrente")

    return (
        <div className="h-full bg-slate-950 border-l border-slate-800 flex flex-col w-80 shadow-xl absolute right-0 top-0 z-20 md:relative md:shadow-none animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/30">
                <span className="font-semibold text-slate-100">Detalhes do Contato</span>
                <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-100">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* 1. Profile Header */}
                <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 rounded-full bg-slate-800 mb-4 flex items-center justify-center overflow-hidden border-2 border-slate-700">
                        {contact.profile_pic ? (
                            <img src={contact.profile_pic} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-8 w-8 text-slate-400" />
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">{contact.name || "Visitante"}</h3>
                    <p className="text-slate-400 text-sm mb-3">{contact.phone}</p>

                    <div className="flex flex-wrap justify-center gap-2">
                        {tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-700 bg-slate-900 text-slate-300 flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 2. LTV / Purchase History */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <CreditCard className="h-3 w-3" /> Histórico de Compras (LTV)
                    </h4>

                    {/* LTV Card */}
                    <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-4 text-center">
                        <p className="text-xs text-emerald-400 mb-1">Total Gasto na Loja</p>
                        <p className="text-2xl font-bold text-emerald-400">R$ 450,00</p>
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        <div className="bg-slate-900/50 border border-slate-800 rounded p-3 flex justify-between items-center text-sm">
                            <div>
                                <p className="text-slate-200">Kit Premium</p>
                                <p className="text-xs text-slate-500">02 Fev • Cartão</p>
                            </div>
                            <span className="text-emerald-500 text-xs font-bold">R$ 200</span>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded p-3 flex justify-between items-center text-sm">
                            <div>
                                <p className="text-slate-200">Consultoria VIP</p>
                                <p className="text-xs text-slate-500">15 Jan • PIX</p>
                            </div>
                            <span className="text-emerald-500 text-xs font-bold">R$ 250</span>
                        </div>
                    </div>
                </div>

                {/* 3. Notes */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <StickyNote className="h-3 w-3" /> Anotações Internas
                    </h4>
                    <div className="group relative">
                        <textarea
                            className="w-full h-24 bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 resize-none focus:outline-none focus:border-emerald-500 transition-colors"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Adicione uma nota sobre este cliente..."
                        />
                        <button
                            onClick={handleSaveNote}
                            disabled={isSaving}
                            className={`absolute bottom-2 right-2 text-xs font-medium px-2 py-1 rounded transition-colors ${isSaving ? 'text-emerald-500' : 'text-slate-500 hover:text-emerald-500 bg-slate-800 hover:bg-slate-700'}`}
                        >
                            {isSaving ? "Salvo!" : "Salvar"}
                        </button>
                    </div>
                </div>

                {/* 4. Technical Data */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-2"><Globe className="h-3 w-3" /> Origem</span>
                        <span className="text-slate-300 font-medium">{contact.last_source}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-2"><Calendar className="h-3 w-3" /> Cliente Desde</span>
                        <span className="text-slate-300 font-medium">Jan 2026</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-2"><Smartphone className="h-3 w-3" /> Dispositivo</span>
                        <span className="text-slate-300 font-medium">iOS 17.2</span>
                    </div>
                </div>

            </div>
        </div>
    )
}
