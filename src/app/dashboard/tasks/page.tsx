"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare, CircleCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listMatters, listThreads, Matter, ThreadSummary } from "@/lib/workspace-api";

type GeneratedTask = {
  id: string;
  title: string;
  detail: string;
};

export default function TasksPage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [doneIds, setDoneIds] = useState<string[]>([]);

  useEffect(() => {
    void Promise.all([listMatters(), listThreads()]).then(([m, t]) => {
      setMatters(m);
      setThreads(t);
    });
  }, []);

  const tasks = useMemo<GeneratedTask[]>(() => {
    const generated: GeneratedTask[] = [];

    matters.slice(0, 5).forEach((matter) => {
      generated.push({
        id: `matter-${matter.id}`,
        title: `Review matter: ${matter.title}`,
        detail: "Confirm filing strategy and next client update.",
      });
    });

    threads.slice(0, 5).forEach((thread) => {
      generated.push({
        id: `thread-${thread.id}`,
        title: `Follow up thread #${thread.id}`,
        detail: "Capture key answer in a formal memo or generated document.",
      });
    });

    return generated;
  }, [matters, threads]);

  return (
    <div className="p-4 lg:p-6 space-y-4 overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tasks
          </CardTitle>
          <CardDescription>Action checklist generated from your live matters and threads.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks.map((task) => {
            const done = doneIds.includes(task.id);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() =>
                  setDoneIds((prev) =>
                    prev.includes(task.id) ? prev.filter((id) => id !== task.id) : [...prev, task.id]
                  )
                }
                className={`w-full text-left rounded-md border p-3 transition-colors ${
                  done ? "bg-emerald-50 border-emerald-200" : "bg-white"
                }`}
              >
                <p className="font-medium text-sm flex items-center gap-2">
                  <CircleCheck className={`h-4 w-4 ${done ? "text-emerald-600" : "text-slate-400"}`} />
                  {task.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">{task.detail}</p>
              </button>
            );
          })}

          {tasks.length === 0 ? <p className="text-sm text-slate-500">Create a matter or conversation to generate tasks.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
