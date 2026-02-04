"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { BarChart3, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, MoreHorizontal, ShoppingBag } from "lucide-react"

// --- COMPONENTS INLINE (Mocking Charts/Badges) ---

const KPICard = ({ title, value, sub, trend }: any) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">{title}</h3>
            {trend === 'up' ? <div className="text-emerald-500 bg-emerald-500/10 p-1.5 rounded-lg"><TrendingUp className="h-4 w-4" /></div> :
                trend === 'down' ? <div className="text-red-500 bg-red-500/10 p-1.5 rounded-lg"><TrendingUp className="h-4 w-4 rotate-180" /></div> :
                    <div className="text-slate-500 bg-slate-800 p-1.5 rounded-lg"><DollarSign className="h-4 w-4" /></div>}
        </div>
        <div className="space-y-1">
            <p className="text-2xl font-bold text-slate-100">{value}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
                {trend === 'up' && <span className="text-emerald-500 flex items-center"><ArrowUpRight className="h-3 w-3" /> +12%</span>}
                {trend === 'down' && <span className="text-red-500 flex items-center"><ArrowDownRight className="h-3 w-3" /> -2%</span>}
                em relação a ontem
            </p>
        </div>
    </div>
)

const SimpleBarChart = () => (
    <div className="h-48 flex items-end justify-between gap-4 py-4">
        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                    className="w-full bg-slate-800 rounded-t-sm group-hover:bg-emerald-500/80 transition-colors relative"
                    style={{ height: `${h}%` }}
                >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-10">
                        R$ {h * 10},00
                    </div>
                </div>
                <span className="text-xs text-slate-500">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}</span>
            </div>
        ))}
    </div>
)

export default function DashboardPage() {
    return (
        <AppLayout>
            <div className="p-6 md:p-8 space-y-8 overflow-y-auto h-full bg-slate-950">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
                        <p className="text-slate-400 text-sm">Visão geral da sua operação hoje, 04 de Fev.</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-sm text-slate-200 transition-colors hidden md:block">
                        Baixar Relatório
                    </button>
                </div>

                {/* KPI GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPICard title="Vendas Hoje" value="R$ 1.250,00" trend="up" />
                    <KPICard title="Leads Conversados" value="34" trend="up" />
                    <KPICard title="Ticket Médio" value="R$ 180,00" trend="down" />
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* CHART CARD */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-slate-200">Visão Semanal</h3>
                            <select className="bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded px-2 py-1 outline-none">
                                <option>Últimos 7 dias</option>
                            </select>
                        </div>
                        <SimpleBarChart />
                    </div>

                    {/* RECENT SALES */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-0 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-200">Últimas Vendas</h3>
                            <button className="text-emerald-500 text-xs font-medium hover:underline">Ver todas</button>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-900/50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Cliente</th>
                                        <th className="px-6 py-3">Valor</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {[
                                        { name: "Joana Meta", val: "R$ 150,00", time: "2 min atrás", status: "Pago" },
                                        { name: "Carlos Google", val: "R$ 320,00", time: "15 min atrás", status: "Pago" },
                                        { name: "Pedro Silva", val: "R$ 89,90", time: "1 hora atrás", status: "Pendente" },
                                        { name: "Ana Paula", val: "R$ 210,00", time: "3 horas atrás", status: "Pago" },
                                        { name: "Lucas M.", val: "R$ 55,00", time: "Ontem", status: "Cancelado" },
                                    ].map((sale, i) => (
                                        <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">
                                                {sale.name}
                                                <span className="block text-xs text-slate-500 font-normal">{sale.time}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{sale.val}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${sale.status === 'Pago' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900' :
                                                        sale.status === 'Pendente' ? 'bg-yellow-950/50 text-yellow-400 border border-yellow-900' :
                                                            'bg-red-950/50 text-red-400 border border-red-900'
                                                    }`}>
                                                    {sale.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-500 hover:text-slate-300 cursor-pointer">
                                                <MoreHorizontal className="h-4 w-4 ml-auto" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    )
}
