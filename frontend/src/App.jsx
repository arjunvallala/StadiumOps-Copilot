import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import IncidentTriage from './components/IncidentTriage.jsx';
import GateAdvisory from './components/GateAdvisory.jsx';
import FanCommHelper from './components/FanCommHelper.jsx';
import ShiftSuggestions from './components/ShiftSuggestions.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('triage');
  const [systemOnline, setSystemOnline] = useState(true);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  async function checkHealth() {
    try {
      const res = await fetch('/api/health');
      setSystemOnline(res.ok);
    } catch {
      setSystemOnline(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xl outline-none"
      >
        Skip to main content
      </a>

      {/* Header with Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemOnline={systemOnline}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" tabIndex={-1}>
        {activeTab === 'triage' && <IncidentTriage />}
        {activeTab === 'gates' && <GateAdvisory />}
        {activeTab === 'translate' && <FanCommHelper />}
        {activeTab === 'shifts' && <ShiftSuggestions />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
