"use client";

import { ChatWindow } from "@/components/chat/chat-window";

export default function DashboardPage() {
    return (
        <div className="flex-1 flex flex-col h-full relative p-4 lg:p-6">
            <ChatWindow />
        </div>
    );
}
