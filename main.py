from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import re
from urllib.parse import urlparse, parse_qs

app = FastAPI()

class EmailData(BaseModel):
    sender: str
    subject: str
    body: str
    links: List[str]

def check_link_safety(link: str) -> tuple:
    # Check for hidden URLs in parameters
    parsed = urlparse(link)
    params = parse_qs(parsed.query)
    for val_list in params.values():
        for val in val_list:
            if "http" in val.lower():
                return True, "Hidden redirect URL detected."
    
    # Check for Punycode (homograph attacks)
    if "xn--" in link.lower():
        return True, "Mimicked domain (Punycode) detected."
        
    return False, ""

@app.post("/analyze")
async def analyze_email(data: EmailData):
    try:
        score = 0
        reasons = []

        # 1. Domain Reputation & Analysis
        blacklist = ["malicious-site.com", "fake-login.net"]
        
        for link in data.links:
            ln_lower = link.lower()
            
            # Check simple blacklist
            if any(bad in ln_lower for bad in blacklist):
                score += 50
                reasons.append("Link identified in blacklist.")
                break # Found one bad link, no need to check others for this category
                
            # Check for advanced patterns
            is_suspicious, reason = check_link_safety(link)
            if is_suspicious:
                score += 30
                reasons.append(reason)
                break

        # 2. Identity Spoofing Check
        brands = ["paypal", "google", "microsoft", "bank"]
        sender_lower = data.sender.lower()
        if any(b in sender_lower for b in brands) and not any(b in sender_lower.split('@')[-1] for b in brands):
            score += 30
            reasons.append("Brand name used in display but not domain.")

        # 3. Content Analysis (Urgency)
        # Added Hebrew support for "Urgent" and "Immediate"
        urgency_patterns = [r"urgent", r"immediately", r"suspended", r"דחוף", r"מיידי", r"חשבון הושעה"]
        combined_text = (data.body + data.subject).lower()
        
        if any(re.search(p, combined_text) for p in urgency_patterns):
            score += 20
            reasons.append("Urgent language detected.")

        # Final Scoring Logic
        score = min(score, 100)
        verdict = "Malicious" if score >= 70 else "Suspicious" if score >= 30 else "Safe"

        return {
            "score": score, 
            "verdict": verdict, 
            "reasons": reasons
        }

    except Exception as e:
        # Standard error handling for stability
        raise HTTPException(status_code=500, detail=str(e))