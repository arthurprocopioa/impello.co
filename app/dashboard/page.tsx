"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { BarChart3, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, MoreHorizontal, ShoppingBag, GitGraph, MousePointer2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

const KPICard = ({ title, value, sub, icon: Icon, color = 'emerald' }: any) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">{title}</h3>
            <div className={`text-${color}-500 bg-${color}-500/10 p-1.5 rounded-lg`}>
                <Icon className="h-4 w-4" />
            </div>
        </div>
        <div className="space-y-1">
            <p className="text-2xl font-bold text-slate-100">{value}</p>
            <p className="text-xs text-slate-500">{sub}</p>
        </div>
    </div>
)

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalRedirects: 0,
        activeRedirects: 0,
        totalClicks: 0
    })
    const [topRedirects, setTopRedirects] = useState<any[]>([])

    useEffect(() => {
        async function loadStats() {
            setLoading(true)

            // Fetch Redirects Stats
            const { data: redirects, error } = await supabase
                .from('redirects')
                .select('status, clicks, name, slug')
                .order('clicks', { ascending: false })

            if (redirects) {
                const total = redirects.length
                const active = redirects.filter(r => r.status === 'ACTIVE').length
                const clicks = redirects.reduce((acc, curr) => acc + (curr.clicks || 0), 0)

                setStats({
                    totalRedirects: total,
                    activeRedirects: active,
                    totalClicks: clicks
                })

                // Top 5
                setTopRedirects(redirects.slice(0, 5))
            }

            setLoading(false)
        }
        loadStats()
    }, [])

    return (
        <AppLayout>
            <div className="p-6 md:p-8 space-y-8 overflow-y-auto h-full bg-slate-950">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Dashboard de Performance</h1>
                        <p className="text-slate-400 text-sm">Visão geral do tráfego dos seus links.</p>
                    </div>
                </div>

                {/* KPI GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPICard
                        title="Total de Clicks"
                        value={loading ? "..." : stats.totalClicks}
                        sub="Cliques acumulados em todos os links"
                        icon={MousePointer2}
                        color="emerald"
                    />
                    <KPICard
                        title="Redirecionadores Ativos"
                        value={loading ? "..." : stats.activeRedirects}
                        sub={`${stats.totalRedirects} criados no total`}
                        icon={GitGraph}
                        color="blue"
                    />
                    <KPICard
                        title="Taxa de Conversão"
                        value="--"
                        sub="Configuração de pixels necessária"
                        icon={TrendingUp}
                        color="amber"
                    />
                </div>

                {/* TOP REDIRECTS TABLE */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-0 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-800">
                        <h3 className="font-semibold text-slate-200">Top Redirecionadores</h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-900/50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Nome</th>
                                    <th className="px-6 py-3">Link (Slug)</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Cliques</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-6 text-center text-slate-500">Carregando dados...</td></tr>
                                ) : topRedirects.length === 0 ? (
                                    <tr><td colSpan={4} className="p-6 text-center text-slate-500">Nenhum dado encontrado.</td></tr>
                                ) : (
                                    topRedirects.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">{r.name}</td>
                                            <td className="px-6 py-4 text-emerald-400 font-mono text-xs">{r.slug}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${r.status === 'ACTIVE'
                                                        ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
                                                        : 'bg-slate-800 text-slate-400 border-slate-700'
                                                    }`}>
                                                    {r.status === 'ACTIVE' ? 'Ativo' : 'Arquivado'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-300 font-bold">{r.clicks}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AppLayout>
    )
}
