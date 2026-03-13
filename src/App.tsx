import React, { useState } from "react";
import {
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

interface Issue {
  type: string;
  severity: number;
  description: string;
  mitigation: string;
}

interface AnalysisResult {
  url: string;
  score: number;
  status: "Safe" | "Suspicious" | "Phishing Risk";
  issues: Issue[];
  analysisTime: string;
}

export default function App() {

  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading,setLoading]=useState(false)

  const scanUrl = async (e: React.FormEvent) => {

    e.preventDefault();

    setLoading(true)
    setError(null)
    setResult(null)

    try {

      const res = await fetch("/api/analyze",{
        method:"POST",
        headers:{ "Content-Type":"application/json"},
        body:JSON.stringify({url})
      })

      const data = await res.json()

      if(!res.ok){
        throw new Error(data.error || "Scan failed")
      }

      setResult(data)

    } catch(err:any){

      setError(err.message)

    }

    setLoading(false)

  }

  const getStatusColor=(status:string)=>{

    if(status==="Safe") return "text-green-600"
    if(status==="Suspicious") return "text-orange-500"
    return "text-red-600"

  }

  const getStatusIcon=(status:string)=>{

    if(status==="Safe") return <ShieldCheck className="w-8 h-8 text-green-600"/>
    if(status==="Suspicious") return <AlertTriangle className="w-8 h-8 text-orange-500"/>
    return <ShieldAlert className="w-8 h-8 text-red-600"/>

  }

  const getSummary=(score:number)=>{

    if(score<20)
      return "This website appears safe with minimal phishing indicators."

    if(score<40)
      return "This website shows minor suspicious characteristics. Be cautious when interacting."

    if(score<60)
      return "This website contains multiple suspicious indicators that could suggest phishing activity."

    if(score<80)
      return "High phishing probability. The URL contains several patterns commonly used in phishing attacks."

    return "Extremely high phishing risk detected. Avoid interacting with this website."

  }

  return (

    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-3xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-indigo-600"/>
          <h1 className="text-2xl font-bold">PhishLens Scanner</h1>
        </div>

        <form onSubmit={scanUrl} className="flex gap-2 mb-6">

          <input
            value={url}
            onChange={(e)=>setUrl(e.target.value)}
            placeholder="Enter URL to scan"
            className="flex-1 border px-4 py-3 rounded-lg"
          />

          <button
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Search className="w-4 h-4"/>
            Scan
          </button>

        </form>

        {loading && (
          <p className="text-indigo-600 mb-6">Scanning URL security...</p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded mb-6 text-red-600">
            {error}
          </div>
        )}

        {result && (

          <div className="space-y-6">

            <div className="bg-white p-6 rounded-xl border shadow">

              <div className="flex items-center gap-4 mb-4">

                {getStatusIcon(result.status)}

                <div>
                  <h2 className={`text-2xl font-bold ${getStatusColor(result.status)}`}>
                    {result.status}
                  </h2>

                  <p className="text-slate-600">
                    Risk Score: <b>{result.score}/100</b>
                  </p>

                </div>

              </div>

              <p className="text-slate-700 leading-relaxed">
                {getSummary(result.score)}
              </p>

            </div>

            <div className="bg-white border rounded-xl shadow">

              <div className="bg-slate-50 p-4 border-b flex items-center gap-2">
                <Info className="w-4 h-4"/>
                <b>Detailed Threat Analysis</b>
              </div>

              {result.issues.length===0 && (

                <div className="p-6 text-center text-slate-400">

                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40"/>

                  No specific threats detected for this URL.

                </div>

              )}

              {result.issues.map((issue,i)=>(

                <div key={i} className="p-6 border-t">

                  <div className="flex justify-between mb-2">

                    <b>{issue.type}</b>

                    <span className="text-red-500 text-sm">
                      Risk {issue.severity}%
                    </span>

                  </div>

                  <p className="text-slate-600 mb-4">
                    {issue.description}
                  </p>

                  <div className="bg-indigo-50 p-4 rounded">

                    <h4 className="text-indigo-700 text-sm font-bold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4"/>
                      How to overcome this threat
                    </h4>

                    <p className="text-indigo-900 text-sm">
                      {issue.mitigation}
                    </p>

                  </div>

                </div>

              ))}

            </div>

            <div className="bg-white p-6 rounded-xl border shadow">

              <h3 className="font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-indigo-600"/>
                General Safety Tips
              </h3>

              <ul className="space-y-3 text-sm text-slate-600">

                <li className="flex gap-2">
                  <ArrowRight className="w-4 h-4 mt-1 text-indigo-500"/>
                  Always check the domain carefully before logging in.
                </li>

                <li className="flex gap-2">
                  <ArrowRight className="w-4 h-4 mt-1 text-indigo-500"/>
                  Avoid entering sensitive information on unknown websites.
                </li>

                <li className="flex gap-2">
                  <ArrowRight className="w-4 h-4 mt-1 text-indigo-500"/>
                  Use password managers to prevent phishing attacks.
                </li>

              </ul>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}
