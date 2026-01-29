import { Sidebar } from "@/components/layout/sidebar";
import { IntelligencePanel } from "@/components/layout/intelligence-panel";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* 
        3-Panel Grid:
        1. Sidebar (Fixed width 260px)
        2. Main Content (Flexible)
        3. Intelligence Panel (Fixed width 300px)
      */}

            {/* LEFT PANEL: Sidebar */}
            <aside className="w-[260px] border-r border-border bg-slate-50/50 hidden md:flex flex-col">
                <div className="p-4 border-b border-border font-bold text-primary flex items-center gap-2 h-14">
                    Juristiq <span className="font-normal text-slate-400">Workspace</span>
                </div>
                <Sidebar className="flex-1" />
            </aside>

            {/* CENTER PANEL: Main Workspace */}
            <main className="flex-1 flex flex-col min-w-0 bg-background relative z-0 overflow-hidden">
                {children}
            </main>

            {/* RIGHT PANEL: Intelligence Controls */}
            <aside className="w-[300px] border-l border-border bg-slate-50/50 hidden lg:flex flex-col transition-all duration-300">
                <div className="p-4 border-b border-border font-medium text-sm h-14 flex items-center">Control Center</div>
                <IntelligencePanel />
            </aside>
        </div>
    )
}
