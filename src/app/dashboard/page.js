"use client";

import { useEffect, useState } from "react";
import { getDecisions } from "@/lib/decisionStore";

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(getDecisions());
  }, []);

  // -------------------------
  // DERIVED INSIGHTS & METRICS
  // -------------------------
  const total = data.length;
  const riskCount = { Low: 0, Medium: 0, High: 0 };
  const tagMap = {};
  let missingAnalysis = 0;
  let reasoningLengthTotal = 0;

  data.forEach(d => {
    // Standardize risk matching to handle case-sensitivity safely
    const rawRisk = d.analysis?.risk_level || "";
    if (/high/i.test(rawRisk)) riskCount.High++;
    else if (/med/i.test(rawRisk)) riskCount.Medium++;
    else if (/low/i.test(rawRisk)) riskCount.Low++;

    // Process tags
    d.analysis?.tags?.forEach(tag => {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    });

    if (!d.analysis) missingAnalysis++;
    reasoningLengthTotal += (d.reasoning?.length || 0);
  });

  const avgReasoningLength = total ? Math.round(reasoningLengthTotal / total) : 0;
  
  const topTags = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Compute percentage sizes for visual distribution bars
  const totalAnalyzed = total - missingAnalysis;
  const getPct = (val) => totalAnalyzed ? Math.round((val / totalAnalyzed) * 100) : 0;
  
  const riskPercentages = {
    Low: getPct(riskCount.Low),
    Medium: getPct(riskCount.Medium),
    High: getPct(riskCount.High),
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 min-h-screen bg-slate-50 text-slate-800">
      
      {/* Header section */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Decision Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Aggregated breakdown of systemic blindspots, risk distributions, and behavioral themes.</p>
      </header>

      {total === 0 ? (
        <div className="border border-slate-200 rounded-xl p-12 text-center bg-white shadow-sm max-w-xl mx-auto mt-12">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-base font-semibold text-slate-800">No telemetry data available</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Log your initial decisions inside the creator log to populate live dashboard analytics.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 1. KEY KPI SCORECARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Total Logged Decisions</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-slate-900">{total}</span>
                <span className="text-xs text-slate-500 font-medium">items historical</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Avg. Thought Articulation</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-slate-900">{avgReasoningLength}</span>
                <span className="text-xs text-slate-500 font-medium">characters / entry</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Analysis Coverage</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-slate-900">
                  {total ? Math.round(((total - missingAnalysis) / total) * 100) : 0}%
                </span>
                <span className="text-xs text-slate-500 font-medium">({missingAnalysis} unreviewed)</span>
              </div>
            </div>
          </div>

          {/* 2. SPLIT BREAKDOWNS: RISK VS PATTERNS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Risk Distribution Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 mb-4">Risk Profile Alignment</h3>
                
                {totalAnalyzed === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6">Run AI Analysis on decisions to generate data metrics.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Visual Segmented Stack Bar */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div style={{ width: `${riskPercentages.Low}%` }} className="bg-emerald-500 transition-all h-full" title="Low" />
                      <div style={{ width: `${riskPercentages.Medium}%` }} className="bg-amber-500 transition-all h-full" title="Medium" />
                      <div style={{ width: `${riskPercentages.High}%` }} className="bg-red-500 transition-all h-full" title="High" />
                    </div>

                    {/* Numeric breakdown bars */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" /> Low Risk</span>
                        <span className="text-slate-900">{riskCount.Low} ({riskPercentages.Low}%)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-amber-500 rounded-xs" /> Medium Risk</span>
                        <span className="text-slate-900">{riskCount.Medium} ({riskPercentages.Medium}%)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-red-500 rounded-xs" /> High Risk</span>
                        <span className="text-slate-900">{riskCount.High} ({riskPercentages.High}%)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Common Tags Component Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 mb-4">Core Behavioral Tags</h3>
              
              {topTags.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">
                  No active categories or tags detected.
                </div>
              ) : (
                <div className="space-y-3">
                  {topTags.map(([tag, count]) => {
                    const tagPercentage = Math.round((count / total) * 100);
                    return (
                      <div key={tag} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">#{tag}</span>
                          <span className="text-slate-500 font-medium">{count} incidents ({tagPercentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div style={{ width: `${tagPercentage}%` }} className="bg-indigo-600 h-full rounded-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. DYNAMIC CRITICAL BLINDSPOTS & INTERPRETATIONS PANEL */}
          <div className="bg-slate-900 text-white rounded-xl shadow-md p-6 border border-slate-950">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              🚨 Active Dynamic Systemic Risks
            </h3>
            
            {/* If there are absolutely no problems detected, provide clean feedback */}
            {!(missingAnalysis > total / 2 || riskCount.High > riskCount.Low || avgReasoningLength < 50 || topTags[0]?.[0]) ? (
              <p className="text-sm text-slate-300 italic">No structural behavioral vulnerabilities identified across local database parameters.</p>
            ) : (
              <div className="divide-y divide-slate-800 space-y-4">
                
                {missingAnalysis > total / 2 && (
                  <div className="flex items-start gap-3 pt-0">
                    <span className="text-amber-400 text-base shrink-0 mt-0.5">⚠️</span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">Compounding Blindspot Debt</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Over {Math.round((missingAnalysis / total) * 100)}% of choice paths are logged without evaluation cycles. This drops systemic accountability loops and leads to repetitive processing mistakes.
                      </p>
                    </div>
                  </div>
                )}

                {riskCount.High > riskCount.Low && (
                  <div className="flex items-start gap-3 pt-3">
                    <span className="text-red-400 text-base shrink-0 mt-0.5">🚨</span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">Elevated Exposure Vector</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Your macro environment leans highly vulnerable. High-risk instances ({riskCount.High}) outnumber stable structural entries ({riskCount.Low}). Validate whether mitigation architectures are explicitly set.
                      </p>
                    </div>
                  </div>
                )}

                {avgReasoningLength < 50 && (
                  <div className="flex items-start gap-3 pt-3">
                    <span className="text-amber-400 text-base shrink-0 mt-0.5">⚠️</span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">Low Articulation Resolution</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Your reason entries average less than 50 characters. Highly brief justifications imply potential reactionary decisions or missing pre-mortem frameworks. Try expanding contextual parameters.
                      </p>
                    </div>
                  </div>
                )}

                {topTags[0]?.[0] && (
                  <div className="flex items-start gap-3 pt-3">
                    <span className="text-indigo-400 text-base shrink-0 mt-0.5">🔍</span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">Dominant Structural Pillar</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        The majority of decision logic operations aggregate firmly around <strong className="text-indigo-300">#{topTags[0][0]}</strong>. This is your largest behavioral operational pivot point.
                      </p>
                    </div>
                  </div>
                )}
                
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}