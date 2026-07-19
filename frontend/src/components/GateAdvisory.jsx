import React, { useState, useEffect } from 'react';
import { fetchGates, updateGateOccupancy } from '../api/client.js';

export default function GateAdvisory() {
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [updatingGateId, setUpdatingGateId] = useState(null);

  useEffect(() => {
    loadGateData();
    const interval = setInterval(() => {
      loadGateData(true);
    }, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  async function loadGateData(silent = false) {
    if (!silent) setLoading(true);
    try {
      const response = await fetchGates();
      if (response.data) {
        setGates(response.data);
        setLastUpdated(new Date(response.timestamp).toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to load gate data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function handleSimulateLoad(gateId, newOccupancy) {
    setUpdatingGateId(gateId);
    try {
      const response = await updateGateOccupancy(gateId, newOccupancy);
      if (response.data) {
        setGates(response.data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to simulate gate load:', err);
    } finally {
      setUpdatingGateId(null);
    }
  }

  const statusStyles = {
    critical: {
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      bar: 'bg-rose-500',
      card: 'border-rose-500/40 bg-rose-950/10'
    },
    warning: {
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      bar: 'bg-amber-500',
      card: 'border-amber-500/40 bg-amber-950/10'
    },
    info: {
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      bar: 'bg-sky-500',
      card: 'border-sky-500/30 bg-sky-950/10'
    },
    normal: {
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      bar: 'bg-emerald-500',
      card: 'border-slate-800 bg-slate-900'
    }
  };

  const trendIcon = {
    rising: '⬆️ Rising',
    falling: '⬇️ Falling',
    stable: '➡️ Stable',
    'manual update': '⚡ Override'
  };

  return (
    <section aria-labelledby="gate-heading" className="space-y-6">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="gate-heading" className="text-xl font-bold text-white flex items-center gap-2">
            <span>🚪</span> Gate & Crowd Advisory Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time stadium occupancy metrics. Automated alerts trigger based on explainable safety thresholds (Warning at 75%, Critical at 90%).
          </p>
        </div>
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <span className="text-xs text-slate-500">
            Updated: {lastUpdated || 'Loading...'}
          </span>
          <button
            onClick={() => loadGateData()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
          >
            <span>🔄</span> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">Reading gate occupancy sensors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gates.map((gate) => {
            const style = statusStyles[gate.status] || statusStyles.normal;
            return (
              <article
                key={gate.id}
                className={`border rounded-2xl p-6 shadow-md space-y-4 transition-all ${style.card}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {gate.name}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Design Capacity: <span className="font-semibold text-slate-200">{gate.capacity.toLocaleString()} spectators</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${style.badge}`}>
                    {gate.status}
                  </span>
                </div>

                {/* Progress Bar & Occupancy metric */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 font-medium">Occupancy Rate:</span>
                    <span className="font-bold text-white text-base">
                      {gate.occupancy}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                      style={{ width: `${Math.min(100, gate.occupancy)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 pt-1">
                    <span>Trend: <strong className="text-slate-200">{trendIcon[gate.trend] || gate.trend}</strong></span>
                    <span>Status limit check</span>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Recommended Operational Action:
                  </div>
                  <div className="text-xs font-bold text-slate-100">
                    {gate.action}
                  </div>
                </div>

                {/* Explainable Reasoning */}
                <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-indigo-400 flex items-center gap-1">
                    <span>💡</span> Explainable Rule Logic:
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {gate.explanation}
                  </p>
                </div>

                {/* Simulation Controls for Judges / Testers */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Simulate Surge:</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSimulateLoad(gate.id, 45)}
                      disabled={updatingGateId === gate.id}
                      className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                    >
                      Low (45%)
                    </button>
                    <button
                      onClick={() => handleSimulateLoad(gate.id, 80)}
                      disabled={updatingGateId === gate.id}
                      className="px-2 py-1 text-[11px] bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 rounded border border-amber-800"
                    >
                      Warn (80%)
                    </button>
                    <button
                      onClick={() => handleSimulateLoad(gate.id, 94)}
                      disabled={updatingGateId === gate.id}
                      className="px-2 py-1 text-[11px] bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded border border-rose-800"
                    >
                      Crit (94%)
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
