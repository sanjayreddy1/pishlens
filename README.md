# 🔎 PhishLens  
Phishing Link Detection with Visual Risk Analysis

PhishLens is a lightweight cybersecurity web application that analyzes URLs and detects potential phishing attacks using rule-based risk analysis. The system scans a given URL, evaluates multiple phishing indicators, calculates a risk score, and classifies the link as Safe, Suspicious, or Phishing.

The application also keeps a scan history for analysis and learning purposes.

---

## 🚀 Features

- Real-time phishing URL scanning
- Rule-based phishing detection engine
- Risk score calculation
- Classification: Safe / Suspicious / Phishing
- Scan history tracking
- Clean centered UI with animated address bar
- REST API powered backend using Flask
- Lightweight and fast execution

---

## 🧠 Detection Logic

PhishLens evaluates URLs based on multiple phishing indicators such as:

- Suspicious keywords in URL
- IP address usage instead of domain
- Long or complex URLs
- Use of URL shortening services
- Presence of special characters
- Domain structure analysis

Each indicator contributes to a **risk score**, which determines the final classification.

---

## 🏗️ Project Structure
