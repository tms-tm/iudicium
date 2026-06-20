"use client";

import { useEffect, useState } from "react";
import { getDecisions } from "@/lib/decisionStore";

function scoreDecision(d) {
  if (!d) return { total: 0, breakdown: { reasoning: 0, analysis: 0, risk: 0, outcome: 0, tags: 0 } };
  
  const reasoning = Math.min((d.reasoning?.length || 0) / 10, 10);
  const analysis = d.analysis ? 10 : 0;
  
  let risk = 0;
  if (d.analysis?.risk_level === "Medium") risk = 5;
  else if (d.analysis?.risk_level === "Low") risk = 2;
  else if (d.analysis?.risk_level === "High") risk = 3;

  const outcome = d.outcome?.length > 20 ? 3 : 0;
  const tags = Math.min((d.analysis?.tags?.length || 0), 5);

  return {
    total: reasoning + analysis + risk + outcome + tags,
    breakdown: { reasoning, analysis, risk, outcome, tags }
  };
}

function computeDetailedMetrics(a, b) {
  const insights = [];
  if (!a || !b) return insights;

  const lenA = a.reasoning?.length || 0;
  const lenB = b.reasoning?.length || 0;
  if (lenA !== lenB) {
    const diff = Math.abs(lenA - lenB);
    const winner = lenA > lenB ? a.title : b.title;
    insights.push(`"${winner}" features a deeper cognitive depth (+${diff} characters of logical documentation).`);
  }

  if (a.analysis?.risk_level !== b.analysis?.risk_level) {
    insights.push(`Divergent risk profiles: Side A chose [${a.analysis?.risk_level || "No Risk Assigned"}] while Side B optimized for [${b.analysis?.risk_level || "No Risk Assigned"}].`);
  }

  if (!!a.analysis !== !!b.analysis) {
    const lazy = !a.analysis ? a.title : b.title;
    insights.push(`Structural structural debt found in "${lazy}": Missing a verified post-mortem AI reflection cycle.`);
  }

  return insights;
}

export default function Compare() {
  const [data, setData] = useState([]);
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);

  useEffect(() => {
    setData(getDecisions());
  }, []);

  const metaA = scoreDecision(a);
  const metaB = scoreDecision(b);

  const winner = a && b
    ? metaA.total === metaB.total
      ? "Tie"
      : metaA.total > metaB.total ? "A" : "B"
    : null;

  const behavioralInsights = computeDetailedMetrics(a, b);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 min-h-screen bg-slate-50 text-slate-800">
      
      {/* HEADER CONTAINER */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Decision Cross-Examination</h1>
        <p className="text-sm text-slate-500 mt-1">Audit and rank opposing historical frameworks to isolate structural advantages.</p>
      </header>

      {/* SELECTOR TOOLBAR BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs mb-8">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Baseline Choice (Side A)</label>
          <select 
            className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={e => setA(data.find(d => d.id === e.target.value) || null)}
          >
            <option value="">Select First Decision...</option>
            {data.map(d => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Comparison Target (Side B)</label>
          <select 
            className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={e => setB(data.find(d => d.id === e.target.value) || null)}
          >
            <option value="">Select Second Decision...</option>
            {data.map(d => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* RENDER LOGIC MATRIX */}
      {!a || !b ? (
        <div className="border border-slate-200 rounded-xl p-12 text-center bg-white/60 text-slate-400 text-sm">
          Select two choices above to generate standard quality matrix rankings.
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* WINNER JUMBOTRON CARD */}
          <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-950 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold block mb-1">Algorithmic Assessment</span>
              <h2 className="text-xl font-bold tracking-tight">
                {winner === "Tie" ? (
                  "Structural Quality Equilibrium (Tie)"
                ) : (
                  <>Dominant Framework: <span className="text-indigo-300">{winner === "A" ? a.title : b.title}</span></>
                )}
              </h2>
            </div>
            <div className="flex gap-4 shrink-0 text-center text-xs">
              <div className="bg-slate-800 border border-slate-700/60 px-4 py-2 rounded-lg">
                <span className="block text-slate-400 text-[10px] uppercase font-semibold">Side A Index</span>
                <span className="text-lg font-bold text-slate-100 mt-0.5 block">{metaA.total.toFixed(1)}</span>
              </div>
              <div className="bg-slate-800 border border-slate-700/60 px-4 py-2 rounded-lg">
                <span className="block text-slate-400 text-[10px] uppercase font-semibold">Side B Index</span>
                <span className="text-lg font-bold text-slate-100 mt-0.5 block">{metaB.total.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* ASYMMETRIC CORE COMPARISON DATA ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* COLUMN SIDE A */}
            <div className={`bg-white border p-6 rounded-xl shadow-xs transition ${winner === "A" ? "border-indigo-500 ring-1 ring-indigo-500/30" : "border-slate-200"}`}>
              <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">{a.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${winner === "A" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                  {winner === "A" ? "Winner" : winner === "Tie" ? "Balanced" : "Contender"}
                </span>
              </div>
              
              <div className="space-y-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Risk Framework</span>
                  <span className="font-semibold text-slate-700">{a.analysis?.risk_level || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Justification Depth</span>
                  <p className="text-slate-600 leading-relaxed italic">"{a.reasoning || "Empty justification data."}"</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Post-Action Lesson</span>
                  <p className="text-slate-700 leading-relaxed font-medium">{a.analysis?.lesson || "No lessons evaluated."}</p>
                </div>
              </div>
            </div>

            {/* COLUMN SIDE B */}
            <div className={`bg-white border p-6 rounded-xl shadow-xs transition ${winner === "B" ? "border-indigo-500 ring-1 ring-indigo-500/30" : "border-slate-200"}`}>
              <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">{b.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${winner === "B" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                  {winner === "B" ? "Winner" : winner === "Tie" ? "Balanced" : "Contender"}
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Risk Framework</span>
                  <span className="font-semibold text-slate-700">{b.analysis?.risk_level || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Justification Depth</span>
                  <p className="text-slate-600 leading-relaxed italic">"{b.reasoning || "Empty justification data."}"</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Post-Action Lesson</span>
                  <p className="text-slate-700 leading-relaxed font-medium">{b.analysis?.lesson || "No lessons evaluated."}</p>
                </div>
              </div>
            </div>

          </div>

          {/* SYSTEM INSIGHT METRIC BREAKDOWN ACCORDION */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 mb-4">Variance Breakdown Summary</h3>
            
            {behavioralInsights.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No material parameter distribution differences detected.</p>
            ) : (
              <div className="space-y-2">
                {behavioralInsights.map((insight, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 font-medium">
                    <span className="text-indigo-500 text-sm leading-none">•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}