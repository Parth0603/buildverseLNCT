import re
from typing import Dict, Any, List

def analyze_message_heuristics(content: str) -> Dict[str, Any]:
    """
    Perform deep rule-based scam analysis using regex patterns and score weights.
    Triggers as primary fallback if Gemini API is offline.
    """
    content_upper = content.upper()
    
    # --- Pre-check for Legitimate Transaction Receipts to prevent False Positives ---
    is_standard_txn = False
    if "DEBITED" in content_upper or "CREDITED" in content_upper:
        if "UPI" in content_upper or "REF NO" in content_upper or "A/C" in content_upper:
            # Check that it doesn't contain actual suspicious targets
            if not any(token in content_upper for token in ["VERIFY PASSWORD", "LOCKED", "SUSPENDED", "BLOCKED", "HTTP", "WWW.", ".COM", ".NET"]):
                is_standard_txn = True

    if is_standard_txn:
        return {
            "risk_score": 10,
            "risk_level": "Safe",
            "scam_category": "Safe",
            "confidence_score": 90,
            "red_flags": ["None"],
            "explanation": "### Scan Results: Clean / Safe\n\nThis message is classified as an automated, standard transaction alert or bank receipt. It contains typical banking notification structures (debit/credit confirmations) with no associated high-risk scam triggers, suspended status warnings, or phishing links.",
            "recommended_actions": [
                "Keep this automated transaction notification for your financial records.",
                "No action is required as no suspicious threat indicators were detected."
            ]
        }
    
    # Initialize variables
    risk_score = 0
    red_flags = []
    category = "Safe"
    confidence = 70  # Default confidence for rule-based matching
    recommended_actions = [
        "Do not click any links inside this message.",
        "Verify this request by contacting the institution directly using their official website or phone number."
    ]
    
    # --- Pattern Collections ---
    
    # 1. OTP / Verification Code Demands
    otp_patterns = [
        (r"\bOTP\b", "OTP query identifier"),
        (r"ONE-TIME PASSWORD", "One-time password query"),
        (r"VERIFICATION CODE", "Verification code request"),
        (r"SECURITY CODE", "Security code warning"),
        (r"DO NOT SHARE", "Warning mimicking security code alerts"),
        (r"\bCODE\b.*\bSHARE\b", "Requests to share secret codes")
    ]
    
    # 2. Credentials / Password / Direct Info Requests
    credentials_patterns = [
        (r"VERIFY YOUR PASSWORD", "Direct password capture attempt"),
        (r"CONFIRM YOUR CREDENTIALS", "Credential verification prompt"),
        (r"RESET PASSWORD HERE", "Fake reset link prompt"),
        (r"ENTER YOUR LOG-IN|LOG IN AGAIN", "Login redirection trap"),
        (r"SECURITY PIN|CONFIRM PIN", "PIN extraction alert"),
        (r"PHONE NUMBER|MOBILE NUMBER", "Soliciting active mobile coordinates"),
        (r"BANK DETAILS|BANK ACCOUNT|ACCOUNT DETAILS", "Direct solicitation of financial info")
    ]
    
    # 3. Bank / Impersonation Indicators
    bank_patterns = [
        (r"CHASE", "Chase bank naming"),
        (r"BOA\b|BANK OF AMERICA", "Bank of America impersonation"),
        (r"WELLS FARGO", "Wells Fargo impersonation"),
        (r"PAYPAL|VENMO|CASHAPP", "Payment provider reference"),
        (r"UNAUTHORIZED TRANSACTION", "Fraud alert impersonation"),
        (r"SUSPENDED ACCOUNT|SUSPENSION", "Account lock threats"),
        (r"BLOCKED ACCOUNT", "Blocked account trigger"),
        (r"CARD HAS BEEN LOCKED", "Debit/Credit card freeze"),
        (r"BANK OF INDIA|CENTRAL BANK", "Indian banking impersonation spoof"),
        (r"BANK MANAGER|BANK REPRESENTATIVE|SUPPORT AGENT", "False personnel authority claim")
    ]
    
    # 4. Crypto / Investment Giveaways
    crypto_patterns = [
        (r"DOUBLE YOUR|MULTIPLY YOUR", "Double-your-deposit triggers"),
        (r"GUARANTEED RETURN|GUARANTEED YIELD", "Guaranteed yield claim"),
        (r"CRYPTO GIVEAWAY", "Crypto giveaway"),
        (r"SEND ETH|SEND BTC|SEND USDT", "Wallet address deposit prompts"),
        (r"INVESTMENT OPPORTUNITY", "Guaranteed investment pitch"),
        (r"MINING POOL|SMART CONTRACT YIELD", "Complex yield scams")
    ]
    
    # 5. Urgency / High Pressure Keywords
    urgency_patterns = [
        (r"ACT NOW", "High urgency prompt"),
        (r"IMMEDIATE ACTION", "Action warning"),
        (r"WITHIN 24 HOURS|24 HOURS|48 HOURS", "Strict countdown timers"),
        (r"AVOID SUSPENSION|AVOID FEES", "Threat deterrent language"),
        (r"LAST WARNING|FINAL WARNING", "Intense final threat alerts"),
        (r"URGENT|URGENTLY", "Explicit urgency word")
    ]
    
    # 6. Threat / Legal Fear Language
    threat_patterns = [
        (r"POLICE|ARREST", "Law enforcement threat"),
        (r"LEGAL ACTION|PROSECUTION", "Legal prosecution coercion"),
        (r"COURT SUMMONS|LAWSUIT", "Fake legal summons"),
        (r"TAX EVASION|IRS PENALTY", "Tax fraud threat impersonation"),
        (r"FINE WILL BE APPLIED", "Financial penalty extortion")
    ]
    
    # 7. Fake Rewards / Lottery Scams
    lottery_patterns = [
        (r"CONGRATULATIONS", "Congratulatory baiting"),
        (r"YOU WON|LUCKY DRAW", "Sweepstakes win bait"),
        (r"LOTTERY WINNER|JACKPOT", "Lottery claim bait"),
        (r"FREE GIFT|CLAIM REWARD", "Unsolicited gift distribution"),
        (r"PRIZE CLAIM", "Prize collection prompt")
    ]
    
    # 8. Job / Task Scams
    job_patterns = [
        (r"WORK FROM HOME|WORK-FROM-HOME", "Work from home banner"),
        (r"PART TIME|PART-TIME JOB", "Flexible part time work offer"),
        (r"WHATSAPP TASK|TELEGRAM TASK", "Social app tasks"),
        (r"DAILY SALARY|DAILY PAY", "Daily salary payout baits"),
        (r"COMMISSION ON COMPLETED", "Commission based task payouts"),
        (r"NO EXPERIENCE REQUIRED", "Low bar entry criteria")
    ]
    
    # --- Check Matches and Accumulate Score ---
    
    # Check OTP Scams
    otp_hits = 0
    for pattern, desc in otp_patterns:
        if re.search(pattern, content_upper):
            otp_hits += 1
            red_flags.append(f"Verification alert: {desc}")
    if otp_hits >= 1:
        risk_score += 45 + (otp_hits * 10)
        category = "OTP Scam"
        recommended_actions.append("NEVER share 6-digit OTP codes or login tokens with anyone, even if they claim to be from security support.")
        
    # Check Credentials / Info requests
    cred_hits = 0
    for pattern, desc in credentials_patterns:
        if re.search(pattern, content_upper):
            cred_hits += 1
            red_flags.append(f"Information request: {desc}")
    if cred_hits >= 1:
        risk_score += 40 + (cred_hits * 12)
        category = "Phishing"
        recommended_actions.append("Always verify the web address bar to confirm the security and ownership of domain login forms.")

    # Check Bank Impersonations
    bank_hits = 0
    for pattern, desc in bank_patterns:
        if re.search(pattern, content_upper):
            bank_hits += 1
            red_flags.append(f"Impersonation flag: {desc}")
    if bank_hits >= 1:
        risk_score += 35 + (bank_hits * 10)
        if category == "Safe" or risk_score > 60:
            category = "Bank Impersonation"
        recommended_actions.append("Directly log in to your banking app or bank portal via your own bookmarks. Do NOT trust number links.")
        
    # Check Crypto / Investment Scams
    crypto_hits = 0
    for pattern, desc in crypto_patterns:
        if re.search(pattern, content_upper):
            crypto_hits += 1
            red_flags.append(f"Financial offer flag: {desc}")
    if crypto_hits >= 1:
        risk_score += 45 + (crypto_hits * 10)
        if category == "Safe" or risk_score > 70:
            category = "Crypto Scam"
        recommended_actions.append("Be wary of any platform offering 'guaranteed yields' or demanding an initial payment to unlock larger payouts.")
        
    # Check Urgency
    urgency_hits = 0
    for pattern, desc in urgency_patterns:
        if re.search(pattern, content_upper):
            urgency_hits += 1
            red_flags.append(f"Pressure trigger: {desc}")
    if urgency_hits >= 1:
        risk_score += 20 + (urgency_hits * 5)
        
    # Check Threat / Coercion
    threat_hits = 0
    for pattern, desc in threat_patterns:
        if re.search(pattern, content_upper):
            threat_hits += 1
            red_flags.append(f"Coercion warning: {desc}")
    if threat_hits >= 1:
        risk_score += 45 + (threat_hits * 12)
        category = "Social Engineering"
        recommended_actions.append("Law enforcement or government agencies do not demand immediate crypto/gift card deposits over phone calls or SMS.")
        
    # Check Lottery / Free Rewards
    lottery_hits = 0
    for pattern, desc in lottery_patterns:
        if re.search(pattern, content_upper):
            lottery_hits += 1
            red_flags.append(f"Prize bait: {desc}")
    if lottery_hits >= 1:
        risk_score += 40 + (lottery_hits * 8)
        if category == "Safe" or risk_score > 60:
            category = "Investment Scam"
        recommended_actions.append("If you did not enter a lottery sweepstakes, you have not won a prize. Do not pay processing fees to claim rewards.")
        
    # Check Job Scams
    job_hits = 0
    for pattern, desc in job_patterns:
        if re.search(pattern, content_upper):
            job_hits += 1
            red_flags.append(f"Job offer indicator: {desc}")
    if job_hits >= 1:
        risk_score += 40 + (job_hits * 8)
        if category == "Safe" or risk_score > 70:
            category = "Job Scam"
        recommended_actions.append("Legitimate jobs do not request onboarding fees, deposit tokens, or conduct official business solely over WhatsApp/Telegram tasks.")

    # Bound risk score between 0 and 100
    risk_score = min(max(risk_score, 0), 100)
    
    # Determine Risk Level
    if risk_score <= 30:
        risk_level = "Safe"
        category = "Clean"
    elif risk_score <= 70:
        risk_level = "Medium Risk"
        if category == "Safe":
            category = "Suspicious Message"
    else:
        risk_level = "High Risk"
        if category == "Safe":
            category = "Phishing Attempt"
            
    # Compile markdown explanation report
    if risk_score <= 30:
        explanation = "### Scan Results: Clean / Safe\n\nNo urgency signals, credential request text patterns, or financial scam trigger templates were detected in the provided message."
    else:
        explanation = f"### Flagged Threats: {category} ({risk_level})\n\nThis message contains multiple indicators of social engineering scam vectors:\n\n"
        for flag in red_flags:
            explanation += f"- **✓ {flag}**\n"
        explanation += f"\n\n**Assessment Summary**: The content scored a risk factor of **{risk_score}/100** due to explicit matching patterns. Avoid replying, clicking links, or communicating further with this source."
        
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "scam_category": category,
        "confidence_score": confidence,
        "red_flags": red_flags if red_flags else ["None"],
        "explanation": explanation,
        "recommended_actions": list(set(recommended_actions))
    }
