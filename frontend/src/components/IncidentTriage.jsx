import { useState, useEffect } from 'react';
import { submitIncident, fetchIncidents } from '../api/client.js';

export default function IncidentTriage() {
  const [reportText, setReportText] = useState('');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    try {
      const result = await fetchIncidents();
      if (result.data) {
        setIncidents(result.data);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reportText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await submitIncident(reportText);
      const newInc = response.data;
      
      setIncidents((prev) => [newInc, ...prev]);
      setReportText('');
      
      // Screen reader announcement
      const announceText = `New ${newInc.severity} severity ${newInc.category} incident triaged: ${newInc.action}`;
      setAnnouncement(announceText);
    } catch (err) {
      setError(err.message || 'Failed to submit incident report');
    } finally {
      setLoading(false);
    }
  }

  const samplePresets = [
    'Fan collapsed near Section B, unresponsive',
    'Severe overcrowding at Gate B, fans pushing',
    'A lost child crying near the Sector 3 food court',
    'Water leak in restrooms near Gate D',
    'Fist fight broke out near turnstiles at Gate A'
  ];

  const filteredIncidents = filterCategory === 'all'
    ? incidents
    : incidents.filter(i => i.category === filterCategory);

  const severityBadgeClass = {
    critical: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  };

  const categoryBadgeClass = {
    medical: 'bg-red-950 text-red-300 border-red-800',
    security: 'bg-purple-950 text-purple-300 border-purple-800',
    crowd: 'bg-orange-950 text-orange-300 border-orange-800',
    'lost-person': 'bg-blue-950 text-blue-300 border-blue-800',
    facilities: 'bg-teal-950 text-teal-300 border-teal-800',
    other: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <section aria-labelledby="triage-heading" className="space-y-8">
      
      {/* Invisible Screen Reader Announcement Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 id="triage-heading" className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span>🚨</span> Incident Triage Engine
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Submit free-text incident reports. The system evaluates deterministic rules first for instant, explainable classification, falling back to LLM reasoning for ambiguous cases.
        </p>

        {/* Preset Quick Buttons */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-400 block mb-2">Quick Volunteer Presets:</span>
          <div className="flex flex-wrap gap-2">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReportText(preset)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors text-left"
              >
                &quot;{preset.length > 35 ? preset.substring(0, 35) + '...' : preset}&quot;
              </button>
            ))}
          </div>
        </div>

        {/* Triage Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="incident-text" className="block text-sm font-semibold text-slate-200 mb-2">
              Incident Report Details <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="incident-text"
              name="incidentText"
              rows={3}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="e.g., Overcrowding at Gate 3, fan collapsed near Section B..."
              maxLength={500}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm resize-none"
            />
            <div className="flex justify-between items-center mt-1 text-xs text-slate-500">
              <span>Sanitized against HTML injection tags.</span>
              <span>{reportText.length}/500 chars</span>
            </div>
          </div>

          {error && (
            <div role="alert" className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !reportText.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Evaluating Logic & Triage...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Submit & Triage Incident</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Filter and Live Incident Log Feed */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📋</span> Triaged Incidents Feed
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {filteredIncidents.length} items
            </span>
          </h3>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="category-filter" className="text-xs text-slate-400 font-medium">Filter:</label>
            <select
              id="category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="medical">Medical</option>
              <option value="security">Security</option>
              <option value="crowd">Crowd Safety</option>
              <option value="lost-person">Lost Person / Item</option>
              <option value="facilities">Facilities</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Incident List Cards */}
        <div className="space-y-4" aria-live="polite">
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 border border-slate-800/60 rounded-xl text-slate-500 text-sm">
              No triaged incidents found. Submit a report above to view live triage logic.
            </div>
          ) : (
            filteredIncidents.map((item) => (
              <article
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {/* Category Badge */}
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${categoryBadgeClass[item.category] || categoryBadgeClass.other}`}>
                      {item.category}
                    </span>
                    {/* Severity Badge */}
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${severityBadgeClass[item.severity] || severityBadgeClass.low}`}>
                      {item.severity} severity
                    </span>
                    {/* Rule vs LLM Source badge */}
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                      {item.source === 'rule-engine' ? '⚡ Deterministic Rule' : '🤖 LLM Fallback'}
                    </span>
                  </div>

                  <time className="text-xs text-slate-500" dateTime={item.timestamp}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </time>
                </div>

                <p className="text-sm font-medium text-slate-100">
                  &quot;{item.rawText}&quot;
                </p>

                {/* Action Box */}
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg">
                  <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-0.5">
                    Recommended Action:
                  </div>
                  <div className="text-sm font-bold text-white">
                    {item.action}
                  </div>
                </div>

                {/* Explainable AI Reason Panel */}
                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-slate-400 flex items-center gap-1">
                    <span>💡</span>
                    <span>Explainable AI Reason:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
