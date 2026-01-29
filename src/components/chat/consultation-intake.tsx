"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, Scale, Globe, BookOpen, BrainCircuit } from "lucide-react";

interface ConsultationIntakeProps {
    onStart: (jurisdiction: string, category: string, deepAnalysis: boolean) => void;
}

export function ConsultationIntake({ onStart }: ConsultationIntakeProps) {
    const [jurisdiction, setJurisdiction] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [deepAnalysis, setDeepAnalysis] = useState<boolean>(false);

    // Hardcoded for V1 stability, eventually fetch from API /v1/resources/jurisdictions
    const jurisdictions = [
        { value: "FED", label: "United States (Federal)" },
        { value: "CA", label: "California (State)" },
        { value: "AU", label: "Australia (Federal)" },
        { value: "AU-NSW", label: "Australia - New South Wales" },
        { value: "AU-VIC", label: "Australia - Victoria" },
        { value: "AU-QLD", label: "Australia - Queensland" },
        { value: "NZ", label: "New Zealand (National)" },
    ];

    const categories = [
        { value: "general", label: "General Legal Inquiry" },
        { value: "corporate", label: "Corporate & Business Law" },
        { value: "privacy", label: "Privacy & Data Protection" },
        { value: "immigration", label: "Immigration & Visas" },
        { value: "digital", label: "Digital, Tech & Cyber Law" },
        { value: "property", label: "Real Estate & Property" },
    ];

    return (
        <Card className="w-full max-w-md mx-auto shadow-2xl border-primary/20 bg-card/95 backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <CardHeader className="text-center space-y-2 pb-2">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                    <Scale className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-primary">New Consultation</CardTitle>
                <CardDescription className="text-muted-foreground">
                    Configure your session for tailored legal analysis.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="jurisdiction" className="text-sm font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary/70" />
                        Select Jurisdiction
                    </Label>
                    <Select onValueChange={setJurisdiction} value={jurisdiction}>
                        <SelectTrigger id="jurisdiction" className="w-full">
                            <SelectValue placeholder="Choose relevant laws..." />
                        </SelectTrigger>
                        <SelectContent>
                            {jurisdictions.map((j) => (
                                <SelectItem key={j.value} value={j.value}>
                                    {j.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary/70" />
                        Nature of Inquiry
                    </Label>
                    <Select onValueChange={setCategory} value={category}>
                        <SelectTrigger id="category" className="w-full">
                            <SelectValue placeholder="What is this regarding?" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg bg-muted/20">
                    <Label htmlFor="deep-mode" className="flex flex-col space-y-1 cursor-pointer">
                        <span className="font-medium flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4 text-primary" />
                            Deep Reasoning Mode
                        </span>
                        <span className="font-normal text-xs text-muted-foreground">
                            Enable Chain-of-Thought analysis & step-by-step logic.
                        </span>
                    </Label>
                    <Switch id="deep-mode" checked={deepAnalysis} onCheckedChange={setDeepAnalysis} />
                </div>

                <div className="bg-muted/50 p-3 rounded-md flex items-start gap-3 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                    <p>
                        Your query will be matched against authoritative statutes, case law, and regulations specific to your selection.
                    </p>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full font-semibold shadow-lg hover:shadow-primary/20 transition-all"
                    size="lg"
                    disabled={!jurisdiction || !category}
                    onClick={() => onStart(jurisdiction, category, deepAnalysis)}
                >
                    Start Legal Session
                </Button>
            </CardFooter>
        </Card>
    );
}
