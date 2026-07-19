export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <p className="font-semibold text-slate-300">
            StadiumOps Copilot — PromptWars Challenge 4 (Smart Stadiums & Tournament Operations)
          </p>
          <p className="text-slate-500 mt-1">
            Built for FIFA World Cup 2026 Stadium Volunteers and Sector Stewards.
          </p>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            🔒 Rate-Limited & XSS Sanitized
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            💡 100% Explainable AI Decisions
          </span>
        </div>
      </div>
    </footer>
  );
}
