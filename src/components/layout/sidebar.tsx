import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    Folder,
    FileText,
    Plus,
    Settings,
    MessageSquare,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className }: SidebarProps) {
    return (
        <div className={cn("pb-12 h-full flex flex-col", className)}>
            <div className="space-y-4 py-4">
                {/* Header / New Thread */}
                <div className="px-3 py-2">
                    <Button variant="default" className="w-full justify-start gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        New Thread
                    </Button>
                </div>

                {/* Projects Section */}
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 uppercase">
                        Projects
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start gap-2 font-normal">
                            <Folder className="h-4 w-4 text-blue-500" />
                            Contract Law – Uni
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2 font-normal">
                            <Folder className="h-4 w-4 text-emerald-500" />
                            Tenancy Dispute – NZ
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2 font-normal">
                            <Folder className="h-4 w-4 text-purple-500" />
                            Research – US Privacy
                        </Button>
                    </div>
                </div>

                {/* Threads Section */}
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 uppercase">
                        Recent Threads
                    </h2>
                    <ScrollArea className="h-[300px] px-1">
                        <div className="space-y-1">
                            <Button variant="secondary" className="w-full justify-start gap-2 font-normal bg-slate-100 text-slate-900">
                                <MessageSquare className="h-4 w-4 text-slate-500" />
                                Explain negligence
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-2 font-normal text-slate-600">
                                <MessageSquare className="h-4 w-4 text-slate-400" />
                                IRAC practice question
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-2 font-normal text-slate-600">
                                <MessageSquare className="h-4 w-4 text-slate-400" />
                                Summarise this case
                            </Button>
                        </div>
                    </ScrollArea>
                </div>

                {/* Files Section */}
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500 uppercase">
                        Files
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start gap-2 font-normal text-slate-600">
                            <FileText className="h-4 w-4 text-slate-400" />
                            Lease_Agreement_v1.pdf
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2 font-normal text-slate-600">
                            <FileText className="h-4 w-4 text-slate-400" />
                            Case_Brief_Smith.docx
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto px-3 py-4 border-t border-slate-100">
                <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-2 font-normal text-slate-600">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Button>
                    <SignOutButton />
                </div>
            </div>
        </div>
    )
}
