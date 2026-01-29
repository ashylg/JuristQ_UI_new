import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Cpu,
    Zap,
    BrainCircuit,
    Scale,
    BookOpen,
    Gavel
} from "lucide-react";

export function IntelligencePanel() {
    return (
        <div className="h-full flex flex-col p-4 space-y-6">
            <div className="space-y-1">
                <h3 className="font-semibold text-sm text-slate-900">Intelligence</h3>
                <p className="text-xs text-slate-500">Configure AI reasoning models.</p>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
                <Label className="text-xs font-medium text-slate-500 uppercase">Model Tier</Label>
                <RadioGroup defaultValue="advanced" className="gap-2">
                    <div className="flex items-center justify-between space-x-2 border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="standard" id="m-std" />
                            <Label htmlFor="m-std" className="cursor-pointer font-medium flex items-center gap-2">
                                <Zap className="w-4 h-4 text-green-500" /> Standard
                            </Label>
                        </div>
                        <span className="text-xs text-slate-400">Fast</span>
                    </div>

                    <div className="flex items-center justify-between space-x-2 border-2 border-primary/20 bg-primary/5 rounded-lg p-3 cursor-pointer">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="advanced" id="m-adv" />
                            <Label htmlFor="m-adv" className="cursor-pointer font-medium flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-primary" /> Advanced
                            </Label>
                        </div>
                        <span className="text-xs text-primary font-medium">Balanced</span>
                    </div>

                    <div className="flex items-center justify-between space-x-2 border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="expert" id="m-exp" />
                            <Label htmlFor="m-exp" className="cursor-pointer font-medium flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 text-purple-600" /> Expert
                            </Label>
                        </div>
                        <span className="text-xs text-purple-600 font-medium">Deep</span>
                    </div>
                </RadioGroup>
            </div>

            <Separator />

            {/* Reasoning Controls */}
            <div className="space-y-4">
                <Label className="text-xs font-medium text-slate-500 uppercase">Reasoning Depth</Label>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Show "Thinking"</Label>
                        <p className="text-xs text-slate-500">Reveal internal monologue</p>
                    </div>
                    <Switch checked={true} />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Step-by-Step</Label>
                        <p className="text-xs text-slate-500">Break down analysis</p>
                    </div>
                    <Switch />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Cite Authorities</Label>
                        <p className="text-xs text-slate-500">Force Case/Statute citations</p>
                    </div>
                    <Switch checked={true} />
                </div>
            </div>

            <Separator />

            {/* Output Style */}
            <div className="space-y-3">
                <Label className="text-xs font-medium text-slate-500 uppercase">Output Tone</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="h-9 justify-start gap-2">
                        <BookOpen className="w-3.5 h-3.5" /> Plain
                    </Button>
                    <Button variant="default" size="sm" className="h-9 justify-start gap-2 bg-slate-900">
                        <Gavel className="w-3.5 h-3.5" /> Academic
                    </Button>
                </div>
            </div>

        </div>
    )
}
