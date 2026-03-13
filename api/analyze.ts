export default function handler(req: any, res: any) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  let score = 0;

  const detectedIssues: {
    type: string
    severity: number
    description: string
    mitigation: string
  }[] = []

  try {

    const urlObj = new URL(url.startsWith("http") ? url : `http://${url}`);
    const hostname = urlObj.hostname;
    const protocol = urlObj.protocol;

    // 1️⃣ HTTP instead of HTTPS
    if (protocol === "http:") {

      score += 25;

      detectedIssues.push({
        type: "Insecure Connection",
        severity: 25,
        description:
          "This website uses HTTP instead of HTTPS. HTTP connections are not encrypted and attackers can intercept sensitive information.",
        mitigation:
          "Avoid entering passwords or payment details on HTTP websites. Only use sites with HTTPS and a padlock icon."
      });

    }

    // 2️⃣ Very long URL
    if (url.length > 80) {

      score += 20;

      detectedIssues.push({
        type: "Unusually Long URL",
        severity: 20,
        description:
          "Phishing websites often use very long URLs to hide the real domain and confuse users.",
        mitigation:
          "Always inspect the domain name at the beginning of the URL."
      });

    }

    // 3️⃣ Suspicious keywords
    const suspiciousKeywords = [
      "login","verify","secure","update",
      "bank","account","signin","password"
    ];

    const found = suspiciousKeywords.filter(word =>
      url.toLowerCase().includes(word)
    );

    if (found.length > 0) {

      const keywordScore = Math.min(found.length * 10, 30);
      score += keywordScore;

      detectedIssues.push({
        type: "Suspicious Keywords in URL",
        severity: keywordScore,
        description:
          `The URL contains suspicious keywords: ${found.join(", ")}. Attackers often use these words to trick users into entering credentials.`,
        mitigation:
          "Check if the website truly belongs to the brand mentioned before entering your credentials."
      });

    }

    // 4️⃣ IP address instead of domain
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

    if (ipRegex.test(hostname)) {

      score += 35;

      detectedIssues.push({
        type: "IP Address Used as Domain",
        severity: 35,
        description:
          "The URL uses a raw IP address instead of a domain name. Legitimate websites rarely do this.",
        mitigation:
          "Avoid visiting links that use raw IP addresses unless you trust the source."
      });

    }

    // 5️⃣ Too many subdomains
    const parts = hostname.split(".");

    if (parts.length > 3) {

      score += 20;

      detectedIssues.push({
        type: "Too Many Subdomains",
        severity: 20,
        description:
          "Multiple subdomains may be used to disguise phishing sites and imitate trusted brands.",
        mitigation:
          "Focus on the main domain name before the .com/.org extension."
      });

    }

    // 6️⃣ Hyphenated domain
    if (hostname.includes("-")) {

      score += 10;

      detectedIssues.push({
        type: "Hyphenated Domain",
        severity: 10,
        description:
          "Hyphens are commonly used to create look-alike domains that resemble legitimate brands.",
        mitigation:
          "Carefully check the spelling of the website domain."
      });

    }

    // Cap risk score
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
