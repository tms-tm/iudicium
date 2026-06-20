"use client";

import { useEffect, useState } from "react";
import {
  getDecisions,
  deleteDecision,
  clearDecisions,
  updateDecision
} from "@/lib/decisionStore";

export default function Library() {
  const [data, setData] = useState([]);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    setData(getDecisions());
  }, []);

  function refresh() {
    setData(getDecisions());
  }

  function handleDelete(id) {
    deleteDecision(id);
    refresh();
  }

  function handleClear() {
    clearDecisions();
    setShowConfirmClear(false);
    refresh();
  }

  // Dynamic colors matching our form sidebar setup
  const getRiskColor = (level) => {
    const risk = String(level).toLowerCase();
    if (risk.includes("high")) return "bg-red-50 text-red-700 border-red-200";
    if (risk.includes("med")) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 min-h-screen bg-slate-50 text-slate-800">
      {/* Header section */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Decision Library</h1>
          <p className="text-sm text-slate-500 mt-1">Review, manage, and inspect historical outcomes and reflections.</p>
        </div>
        
        {data.length > 0 && (
          <div className="relative">
            {!showConfirmClear ? (
              <button 
                onClick={() => setShowConfirmClear(true)}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
              >
                Clear All Entries
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-white p-2 border border-slate-200 shadow-sm rounded-lg text-xs animate-fadeIn">
                <span className="text-slate-600 font-medium">Are you sure?</span>
                <button onClick={handleClear} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Yes</button>
                <button onClick={() => setShowConfirmClear(false)} className="px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200">No</button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center bg-white shadow-sm max-w-xl mx-auto mt-12">
          <div className="text-4xl mb-3">🗄️</div>
          <h3 className="text-base font-semibold text-slate-800">Your library is currently empty</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Once you start logging and evaluating decisions, your logs will populate right here.</p>
        </div>
      )}

      {/* Grid Layout for Decision Items */}
      <div className="grid grid-cols-1 gap-6">
        {data.map(d => (
          <div
            key={d.id}
            className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition duration-200 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100"
          >
            {/* Left Content Column (Core User Inputs) */}
            <div className="p-6 flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{d.title}</h2>
                <button 
                  onClick={() => handleDelete(d.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition"
                  title="Delete entry"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Data Presentation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Situation</span>
                  <p className="text-slate-700 leading-relaxed">{d.situation}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Decision Path</span>
                  <p className="text-slate-700 leading-relaxed font-medium text-indigo-900">{d.decision}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Outcome</span>
                  <p className="text-slate-700 leading-relaxed">{d.outcome}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Initial Reasoning</span>
                  <p className="text-slate-700 leading-relaxed italic text-slate-500">"{d.reasoning}"</p>
                </div>
              </div>
              
              {d.meta?.createdAt && (
                <div className="text-[11px] text-slate-400 pt-2">
                  Logged on {new Date(d.meta.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </div>
              )}
            </div>

            {/* Right Side Column (AI Evaluation Output) */}
            <div className="p-6 md:w-80 bg-slate-50/50 flex flex-col justify-between shrink-0">
              {d.analysis ? (
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Evaluation</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{d.analysis.lesson}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-xs text-slate-500">Risk Profile</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${getRiskColor(d.analysis.risk_level)}`}>
                      {d.analysis.risk_level}
                    </span>
                  </div>

                  {d.analysis.tags?.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <div className="flex flex-wrap gap-1">
                        {d.analysis.tags.map((tag, idx) => (
                          <span key={idx} className="bg-white border border-slate-200 text-slate-500 text-[10px] px-1.5 py-0.5 rounded shadow-2xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center py-4 md:py-0">
                  <span className="text-xs italic text-slate-400 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200/50">
                    No Reflection Evaluated
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}