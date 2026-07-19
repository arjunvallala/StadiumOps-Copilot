import React, { useState, useEffect } from 'react';
import { fetchShiftSuggestions } from '../api/client.js';

export default function ShiftSuggestions() {
  const [phase, setPhase] = useState('pre-match');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShifts(phase);
  }, [phase]);

  async function loadShifts(selectedPhase) {
    setLoading(true);
    try {
      const response = await fetchShiftSuggestions(selectedPhase);
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Failed to load shift suggestions:', err);
    } finally {
      setLoading(false);
    }
  }

  const phases = [
    { id: 'pre-match', label: 'Pre-Match (Entry Flow)', icon: '🎟️' },
    { id: 'live', label: 'Live Match (In Seats)', icon: '⚽' },
    { id: 'halftime', label: 'Halftime (Concourse Rush)', icon: '🥤' },
    { id: 'post-match', label: 'Post-Match (Exit Egress)', icon: '🚪' }
  ];

  return (
    <section aria-labelledby="shift-heading" className="space-y-6">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 id="shift-heading" className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span> Shift & Volunteer Positioning Suggestions
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Reallocates volunteer forces dynamically based on the current match phase and live gate crowd advisories.
          </p>
        </div>

        {/* Match Phase Selector Buttons */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">Select Match Phase:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {phases.map((p) => {
              const isActive = phase === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPhase(p.id)}
                  aria-pressed={isActive}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">Calculating optimal volunteer distribution...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            
            {/* Phase Summary Banner */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Operational Posture ({data.phase.toUpperCase()})
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {data.summary}
              </p>
            </div>

            {/* Allocation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.suggestions.map((item, idx) => (
                <article
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Location Target
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        {item.allocationPercentage}% Force
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {item.location}
                    </h3>

                    {/* Progress Bar for Force Allocation */}
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${item.allocationPercentage}%` }}
                      />
                    </div>

                    <div className="text-xs font-medium text-slate-300 pt-1">
                      <strong className="text-slate-400">Assigned Task:</strong> {item.task}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg text-xs space-y-1 mt-3">
                    <div className="font-semibold text-slate-400 flex items-center gap-1">
                      <span>💡</span> Reasoning:
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {item.reasoning}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
