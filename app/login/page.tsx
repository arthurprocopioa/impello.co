"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Package } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulação de delay de rede
        await new Promise(r => setTimeout(r, 1500))

        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">

            <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">

                {/* Header */}
                <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20">
                        <Package className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Impello CRM</h1>
                    <p className="text-slate-400 text-sm mt-2">Faça login para gerenciar sua loja</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4 bg-slate-900/50 p-8 rounded-xl border border-slate-800 backdrop-blur-sm shadow-2xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email</label>
                        <input
                            type="email"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                            placeholder="admin@impello.com"
                            defaultValue="demo@impello.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Senha</label>
                        <input
                            type="password"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                            placeholder="••••••••"
                            defaultValue="123456"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-11 rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Entrar na Plataforma"}
                    </button>

                </form>

                <div className="text-center">
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" />
                        Ambiente Seguro & Criptografado
                    </p>
                </div>

            </div>
        </div>
    )
}
