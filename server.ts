import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Phishing Analysis API
app.post("/api/analyze", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  let score = 0;

  const detectedIssues: {
    type: string;
    severity: number;
    description: string;
    mitigation: string;
  }[] = [];

  try {

    const urlObj = new URL(url.startsWith("http") ? url : `http://${url}`);
    const hostname = urlObj.hostname;
    const protocol = urlObj.protocol;

    // 1️⃣ HTTP vs HTTPS
    if (protocol === "http:") {
      score += 25;
      detectedIssues.push({
        type: "Insecure Connection",
        severity: 25,
        description:
          "The site uses HTTP instead of HTTPS, meaning data is not encrypted.",
        mitigation:
          "Avoid entering passwords or sensitive data on HTTP sites."
      });
    }

    // 2️⃣ URL Length
    if (url.length > 75) {
      score += 15;
      detectedIssues.push({
        type: "Long URL",
        severity: 15,
        description:
          "Phishing links often use very long URLs to hide the real domain.",
        mitigation:
          "Check the beginning of the URL carefully for the real domain."
      });
    }

    // 3️⃣ IP Address Domain
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

    if (ipRegex.test(hostname)) {
      score += 30;

      detectedIssues.push({
        type: "IP Address Domain",
        severity: 30,
        description:
          "Using an IP address instead of a domain name is common in phishing.",
        mitigation:
          "Legitimate websites usually use domain names, not raw IP addresses."
      });
    }

    // 4️⃣ Suspicious Keywords
    const suspiciousKeywords = [
      "login",
      "verify",
      "secure",
      "update",
      "banking",
      "account",
      "signin",
      "paypal",
      "google",
      "microsoft",
      "apple",
      "security"
    ];

    const foundKeywords = suspiciousKeywords.filter(keyword =>
      url.toLowerCase().includes(keyword)
    );

    if (foundKeywords.length > 0) {
      const keywordScore = Math.min(foundKeywords.length * 10, 30);

      score += keywordScore;

      detectedIssues.push({
        type: "Suspicious Keywords",
        severity: keywordScore,
        description: `Suspicious keywords detected: ${foundKeywords.join(", ")}`,
        mitigation:
          "Check if the domain actually belongs to the brand mentioned."
      });
    }

    // 5️⃣ Excessive Subdomains
    const subdomains = hostname.split(".");

    if (subdomains.length > 3) {
      score += 15;

      detectedIssues.push({
        type: "Excessive Subdomains",
        severity: 15,
        description:
          "Too many subdomains can be used to imitate legitimate brands.",
        mitigation:
          "Focus on the root domain (example: google.com)."
      });
    }

    // 6️⃣ Dash in Domain
    if (hostname.includes("-")) {
      score += 10;

      detectedIssues.push({
        type: "Dashed Domain",
        severity: 10,
        description:
          "Dashes are often used to create fake look-alike domains.",
        mitigation:
          "Double-check the spelling of the domain."
      });
    }

    // Cap score
    score = Math.min(score, 100);

    let safetyStatus: "Safe" | "Suspicious" | "Phishing Risk" = "Safe";

    if (score > 60) safetyStatus = "Phishing Risk";
    else if (score > 30) safetyStatus = "Suspicious";

    return res.json({
      url,
      score,
      status: safetyStatus,
      issues: detectedIssues,
      analysisTime: new Date().toISOString()
    });

  } catch (error) {

    return res.status(400).json({
      error: "Invalid URL format"
    });

  }
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {

  const distPath = path.join(process.cwd(), "dist");

  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

}

export default app;
