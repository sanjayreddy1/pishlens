export default async function handler(req: any, res: any) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
          "The site uses HTTP instead of HTTPS which means the connection is not encrypted.",
        mitigation:
          "Avoid entering passwords or financial information on HTTP websites."
      });
    }

    // 2️⃣ URL Length Check
    if (url.length > 75) {
      score += 15;

      detectedIssues.push({
        type: "Long URL",
        severity: 15,
        description:
          "Phishing URLs are often very long to hide the real domain.",
        mitigation:
          "Look carefully at the beginning of the domain name."
      });
    }

    // 3️⃣ IP Address instead of domain
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

    if (ipRegex.test(hostname)) {

      score += 30;

      detectedIssues.push({
        type: "IP Address Domain",
        severity: 30,
        description:
          "The URL uses an IP address instead of a domain name.",
        mitigation:
          "Legitimate companies typically use registered domain names."
      });

    }

    // 4️⃣ Suspicious keywords
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
          "Check whether the domain actually belongs to the brand mentioned."
      });

    }

    // 5️⃣ Excessive subdomains
    const subdomains = hostname.split(".");

    if (subdomains.length > 3) {

      score += 15;

      detectedIssues.push({
        type: "Excessive Subdomains",
        severity: 15,
        description:
          "Too many subdomains detected which may hide the real domain.",
        mitigation:
          "Focus on the main domain before the extension (.com, .org)."
      });

    }

    // 6️⃣ Dash in domain
    if (hostname.includes("-")) {

      score += 10;

      detectedIssues.push({
        type: "Dashed Domain",
        severity: 10,
        description:
          "Dashes are often used to create look-alike phishing domains.",
        mitigation:
          "Verify the spelling of the website domain."
      });

    }

    // Limit score
    score = Math.min(score, 100);

    let safetyStatus: "Safe" | "Suspicious" | "Phishing Risk" = "Safe";

    if (score > 60) safetyStatus = "Phishing Risk";
    else if (score > 30) safetyStatus = "Suspicious";

    return res.status(200).json({
      url,
      score,
      status: safetyStatus,
      issues: detectedIssues,
      analysisTime: new Date().toISOString()
    });

  } catch {

    return res.status(400).json({
      error: "Invalid URL format"
    });

  }
}
