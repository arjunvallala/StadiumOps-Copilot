import React from 'react';

export default function Header({ activeTab, setActiveTab, systemOnline }) {
  const navItems = [
    { id: 'triage', label: 'Incident Triage', icon: '🚨' },
    { id: 'gates', label: 'Gate & Crowd Advisory', icon: '🚪' },
    { id: 'translate', label: 'Multilingual Fan Helper', icon: '🗣️' },
    { id: 'shifts', label: 'Shift Positioning', icon: '📋' }
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
              ⚽
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  StadiumOps Copilot
                </h1>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  FIFA World Cup 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Explainable AI Assistant for Volunteers & Venue Staff
              </p>
            </div>
          </div>

          {/* System Status Badge */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${systemOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-300 font-medium">
                {systemOnline ? 'API Connected' : 'Offline Mode'}
              </span>
            </div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <nav aria-label="Main Navigation" className="mt-4 flex space-x-2 border-t border-slate-800/80 pt-3 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
