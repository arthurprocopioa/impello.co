"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Package, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)

    // Auth State
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            if (isSignUp) {
                // SIGN UP
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error

                alert("Conta criada com sucesso! Verifique seu email ou faça login.")
                setIsSignUp(false) // Go back to login
            } else {
                // SIGN IN
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error

                router.push("/dashboard")
            }
        } catch (err: any) {
            console.error("Auth error:", err)
            setError(err.message || "Erro ao autenticar. Verifique seus dados.")
        } finally {
            setLoading(false)
        }
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
                    <p className="text-slate-400 text-sm mt-2">
                        {isSignUp ? "Crie sua conta gratuitamente" : "Faça login para gerenciar sua loja"}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleAuth} className="space-y-4 bg-slate-900/50 p-8 rounded-xl border border-slate-800 backdrop-blur-sm shadow-2xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                            placeholder="voce@empresa.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Senha</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-11 rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <>
                                {isSignUp ? "Criar Conta" : "Entrar na Plataforma"}
                                {!loading && <ArrowRight className="h-4 w-4" />}
                            </>
                        )}
                    </button>

                    <div className="pt-4 text-center border-t border-slate-800/50 mt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp)
                                setError("")
                            }}
                            className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                            {isSignUp
                                ? "Já tem uma conta? Faça Login"
                                : "Não tem conta? Crie Agora"}
                        </button>
                    </div>

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
