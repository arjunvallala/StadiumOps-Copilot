import { useState, useEffect } from 'react';
import { fetchShiftSuggestions, fetchSustainabilityTransit } from '../api/client.js';

export default function ShiftSuggestions() {
  const [phase, setPhase] = useState('pre-match');
  const [data, setData] = useState(null);
  const [ecoTransitData, setEcoTransitData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllShiftData(phase);
  }, [phase]);

  async function loadAllShiftData(selectedPhase) {
    setLoading(true);
    try {
      const [shiftRes, ecoRes] = await Promise.all([
        fetchShiftSuggestions(selectedPhase),
        fetchSustainabilityTransit(selectedPhase)
      ]);
      if (shiftRes.data) setData(shiftRes.data);
      if (ecoRes.data) setEcoTransitData(ecoRes.data);
    } catch (err) {
      console.error('Failed to load operational suggestions:', err);
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
            <span>📋</span> Operational Intelligence: Staffing, Sustainability & Transit
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time operational positioning recommendations for volunteers, zero-waste recycling stewards, and transit shuttle dispatchers tailored to match phase telemetry.
          </p>
        </div>

        {/* Match Phase Selector Buttons */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">Select Tournament Phase:</span>
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
            <p className="text-sm">Computing operational intelligence & force allocations...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Phase Summary Banner */}
            {data && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Operational Posture ({data.phase.toUpperCase()})
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  {data.summary}
                </p>
              </div>
            )}

            {/* Volunteer Allocation Cards */}
            {data && (
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
            )}

            {/* Sustainability & Transportation Intelligence Cards */}
            {ecoTransitData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                
                {/* Sustainability & Waste Management */}
                <article className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <span>🌱</span> Sustainability & Waste Management
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase ${
                      ecoTransitData.sustainability.level === 'high-surge'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : ecoTransitData.sustainability.level === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {ecoTransitData.sustainability.level}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Focus Area: {ecoTransitData.sustainability.wasteBinFocus}
                    </h4>
                    <p className="text-xs text-slate-300">
                      <strong>Action:</strong> {ecoTransitData.sustainability.recommendation}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1">
                      <span>💡</span> Zero-Waste Logic:
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {ecoTransitData.sustainability.reasoning}
                    </p>
                  </div>
                </article>

                {/* Transportation & Spectator Egress */}
                <article className="bg-slate-950 border border-sky-500/30 rounded-xl p-5 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                      <span>🚌</span> Transportation & Shuttle Dispatch
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase">
                      {ecoTransitData.transportation.shuttleStatus}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Primary Hub: {ecoTransitData.transportation.primaryHub}
                    </h4>
                    <p className="text-xs text-slate-300">
                      <strong>Action:</strong> {ecoTransitData.transportation.transitAction}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-sky-400 flex items-center gap-1">
                      <span>💡</span> Transit Flow Logic:
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {ecoTransitData.transportation.reasoning}
                    </p>
                  </div>
                </article>

              </div>
            )}

          </div>
        )}
      </div>
    </section>
  );
}
