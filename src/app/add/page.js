"use client";

import { useState } from "react";
// Import the shared store function so everything stays perfectly in sync
import { addDecision } from "@/lib/decisionStore";

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export default function AddPage() {
  const [form, setForm] = useState({
    title: "",
    situation: "",
    decision: "",
    outcome: "",
    reasoning: ""
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleAnalyze() {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      // 1. Detect HTTP errors BEFORE parsing JSON
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      // 2. Ensure it's actually JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error("Non-JSON response: " + text.slice(0, 300));
      }

      const data = await res.json();

      // 3. Handle backend failure explicitly
      if (!data.success) {
        setError({
          type: "BACKEND_ERROR",
          message: data.error || "Analysis failed"
        });
        return;
      }

      // 4. Extract data cleanly (handling variable name differences safely)
      const analysisPayload = data.data || data.analysis;
      setResult(analysisPayload);

      // 5. Build a structured entry matching Library/Dashboard expectations
      const entry = {
        id: crypto.randomUUID(),
        ...form,
        analysis: {
          lesson: analysisPayload.lesson || "",
          // Normalize names to match risk_level filters in your dashboard and compare views
          risk_level: analysisPayload.risk_level || analysisPayload.risk || "Medium",
          tags: analysisPayload.tags || []
        },
        meta: {
          createdAt: new Date().toISOString()
        }
      };

      // 6. Commit directly to local storage state machine 
      addDecision(entry);

      // 7. Clear states on success pass
      setForm({ title: "", situation: "", decision: "", outcome: "", reasoning: "" });

    } catch (err) {
      setError({
        type: "FRONTEND_ERROR",
        message: String(err)
      });
    } finally {
      setLoading(false);
    }
  }

  const getRiskColor = (level) => {
    const risk = String(level || "").toLowerCase();
    if (risk.includes("high")) return "bg-red-50 text-red-700 border-red-200";
    if (risk.includes("med")) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 min-h-screen bg-slate-50 text-slate-800">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Add New Decision</h1>
        <p className="text-sm text-slate-500 mt-1">Log your thought process and generate AI reflection insights.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Input block */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Title</label>
            <input
              type="text"
              placeholder="e.g., Migrating database to Postgres"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={form.title}
              onChange={e => update("title", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Situation</label>
              <textarea
                rows={4}
                placeholder="What context led to this decision?"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                value={form.situation}
                onChange={e => update("situation", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Decision</label>
              <textarea
                rows={4}
                placeholder="What path did you choose to take?"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                value={form.decision}
                onChange={e => update("decision", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Outcome</label>
              <textarea
                rows={4}
                placeholder="What actually happened as a result?"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                value={form.outcome}
                onChange={e => update("outcome", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Reasoning</label>
              <textarea
                rows={4}
                placeholder="Why did you believe this was the right call?"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                value={form.reasoning}
                onChange={e => update("reasoning", e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-mono overflow-auto max-h-40">
              <span className="font-bold uppercase tracking-wider block mb-1">[{error.type}]</span>
              {error.message}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 transition min-w-[150px]"
            >
              {loading ? <Spinner /> : "Analyze & Save"}
            </button>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-1">
          {result ? (
            <div className="bg-indigo-950 text-white rounded-xl shadow-md p-6 border border-indigo-900 animate-fadeIn">
              <h3 className="text-lg font-semibold tracking-wide text-indigo-200 mb-4 flex items-center gap-2">
                ✨ AI Reflection Insight
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-1">
                    Lesson Learned
                  </span>
                  <p className="text-slate-100 text-sm leading-relaxed">{result.lesson}</p>
                </div>

                <div className="pt-2 border-t border-indigo-900 flex items-center justify-between">
                  <span className="text-xs font-medium text-indigo-300">Risk Level</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getRiskColor(result.risk_level || result.risk)}`}>
                    {result.risk_level || result.risk}
                  </span>
                </div>

                {result.tags?.length > 0 && (
                  <div className="pt-3 border-t border-indigo-900">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-2">
                      Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.tags.map((tag, idx) => (
                        <span key={idx} className="bg-indigo-900/60 border border-indigo-800 text-indigo-200 text-xs px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 bg-white/50">
              <p className="text-sm">Provide details and select <strong className="text-slate-500">Analyze & Save</strong> to run evaluations and write parameters to history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}