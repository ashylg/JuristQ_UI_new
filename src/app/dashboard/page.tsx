"use client";

import { ChatWindow } from "@/components/chat/chat-window";

export default function DashboardPage() {
    return (
        <div className="flex-1 flex flex-col h-full relative">
            {/* 
          In a full implementation, we might have tabs here: 
          [ Chat ] [ Draft ] [ Analysis ] 
          For now, we render the ChatWindow which handles its own view.
       */}
            <ChatWindow />
        </div>
    );
}
