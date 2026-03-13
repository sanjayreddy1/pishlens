import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Phishing Analysis Logic
  app.post("/api/analyze", (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    let score = 0;
    const detectedIssues: { type: string; severity: number; description: string; mitigation: string }[] = [];

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
      const hostname = urlObj.hostname;
      const protocol = urlObj.protocol;

      // 1. HTTP vs HTTPS
      if (protocol === 'http:') {
        score += 25;
        detectedIssues.push({
          type: "Insecure Connection",
          severity: 25,
          description: "The site uses HTTP instead of HTTPS, meaning data is not encrypted.",
          mitigation: "Never enter passwords or credit card details on HTTP sites. Look for the padlock icon in the future."
        });
      }

      // 2. URL Length
      if (url.length > 75) {
        score += 15;
        detectedIssues.push({
          type: "Long URL",
          severity: 15,
          description: "Phishing links often use very long URLs to hide the actual domain.",
          mitigation: "Check the very beginning of the domain name. Don't be distracted by the length."
        });
      }

      // 3. IP Address instead of Domain
      const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (ipRegex.test(hostname)) {
        score += 30;
        detectedIssues.push({
          type: "IP Address Domain",
          severity: 30,
          description: "Using an IP address instead of a domain name is a common phishing tactic.",
          mitigation: "Legitimate companies use registered domain names (like google.com), not raw IP addresses."
        });
      }

      // 4. Suspicious Keywords
      const suspiciousKeywords = ['login', 'verify', 'secure', 'update', 'banking', 'account', 'signin', 'paypal', 'google', 'microsoft', 'apple', 'security'];
      const foundKeywords = suspiciousKeywords.filter(keyword => url.toLowerCase().includes(keyword));
      if (foundKeywords.length > 0) {
        const keywordScore = Math.min(foundKeywords.length * 10, 30);
        score += keywordScore;
        detectedIssues.push({
          type: "Suspicious Keywords",
          severity: keywordScore,
          description: `Found suspicious keywords: ${foundKeywords.join(', ')}.`,
          mitigation: "Be wary of URLs that contain brand names or 'action' words but aren't the official domain."
        });
      }

      // 5. Excessive Subdomains
      const subdomains = hostname.split('.');
      if (subdomains.length > 3) {
        score += 15;
        detectedIssues.push({
          type: "Excessive Subdomains",
          severity: 15,
          description: "Multiple subdomains are often used to mimic legitimate brands.",
          mitigation: "Focus on the 'root' domain (the part right before .com, .org, etc.)."
        });
      }

      // 6. Dash in Domain
      if (hostname.includes('-')) {
        score += 10;
        detectedIssues.push({
          type: "Dashed Domain",
          severity: 10,
          description: "Legitimate brands rarely use dashes in their primary domain names.",
          mitigation: "Verify the exact spelling of the brand. Dashes are often used to create 'look-alike' domains."
        });
      }

      // Cap score at 100
      score = Math.min(score, 100);

      let safetyStatus: 'Safe' | 'Suspicious' | 'Phishing Risk' = 'Safe';
      if (score > 60) safetyStatus = 'Phishing Risk';
      else if (score > 30) safetyStatus = 'Suspicious';

      res.json({
        url,
        score,
        status: safetyStatus,
        issues: detectedIssues,
        analysisTime: new Date().toISOString()
      });

    } catch (e) {
      res.status(400).json({ error: "Invalid URL format" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
