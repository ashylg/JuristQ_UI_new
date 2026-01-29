import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, MessageSquare, Scale, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-slate-900">Juristiq</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button>Go to Workspace <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Legal thinking, <br />
              <span className="text-primary">amplified.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
              A workspace for legal professionals that combines deep reasoning AI, secure document drafting, and multi-jurisdictional intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="px-8 text-lg h-12">Start Consultation</Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 text-lg h-12 bg-white/50">View Demo</Button>
            </div>
            <div className="pt-8 flex items-center gap-8 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Bank-grade Security</div>
              <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> NZ/AU Jurisdiction</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-blue-400 opacity-20 blur-2xl"></div>
            <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-slate-200 bg-white">
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
                <div className="flex gap-1.5 opacity-50">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="ml-4 text-xs font-medium text-slate-400">Juristiq AI Workspace</div>
              </div>
              {/* Mock UI Preview */}
              <div className="p-8 space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="bg-slate-100 rounded-lg p-4 rounded-tl-none text-sm text-slate-700 leading-relaxed">
                      Based on the <strong>Privacy Act 2020 (NZ)</strong>, the collection of such data requires explicit consent under IPP 3 unless an exception applies...
                    </div>
                    <div className="text-xs text-slate-400 pl-1">Just now • Expert Mode</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid (Lite) */}
      <section id="features" className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Deep Reasoning", desc: "Goes beyond simple answers. Juristiq thinks through legal problems step-by-step." },
              { title: "Document Drafting", desc: "Generate court-ready memos, letters, and advice in DOCX or PDF format." },
              { title: "Secure & Private", desc: "Your client data stays isolated. Zero training on your inputs by default." }
            ].map((f, i) => (
              <Card key={i} className="border-slate-200 shadow-none hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-600 leading-relaxed">
                  {f.desc}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
