"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, MessageSquare, Settings, Users, Menu, Package } from "lucide-react"

import { cn } from "@/lib/utils"
// Assuming we would install shadcn sheet/button, but for MVP speed I will build a simple tailored version
// or simulate the structure if I can't run the installer.
// For this output I will implement a responsive layout manually using Tailwind to guarantee it works without 20 files.

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden w-16 flex-col border-r border-slate-800 bg-slate-900 md:flex lg:w-64 transition-all duration-300">
                <div className="flex h-14 items-center border-b border-slate-800 px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Package className="h-6 w-6 text-emerald-500" />
                        <span className="hidden lg:block text-emerald-500">Impello CRM</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <NavContent />
                </div>
                <div className="mt-auto p-4 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-emerald-900 border border-emerald-500 flex items-center justify-center text-xs font-bold">
                            JS
                        </div>
                        <div className="hidden lg:block text-xs">
                            <p className="font-medium text-slate-200">João Silva</p>
                            <p className="text-slate-500">Barbearia Vip</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MOBILE SIDEBAR (Drawer/Sheet style) */}
            <div className={cn(
                "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm transition-all md:hidden",
                isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )} onClick={() => setIsSidebarOpen(false)}>
                <div className={cn(
                    "fixed inset-y-0 left-0 z-50 h-full w-3/4 max-w-xs bg-slate-900 border-r border-slate-800 shadow-xl transition-transform duration-300 ease-in-out px-4 py-4",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Package className="h-6 w-6 text-emerald-500" />
                            <span className="text-emerald-500">Impello</span>
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400">
                            X
                        </button>
                    </div>
                    <NavContent onClick={() => setIsSidebarOpen(false)} />
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex flex-col flex-1 h-full overflow-hidden">
                {/* MOBILE HEADER */}
                <header className="flex h-14 items-center gap-4 border-b border-slate-800 bg-slate-950 px-4 md:hidden">
                    <button
                        className="text-slate-400 hover:text-white"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-semibold text-emerald-500">Impello</span>
                </header>

                {/* WORKSPACE */}
                <main className="flex-1 overflow-hidden relative">
                    {children}
                </main>
            </div>
        </div>
    )
}

function NavContent({ onClick }: { onClick?: () => void }) {
    const pathname = usePathname()

    const links = [
        { href: "/chat", label: "Central de Chat", icon: MessageSquare },
        { href: "/contacts", label: "Contatos", icon: Users },
        { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/settings", label: "Configurações", icon: Settings },
    ]

    return (
        <nav className="grid gap-1 px-2 text-sm font-medium">
            {links.map((link) => {
                const isActive = pathname.startsWith(link.href)
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClick}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-slate-100",
                            isActive
                                ? "bg-slate-800 text-emerald-400"
                                : "text-slate-400 hover:bg-slate-800"
                        )}
                    >
                        <link.icon className="h-5 w-5" />
                        <span className="lg:inline">{link.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
