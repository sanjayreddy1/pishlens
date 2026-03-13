import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Lock, 
  Globe, 
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MousePointer2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnalysisResult {
  url: string;
  score: number;
  status: 'Safe' | 'Suspicious' | 'Phishing Risk';
  issues: { type: string; severity: number; description: string; mitigation: string }[];
  analysisTime: string;
}

// Typing animation component for general text
const TypewriterText = ({ text, delay = 0, speed = 20 }: { text: string; delay?: number; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, started, speed]);

  return <span>{displayedText}</span>;
};

// Typing animation component for the simulated browser bar
const TypingBar = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 50); // Speed of typing
    
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return (
    <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-md px-3 py-2 font-mono text-sm text-slate-700 shadow-inner w-full overflow-hidden whitespace-nowrap">
      <Globe className="w-4 h-4 text-slate-400 shrink-0" />
      <span className="border-r-2 border-slate-400 pr-1 animate-pulse">{displayedText}</span>
    </div>
  );
};

export default function App() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Custom cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const startAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setError(null);
    setResult(null);
    setShowTyping(true);
    setIsScanning(true);
  };

  const finishAnalysis = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze URL');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsScanning(false);
      setShowTyping(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Safe': return 'text-green-600';
      case 'Suspicious': return 'text-orange-500';
      case 'Phishing Risk': return 'text-red-600';
      default: return 'text-slate-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Safe': return 'bg-green-50 border-green-200';
      case 'Suspicious': return 'bg-orange-50 border-orange-200';
      case 'Phishing Risk': return 'bg-red-50 border-red-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans cursor-none">
      {/* Custom Magnifying Glass Cursor */}
      <div 
        className="fixed pointer-events-none z-[9999] transition-transform duration-75 ease-out"
        style={{ left: cursorPos.x, top: cursorPos.y, transform: 'translate(-50%, -50%)' }}
      >
        <div className="relative">
          <Search className="w-8 h-8 text-indigo-600 drop-shadow-md" />
          <div className="absolute top-1 left-1 w-4 h-4 bg-indigo-500/10 rounded-full blur-sm" />
        </div>
      </div>

      {/* Basic Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold tracking-tight">PhishLens</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-xl font-semibold mb-2">URL Security Scanner</h2>
          <p className="text-slate-500 mb-6 text-sm">Enter a link to check for phishing threats and security risks.</p>
          
          <form onSubmit={startAnalysis} className="flex gap-2">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              disabled={isScanning}
            />
            <button 
              type="submit"
              disabled={isScanning || !url}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Scan
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Typing Animation Area */}
        <AnimatePresence>
          {showTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Analyzing Address...</p>
              <TypingBar text={url} onComplete={finishAnalysis} />
              <div className="mt-6 flex flex-col items-center justify-center py-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-4"
                >
                  <Search className="w-12 h-12 text-indigo-600" />
                </motion.div>
                <p className="text-sm text-indigo-600 animate-pulse flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Inspecting domain structure and security protocols...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {result && !isScanning && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Result Summary */}
              <div className={`p-6 rounded-xl border-2 ${getStatusBg(result.status)}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full bg-white shadow-sm`}>
                    {result.status === 'Safe' ? <ShieldCheck className="w-8 h-8 text-green-600" /> : 
                     result.status === 'Suspicious' ? <AlertTriangle className="w-8 h-8 text-orange-500" /> : 
                     <ShieldAlert className="w-8 h-8 text-red-600" />}
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${getStatusColor(result.status)}`}>
                      {result.status}
                    </h3>
                    <p className="text-slate-600 text-sm">Risk Score: <span className="font-bold">{result.score}/100</span></p>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  <TypewriterText text={
                    result.status === 'Safe' 
                      ? "This link appears to be legitimate. It uses standard security protocols and has no obvious phishing markers."
                      : result.status === 'Suspicious'
                      ? "Caution is advised. This link has some unusual characteristics that are often seen in phishing attempts."
                      : "High probability of phishing. This link shows multiple malicious patterns used to steal user information."
                  } />
                </p>
              </div>

              {/* Detailed Threat Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h4 className="font-bold flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-600" />
                    Detailed Threat Analysis
                  </h4>
                </div>
                <div className="divide-y divide-slate-100">
                  {result.issues.length > 0 ? result.issues.map((issue, idx) => (
                    <div key={idx} className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-800">{issue.type}</span>
                        <span className="text-xs font-bold px-2 py-1 bg-red-50 text-red-600 rounded">Risk: {issue.severity}%</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        <TypewriterText text={issue.description} delay={500 + (idx * 300)} />
                      </p>
                      
                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <h5 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          How to overcome this threat
                        </h5>
                        <p className="text-sm text-indigo-900 leading-relaxed">
                          <TypewriterText text={issue.mitigation} delay={1000 + (idx * 300)} />
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-12 text-center text-slate-400">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No specific threats were identified during the scan.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* General Safety Tips */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  General Safety Advice
                </h4>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span><strong>Check the Domain:</strong> Always look at the main domain (e.g., google.com). Phishers use variations like g00gle.com.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span><strong>Don't Rush:</strong> Phishing emails often create a false sense of urgency. Take your time to inspect the link.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span><strong>Use a Password Manager:</strong> They won't auto-fill your password on a fake site, which is a great safety check.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-3xl mx-auto px-6 py-12 text-center text-slate-400 text-sm border-t border-slate-200">
        <p> 2026 Phishing lense a project for Cyber Hackathon.</p>
      </footer>

      <style>{`
        body {
          cursor: none;
        }
        a, button, input {
          cursor: none;
        }
      `}</style>
    </div>
  );
}
