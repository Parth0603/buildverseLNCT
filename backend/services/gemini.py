import json
import time
import logging
import google.generativeai as genai
from typing import Dict, Any
from backend.config import settings
from backend.services.scam_rules import analyze_message_heuristics

# Configure standard logger
logger = logging.getLogger("scamradar.gemini")

# Configure Google GenAI client if the key is loaded
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

def analyze_message_with_gemini(content: str) -> Dict[str, Any]:
    """
    Analyzes message content using Gemini 2.5/1.5 Flash API.
    Handles rate-limiting with exponential backoff retries.
    Gracefully falls back to local rules engine on API errors or missing credentials.
    """
    if not settings.GEMINI_API_KEY:
        logger.info("Gemini API key is unconfigured. Falling back to rule-based engine.")
        return analyze_message_heuristics(content)
        
    prompt = f"""
You are the primary threat analysis core of ScamRadar X, an AI-powered scam detection platform.
Your task is to analyze the suspicious message text below and return a highly detailed threat report in structural JSON.

Suspicious Message Content:
\"\"\"{content}\"\"\"

Instructions:
1. Determine a Risk Score between 0 and 100 based on standard social engineering, phishing, OTP, and financial threat structures:
   - 0 to 30: Safe / Legitimate
   - 31 to 70: Medium Risk / Suspicious
   - 71 to 100: High Risk / Definite Scam
2. Classify the threat into one of these Scam Categories:
   - 'Safe' (if clean)
   - 'Phishing'
   - 'OTP Scam'
   - 'Job Scam'
   - 'Crypto Scam'
   - 'Investment Scam'
   - 'Bank Impersonation'
   - 'Social Engineering'
   - 'Unknown'
3. List 2-4 exact "red_flags" you detected (e.g. "Urgency words", "Credential capture link", "Guaranteed yield claim").
4. Formulate a detailed, professional markdown explanation outlining the structural tactics used (social proof, threats, urgency, impersonation templates).
5. Suggest 2-4 actionable, high-quality recommended actions (e.g. "Do not share verification codes", "Delete and block this number").

You MUST return ONLY a valid JSON object matching the following structure exactly, with no additional text, markdown backticks, or formatting indicators outside the JSON block:
{{
  "risk_score": <int>,
  "risk_level": "<Safe | Medium Risk | High Risk>",
  "scam_category": "<scam_category>",
  "confidence_score": <int (0-100)>,
  "red_flags": ["flag_1", "flag_2"],
  "explanation": "<markdown formatted explanation string>",
  "recommended_actions": ["action_1", "action_2"]
}}
"""
    
    # Retry logic parameters for rate limit handling (429) or transient errors
    max_retries = 3
    base_backoff_secs = 2.0
    
    for attempt in range(max_retries):
        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            response_text = response.text.strip()
            
            # Strip potential markdown fences if returned despite prompt instructions
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            data = json.loads(response_text)
            
            # Validate critical elements to prevent front-end typing mismatch
            required_keys = ["risk_score", "risk_level", "scam_category", "confidence_score", "red_flags", "explanation", "recommended_actions"]
            for key in required_keys:
                if key not in data:
                    raise KeyError(f"Missing required key in response: {key}")
                    
            return data
            
        except Exception as e:
            logger.warning(f"[Gemini API Attempt {attempt + 1}/{max_retries}] Failure: {str(e)}")
            
            # If we haven't exhausted our retries, wait with exponential backoff
            if attempt < max_retries - 1:
                sleep_duration = base_backoff_secs * (2 ** attempt)
                logger.info(f"Retrying in {sleep_duration} seconds...")
                time.sleep(sleep_duration)
            else:
                # All retries failed
                logger.error("All Gemini API retries exhausted. Attempting rule-based fallback.")
                break
                
    # Fallback to local rule engine
    fallback_data = analyze_message_heuristics(content)
    fallback_data["explanation"] = f"> **[AI Fallback Active]** Gemini API offline or rate-limited. Showing automated local heuristics.\n\n" + fallback_data["explanation"]
    return fallback_data
