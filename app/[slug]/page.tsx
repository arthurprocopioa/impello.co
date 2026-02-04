"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Lock, ShieldCheck, ShoppingBag } from "lucide-react"

export default function RedirectPage({ params }: { params: { slug: string } }) {
    const searchParams = useSearchParams()
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Simulação de "Processamento Seguro"
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + 2 // Progress bar fills in approx 2.5s locally roughly
            })
        }, 30)

        // Capture params for "Mock Logging"
        const fbclid = searchParams.get("fbclid")

        // Redirect Timer
        const timeOut = setTimeout(() => {
            // Mock Redirect destination
            window.location.href = "https://wa.me/5511999999999?text=Vi+o+anúncio+e+gostaria+de+saber+mais"
        }, 2500)

        return () => {
            clearInterval(interval)
            clearTimeout(timeOut)
        }
    }, [searchParams])

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none" />

            <div className="max-w-md w-full flex flex-col items-center z-10 space-y-8">

                {/* Brand / Logo Placeholder */}
                <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-700">
                    <div className="h-20 w-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-900/50">
                        <ShoppingBag className="text-white h-10 w-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Loja Demo</h1>
                </div>

                {/* Status Card */}
                <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl animate-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="flex flex-col items-center text-center space-y-4">

                        <div className="relative">
                            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                            <div className="absolute inset-0 blur-lg bg-emerald-500/20 rounded-full" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-slate-200 font-medium text-lg">Iniciando atendimento seguro...</p>
                            <p className="text-slate-500 text-sm">Validando disponibilidade do consultor</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-100 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-6 text-slate-500 text-xs animate-in fade-in duration-1000 delay-300">
                    <div className="flex items-center gap-1.5">
                        <Lock className="h-3 w-3" />
                        <span>Ambiente Seguro</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Dados Criptografados</span>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-slate-600 text-[10px] uppercase tracking-widest opacity-50">
                Powered by Impello
            </div>
        </div>
    )
}
