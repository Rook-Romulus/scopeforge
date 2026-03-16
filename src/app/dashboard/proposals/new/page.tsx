"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProposalPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || `Proposal for ${clientName}`, clientName, clientEmail, briefText: brief }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create proposal");
      }

      const proposal = await res.json();

      // Trigger generation
      const genRes = await fetch(`/api/proposals/${proposal.id}/generate`, { method: "POST" });
      if (!genRes.ok || !genRes.body) throw new Error("Generation failed to start");

      // Stream progress
      const reader = genRes.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("event: complete")) {
            router.push(`/dashboard/proposals/${proposal.id}`);
            return;
          }
          if (line.startsWith("event: error")) {
            throw new Error("Generation failed");
          }
        }
      }

      router.push(`/dashboard/proposals/${proposal.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">New Proposal</h1>
          <p className="text-slate-400 mt-1">Paste a client brief and let AI generate the full proposal.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Client Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="client@acme.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Proposal Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="E-commerce Platform Redesign"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Client Brief <span className="text-red-400">*</span>
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              required
              rows={12}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Paste the client brief here. The more detail you provide, the more accurate the scope and estimates will be.

Example: 'We need a new e-commerce website for our outdoor gear brand. We currently have ~5,000 SKUs on an aging Magento 1 install. We want to move to Shopify Plus, migrate all product data, redesign the UX from scratch, and integrate with our ERP system (SAP Business One). We sell B2C and B2B. The B2B side needs custom pricing by account. We want to launch before the holiday season — ideally by October 1st...'"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !brief.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating proposal…
              </>
            ) : (
              "Generate Proposal with AI →"
            )}
          </button>

          {loading && (
            <p className="text-center text-slate-500 text-sm animate-pulse">
              AI is analyzing your brief and generating scope, timeline, and costs…
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
