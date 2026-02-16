"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type ModelTier = "standard" | "advanced" | "expert";
export type OutputTone = "plain" | "academic";
export type ReasoningEffort = "auto" | "low" | "medium" | "high";

type SessionConfig = {
  modelTier: ModelTier;
  setModelTier: (v: ModelTier) => void;
  showThinking: boolean;
  setShowThinking: (v: boolean) => void;
  stepByStep: boolean;
  setStepByStep: (v: boolean) => void;
  citeAuthorities: boolean;
  setCiteAuthorities: (v: boolean) => void;
  outputTone: OutputTone;
  setOutputTone: (v: OutputTone) => void;
  reasoningEffort: ReasoningEffort;
  setReasoningEffort: (v: ReasoningEffort) => void;
};

const SessionConfigContext = createContext<SessionConfig | null>(null);

export function SessionConfigProvider({ children }: { children: React.ReactNode }) {
  const [modelTier, setModelTier] = useState<ModelTier>("advanced");
  const [showThinking, setShowThinking] = useState(true);
  const [stepByStep, setStepByStep] = useState(true);
  const [citeAuthorities, setCiteAuthorities] = useState(true);
  const [outputTone, setOutputTone] = useState<OutputTone>("academic");
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>("auto");

  const value = useMemo(
    () => ({
      modelTier,
      setModelTier,
      showThinking,
      setShowThinking,
      stepByStep,
      setStepByStep,
      citeAuthorities,
      setCiteAuthorities,
      outputTone,
      setOutputTone,
      reasoningEffort,
      setReasoningEffort,
    }),
    [modelTier, showThinking, stepByStep, citeAuthorities, outputTone, reasoningEffort]
  );

  return <SessionConfigContext.Provider value={value}>{children}</SessionConfigContext.Provider>;
}

export function useSessionConfig() {
  const ctx = useContext(SessionConfigContext);
  if (!ctx) throw new Error("useSessionConfig must be used within SessionConfigProvider");
  return ctx;
}
