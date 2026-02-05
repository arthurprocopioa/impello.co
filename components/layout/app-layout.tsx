"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, MessageSquare, Settings, Users, Menu, Package, ChevronLeft, ChevronRight, HelpCircle, Cable, GitGraph } from "lucide-react"
import { supabase } from "@/lib/supabase"

import { cn } from "@/lib/utils"
// Assuming we would install shadcn sheet/button, but for MVP speed I will build a simple tailored version
// or simulate the structure if I can't run the installer.
// For this output I will implement a responsive layout manually using Tailwind to guarantee it works without 20 files.

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [userEmail, setUserEmail] = React.useState<string | null>(null)
    const router = useRouter() // Make sure useRouter is imported if not already, or use window.location

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserEmail(user.email || "Usuário")
            } else {
                // Optional: Redirect to login if strictly protected, 
                // but middleware usually handles this.
            }
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* DESKTOP SIDEBAR */}
            <aside className={cn(
                "hidden flex-col border-r border-slate-800 bg-slate-900 md:flex transition-all duration-300 relative",
                isCollapsed ? "w-[70px]" : "w-64"
            )}>

                {/* Toggle Button (Desktop Only) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-9 z-50 h-6 w-6 rounded-full border border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-100 flex items-center justify-center shadow-lg transition-colors hover:bg-slate-800"
                >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </button>

                <div className={cn("flex h-14 items-center border-b border-slate-800 transition-all overflow-hidden", isCollapsed ? "justify-center px-0" : "px-4 lg:px-6")}>
                    <Link href="/" className="flex items-center gap-2 font-semibold whitespace-nowrap">
                        <Package className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                        <span className={cn("text-emerald-500 transition-all duration-300", isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100")}>Impello CRM</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2 overflow-x-hidden">
                    <NavContent collapsed={isCollapsed} handleLogout={handleLogout} />
                </div>
                <div className="mt-auto p-4 border-t border-slate-800 overflow-hidden">
                    <div className={cn("flex items-center gap-2 transition-all", isCollapsed && "justify-center")}>
                        <div className="h-8 w-8 rounded-full bg-emerald-900 border border-emerald-500 flex items-center justify-center text-xs font-bold flex-shrink-0 text-emerald-100">
                            {userEmail ? userEmail.substring(0, 2).toUpperCase() : "US"}
                        </div>
                        <div className={cn("text-xs transition-all duration-300 whitespace-nowrap", isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100")}>
                            <p className="font-medium text-slate-200 truncate max-w-[140px]" title={userEmail || ""}>{userEmail || "Carregando..."}</p>
                            <p className="text-slate-500">Admin</p>
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
                    <NavContent handleLogout={handleLogout} />
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

function NavContent({ onClick, collapsed, handleLogout }: { onClick?: () => void, collapsed?: boolean, handleLogout?: () => void }) {
    const pathname = usePathname()

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/chat", label: "Central de Chat", icon: MessageSquare },
        { href: "/redirects", label: "Redirecionadores", icon: GitGraph },
        { href: "/integrations", label: "Integrações", icon: Cable },
    ]

    return (
        <nav className={cn("flex flex-col h-full text-sm font-medium transition-all", collapsed ? "px-2" : "px-3 py-4")}>
            <div className="flex flex-col gap-1.5">
                {links.map((link) => {
                    // Match startsWith for sub-routes (like /chat/123) or exact match
                    const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClick}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2.5 transition-all duration-200 group relative",
                                isActive
                                    ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700/50"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                                collapsed && "justify-center px-0 py-3"
                            )}
                            title={collapsed ? link.label : undefined}
                        >
                            <link.icon className={cn("h-4 w-4 transition-colors flex-shrink-0", isActive ? "text-emerald-500" : "text-slate-500 group-hover:text-slate-300")} />
                            <span className={cn("transition-all duration-300 whitespace-nowrap overflow-hidden", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>{link.label}</span>
                        </Link>
                    )
                })}
            </div>

            <div className={cn("mt-auto border-t border-slate-800/50 space-y-1 transition-all overflow-hidden", collapsed ? "pt-2" : "pt-4")}>
                <button className={cn("w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all text-left", collapsed && "justify-center px-0")}>
                    <div className="h-4 w-4 flex items-center justify-center rounded border border-slate-700 bg-slate-900 text-[10px] font-bold text-slate-500 flex-shrink-0">?</div>
                    <span className={cn("whitespace-nowrap overflow-hidden transition-all duration-300", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>Ajuda & Suporte</span>
                </button>
                <button
                    onClick={handleLogout}
                    className={cn("w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-red-400/80 hover:bg-red-950/20 hover:text-red-400 transition-all text-left", collapsed && "justify-center px-0")}
                >
                    <Users className="h-4 w-4 flex-shrink-0" /> {/* LogOut icon placeholder */}
                    <span className={cn("whitespace-nowrap overflow-hidden transition-all duration-300", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>Sair</span>
                </button>
            </div>
        </nav>
    )
}
