import { useState } from 'react';
import { translateMessage } from '../api/client.js';

export default function FanCommHelper() {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const quickPhrases = [
    'Where is the nearest medical assistance station?',
    'Please proceed through Gate B to reach the shuttle bus.',
    'Restrooms and water fountains are down the left concourse.',
    'Please have your digital match ticket ready for scanning.',
    'Children lost items can be claimed at the Info Desk.'
  ];

  const languages = [
    { code: 'Spanish', name: 'Spanish (Español)' },
    { code: 'French', name: 'French (Français)' },
    { code: 'Arabic', name: 'Arabic (العربية)' },
    { code: 'German', name: 'German (Deutsch)' },
    { code: 'Japanese', name: 'Japanese (日本語)' },
    { code: 'Portuguese', name: 'Portuguese (Português)' },
    { code: 'Mandarin', name: 'Mandarin Chinese (中文)' }
  ];

  async function handleTranslate(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const data = await translateMessage(text, targetLang);
      setResult(data);
      setAnnouncement(`Message translated into ${targetLang}.`);
    } catch (err) {
      setError(err.message || 'Failed to translate message.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result?.translation) return;
    navigator.clipboard.writeText(result.translation);
    setCopied(true);
    setAnnouncement('Translated message copied to clipboard.');
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <section aria-labelledby="comm-heading" className="space-y-6">
      
      {/* ARIA Live Region for clipboard notifications */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 id="comm-heading" className="text-xl font-bold text-white flex items-center gap-2">
            <span>🗣️</span> Multilingual Fan-Communication Helper
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Translate English operational directions into target spectator languages to seamlessly assist international fans during FIFA World Cup 2026.
          </p>
        </div>

        {/* Quick Phrase Presets */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">Common Stadium Announcements:</span>
          <div className="flex flex-wrap gap-2">
            {quickPhrases.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setText(phrase)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors text-left"
              >
                &quot;{phrase}&quot;
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleTranslate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Input Message */}
            <div className="md:col-span-2">
              <label htmlFor="fan-message" className="block text-sm font-semibold text-slate-200 mb-2">
                English Message <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="fan-message"
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type instructions or assistance info for spectators..."
                maxLength={250}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm resize-none"
              />
              <div className="text-right text-xs text-slate-500 mt-1">
                {text.length}/250 chars
              </div>
            </div>

            {/* Target Language Selector */}
            <div>
              <label htmlFor="target-lang" className="block text-sm font-semibold text-slate-200 mb-2">
                Target Language
              </label>
              <select
                id="target-lang"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div role="alert" className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Translating Message...</span>
              </>
            ) : (
              <>
                <span>🌐</span>
                <span>Translate for Spectator</span>
              </>
            )}
          </button>
        </form>

        {/* Translation Output Card */}
        {result && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <span>✨</span> Translation ({result.targetLanguage})
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
              >
                {copied ? '✅ Copied!' : '📋 Copy Text'}
              </button>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-lg font-bold text-white leading-relaxed">
              {result.translation}
            </div>

            <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-3 flex items-center gap-1">
              <span>💡</span>
              <span>{result.explanation}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
