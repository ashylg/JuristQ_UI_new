import { Sidebar } from "@/components/layout/sidebar";
import { IntelligencePanel } from "@/components/layout/intelligence-panel";
import { SessionConfigProvider } from "@/lib/session-config";
import { backendAuthFetch } from "@/lib/server-auth";
import { redirect } from "next/navigation";

async function requireAuth() {
    const response = await backendAuthFetch("/v1/auth/me", { method: "GET" });
    if (!response.ok) {
        redirect("/sign-in");
    }
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireAuth();

    return (
        <SessionConfigProvider>
            <div className="flex h-screen w-full overflow-hidden bg-background">
                <aside className="w-[260px] border-r border-border bg-slate-50/50 hidden md:flex flex-col">
                    <div className="p-4 border-b border-border font-bold text-primary flex items-center gap-2 h-14">
                        Juristiq <span className="font-normal text-slate-400">Workspace</span>
                    </div>
                    <Sidebar className="flex-1" />
                </aside>

                <main className="flex-1 flex flex-col min-w-0 bg-background relative z-0 overflow-hidden">
                    {children}
                </main>

                <aside className="w-[300px] border-l border-border bg-slate-50/50 hidden lg:flex flex-col transition-all duration-300">
                    <div className="p-4 border-b border-border font-medium text-sm h-14 flex items-center">Management</div>
                    <IntelligencePanel />
                </aside>
            </div>
        </SessionConfigProvider>
    );
}
