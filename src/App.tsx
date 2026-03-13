import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Globe, 
  ArrowRight,
  CheckCircle2,
  HelpCircle,
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
    }, 50);
    
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

  const startAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setError(null);
    setResult(null);
    setShowTyping(true);
    setIsScanning(true);
  };

  // ✅ FIXED FUNCTION
  const finishAnalysis = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const contentType = response.headers.get("content-type");

      let data: any;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze URL");
      }

      setResult(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold">PhishLens</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-xl font-semibold mb-2">URL Security Scanner</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Enter a link to check for phishing threats and security risks.
          </p>

          <form onSubmit={startAnalysis} className="flex gap-2">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 border border-slate-300 rounded-lg px-4 py-3"
              disabled={isScanning}
            />

            <button 
              type="submit"
              disabled={isScanning || !url}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <Search className="w-5 h-5"/>
              Scan
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4"/>
              {error}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showTyping && (
            <motion.div 
              initial={{ opacity:0,y:10 }}
              animate={{ opacity:1,y:0 }}
              exit={{ opacity:0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8"
            >
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">
                Analyzing Address...
              </p>

              <TypingBar text={url} onComplete={finishAnalysis}/>

              <div className="mt-6 flex flex-col items-center justify-center py-4">

                <motion.div
                  animate={{ rotate:360 }}
                  transition={{ duration:2, repeat:Infinity, ease:"linear" }}
                >
                  <Search className="w-12 h-12 text-indigo-600"/>
                </motion.div>

                <p className="text-sm text-indigo-600 animate-pulse flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin"/>
                  Inspecting domain security...
                </p>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {result && !isScanning && (
          <div className="space-y-6">

            <div className={`p-6 rounded-xl border-2 ${getStatusBg(result.status)}`}>

              <div className="flex items-center gap-4 mb-4">

                {result.status === 'Safe'
                  ? <ShieldCheck className="w-8 h-8 text-green-600"/>
                  : result.status === 'Suspicious'
                  ? <AlertTriangle className="w-8 h-8 text-orange-500"/>
                  : <ShieldAlert className="w-8 h-8 text-red-600"/>
                }

                <div>
                  <h3 className={`text-2xl font-bold ${getStatusColor(result.status)}`}>
                    {result.status}
                  </h3>

                  <p className="text-slate-600 text-sm">
                    Risk Score: <b>{result.score}/100</b>
                  </p>
                </div>
              </div>

              <p className="text-slate-700">
                <TypewriterText text={
                  result.status === 'Safe'
                  ? "This link appears legitimate."
                  : result.status === 'Suspicious'
                  ? "This link shows suspicious characteristics."
                  : "High probability of phishing detected."
                }/>
              </p>

            </div>

          </div>
        )}

      </main>

      <footer className="max-w-3xl mx-auto px-6 py-12 text-center text-slate-400 text-sm border-t">
        <p>2026 PhishLens • Cyber Hackathon Project</p>
      </footer>

    </div>
  );
}
