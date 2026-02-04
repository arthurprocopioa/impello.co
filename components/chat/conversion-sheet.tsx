"use client"

import { useState } from "react"
import { Contact } from "@/types"
import { CheckCircle2, DollarSign, Loader2 } from "lucide-react"

interface ConversionSheetProps {
    isOpen: boolean
    onClose: () => void
    contact: Contact
    onSaleConfirmed?: (amount: number, platform: string) => void
}

export function ConversionSheet({ isOpen, onClose, contact, onSaleConfirmed }: ConversionSheetProps) {
    const [amount, setAmount] = useState("")
    const [status, setStatus] = useState("PAID")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE")

    if (!isOpen) return null

    const handleSave = async () => {
        setLoading(true)
        // Simulate API latency
        await new Promise(r => setTimeout(r, 800))

        try {
            const numericAmount = parseFloat(amount.replace("R$", "").replace(",", ".").trim())

            if (isNaN(numericAmount) || numericAmount <= 0) {
                // Simple validation
                console.error("Valor inválido")
                setLoading(false)
                return
            }

            // SUCCESS!
            setResult("SUCCESS")

            // Notify Parent
            if (onSaleConfirmed) {
                onSaleConfirmed(numericAmount, contact.last_source)
            }

            setTimeout(() => {
                onClose()
                setResult("IDLE")
                setAmount("")
            }, 1000)

        } catch (e) {
            console.error(e)
            setResult("ERROR")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative z-50 h-full w-full max-w-md border-l border-slate-800 bg-slate-900 p-6 shadow-2xl transition-transform duration-300 animate-in slide-in-from-right">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        Registrar Venda
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300">Esc</button>
                </div>

                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                        <p className="text-sm text-slate-400">Cliente</p>
                        <p className="font-medium text-slate-200">{contact.name}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-slate-500">Atribuição:</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium border ${contact.last_source === 'META' ? 'bg-blue-950/30 text-blue-400 border-blue-900' :
                                contact.last_source === 'GOOGLE' ? 'bg-yellow-950/30 text-yellow-400 border-yellow-900' :
                                    'bg-slate-800 text-slate-400 border-slate-700'
                                }`}>
                                {contact.last_source}
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1 block">Valor da Venda (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-md py-2.5 pl-10 pr-4 text-slate-100 focus:border-emerald-500 focus:outline-none"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1 block">Status do Pagamento</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-md py-2.5 px-4 text-slate-100 focus:border-emerald-500 focus:outline-none appearance-none"
                            >
                                <option value="PAID">Pago (Confirmado)</option>
                                <option value="PENDING">Pendente</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={loading || !amount}
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> :
                                result === "SUCCESS" ? <CheckCircle2 className="h-5 w-5" /> :
                                    "Confirmar Venda"}
                        </button>
                        {result === "SUCCESS" && (
                            <p className="text-center text-emerald-500 text-sm mt-2">Venda registrada e eventos simulados!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
