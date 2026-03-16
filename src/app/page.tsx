import Link from "next/link";
import { PLANS } from "@/lib/stripe";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">⚙️ ScopeForge</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#pricing" className="text-slate-400 hover:text-white text-sm transition-colors">Pricing</Link>
            <Link href="/auth/login" className="text-slate-400 hover:text-white text-sm transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 text-blue-300 text-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            AI-powered · No templates · Ready in 2 minutes
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Client brief in.<br />Winning proposal out.
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Stop spending 3 hours on proposals. Paste a client brief and get a complete project scope, timeline, cost estimate, and branded proposal document — in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors w-full sm:w-auto"
            >
              Generate Your First Proposal Free →
            </Link>
            <p className="text-slate-500 text-sm">No credit card required · 3 free proposals</p>
          </div>
        </div>
      </section>

      {/* Demo placeholder */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-2">
            <div className="rounded-xl bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">⚙️</div>
                <p className="text-slate-500">Demo video coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything a proposal needs. Nothing it doesn&apos;t.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Built for digital agencies that win projects on clarity, not on who spent the most time writing.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🧠",
                title: "AI Scope Generation",
                description: "Claude AI breaks your brief into a detailed work breakdown structure — phases, deliverables, and effort hours — automatically.",
              },
              {
                icon: "💰",
                title: "Smart Cost Estimation",
                description: "Realistic cost estimates based on scope complexity. Set your hourly rate and the math handles itself.",
              },
              {
                icon: "📄",
                title: "Branded PDF Export",
                description: "Export a client-ready PDF proposal with your logo, colors, and terms. Looks like it took a day. Took two minutes.",
              },
              {
                icon: "📅",
                title: "Timeline Builder",
                description: "AI generates a phased project timeline with milestones. Edit any phase or let it stand as-is.",
              },
              {
                icon: "✏️",
                title: "Editable Everything",
                description: "Every section, scope item, and cost figure is fully editable before you export or send.",
              },
              {
                icon: "📊",
                title: "Proposal Analytics",
                description: "Track which proposals were opened, viewed, and converted. Know where deals stand.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-24 border-t border-slate-800 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The math is simple</h2>
            <p className="text-slate-400">A $149/mo subscription that saves your team 30+ hours a month.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { stat: "3+ hours", label: "Average time writing a proposal manually" },
              { stat: "< 2 min", label: "Average time with ScopeForge" },
              { stat: "$8,000+", label: "Monthly value saved for a 10-proposal agency at $150/hr" },
            ].map((s) => (
              <div key={s.label} className="p-8 rounded-xl border border-slate-700">
                <div className="text-4xl font-bold text-blue-400 mb-2">{s.stat}</div>
                <div className="text-slate-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, honest pricing</h2>
            <p className="text-slate-400 text-lg">Start free. Pay when you&apos;re winning.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => (
              <div
                key={key}
                className={`rounded-xl border p-6 flex flex-col ${
                  key === "growth"
                    ? "border-blue-500 bg-blue-950/30 relative"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                {key === "growth" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                    {plan.price > 0 && <span className="text-base font-normal text-slate-400">/mo</span>}
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    {plan.proposalsPerMonth === Infinity
                      ? "Unlimited proposals"
                      : `${plan.proposalsPerMonth} proposals${key === "free" ? " (lifetime)" : "/mo"}`}
                  </p>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`text-center py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                    key === "growth"
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                >
                  {key === "free" ? "Get Started Free" : `Start ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24 border-t border-slate-800 bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Common questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "How accurate are the AI-generated estimates?",
                a: "The AI is trained on thousands of digital agency projects and produces estimates that are typically within 15-20% of what an experienced PM would produce manually. You can always edit any estimate before sending.",
              },
              {
                q: "Can I customize the proposal template?",
                a: "Yes. You can set your company name, logo, brand color, and default terms. Every section of the generated proposal is editable before you export.",
              },
              {
                q: "What kind of projects does it support?",
                a: "Web development, mobile apps, design projects, marketing campaigns, SaaS builds, e-commerce — anything a digital agency typically pitches. The AI adapts to the brief.",
              },
              {
                q: "Do clients need to sign up to view proposals?",
                a: "No. Clients get a shareable link to view the proposal as a clean, branded page. No account required.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. No contracts, no cancellation fees. Cancel from your billing dashboard anytime.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 border-t border-slate-800 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to win more projects?</h2>
          <p className="text-slate-400 mb-8">Your first 3 proposals are free. No credit card needed.</p>
          <Link
            href="/auth/signup"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors"
          >
            Start for Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <span>⚙️ ScopeForge by Peravine · Built by AI</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <a href="mailto:rook@peravine.tech" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
