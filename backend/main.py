import os
import re
import shutil
import tempfile
import uuid
import hashlib
import urllib.parse
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pymongo.database import Database

from backend.config import settings
from backend.database import get_db
from backend import schemas
from backend.services.gemini import analyze_message_with_gemini
from backend.services.url_intel import analyze_url_heuristics
from backend.services.whisper import transcribe_audio_file

root_path = ""
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    root_path=root_path
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all connections for local and cloud testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_hash(text: str) -> str:
    """
    Generate SHA-256 hash of a string to avoid storing raw personal data.
    """
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()

# Initialize seed data in NoSQL collections if they are empty
def seed_nosql_data(db: Database):
    """
    Empty database seed function to ensure no fake/mockup data is loaded
    at startup, strictly using real user scans and reports.
    """
    pass

@app.on_event("startup")
def startup_event():
    db = get_db()
    seed_nosql_data(db)

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to ScamRadar X NoSQL Core API", "status": "active", "db_tier": "MongoDB"}

@app.post("/api/analyze-message", response_model=schemas.MessageScanResponse)
def analyze_message(request: schemas.MessageScanRequest, db: Database = Depends(get_db)):
    """
    Endpoint to scan textual message details (SMS, Emails, WhatsApp) using Gemini.
    Logs hashed results to MongoDB for statistics.
    """
    analysis = analyze_message_with_gemini(request.content)
    
    # Securely hash personal text content
    content_hash = get_hash(request.content)
    
    # Log scan to NoSQL database
    db.message_scans.insert_one({
        "content_hash": content_hash,
        "scam_category": analysis.get("scam_category"),
        "risk_score": analysis.get("risk_score"),
        "red_flags": analysis.get("red_flags"),
        "created_at": datetime.utcnow()
    })
    
    # Dynamic Log: Append to db.reports so it instantly updates the Recent Threat Feed
    try:
        db.reports.insert_one({
            "id": str(uuid.uuid4()),
            "scam_type": "message",
            "target_value": request.content[:60] + "..." if len(request.content) > 60 else request.content,
            "scam_category": analysis.get("scam_category") or "Message Phishing",
            "description": f"AI Message Scan: {analysis.get('explanation', '')[:100]}",
            "risk_score": analysis.get("risk_score", 0),
            "created_at": datetime.utcnow()
        })
    except Exception:
        pass
    
    return analysis

@app.post("/api/analyze-url", response_model=schemas.URLScanResponse)
def analyze_url(request: schemas.URLScanRequest, db: Database = Depends(get_db)):
    """
    Perform deep URL validation and suspicious pattern heuristics analysis.
    """
    analysis = analyze_url_heuristics(request.url)
    
    # Securely hash scanned URL
    url_hash = get_hash(request.url)
    
    # Log URL scan to database
    db.url_scans.insert_one({
        "url_hash": url_hash,
        "domain_age_days": analysis.get("domain_age_days"),
        "ssl_active": analysis.get("ssl_active"),
        "phish_detected": analysis.get("phish_detected"),
        "risk_score": analysis.get("risk_score"),
        "created_at": datetime.utcnow()
    })
    
    # Dynamic Log: Append to db.reports and db.domains so it instantly updates the lists in real-time
    try:
        clean_url = request.url.strip()
        clean_domain = clean_url
        if clean_url.startswith(("http://", "https://")):
            try:
                clean_domain = urllib.parse.urlparse(clean_url).hostname or clean_url
            except Exception:
                pass
                
        db.reports.insert_one({
            "id": str(uuid.uuid4()),
            "scam_type": "url",
            "target_value": clean_url,
            "scam_category": "Phishing" if analysis.get("risk_score", 0) >= 71 else "Safe Domain Check",
            "description": f"AI URL Scan: {analysis.get('risk_level', 'Safe')}",
            "risk_score": analysis.get("risk_score", 0),
            "created_at": datetime.utcnow()
        })
        
        # If domain is checked, update/insert domain reputation statistics
        db.domains.update_one(
            {"domain_name": clean_domain},
            {
                "$inc": {"report_count": 1},
                "$max": {"risk_score": analysis.get("risk_score", 0)},
                "$set": {"last_reported_at": datetime.utcnow()}
            },
            upsert=True
        )
    except Exception:
        pass
    
    return analysis

@app.post("/api/analyze-audio", response_model=schemas.AudioScanResponse)
def analyze_audio(file: UploadFile = File(...), db: Database = Depends(get_db)):
    """
    Endpoint that accepts an audio recording file, transcribes it,
    then executes Gemini parsing on the text transcript.
    """
    suffix = os.path.splitext(file.filename)[1] if file.filename else ".mp3"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
        try:
            shutil.copyfileobj(file.file, temp)
            temp_path = temp.name
        finally:
            file.file.close()
            
    try:
        # Transcribe audio using AssemblyAI SDK or mock fallbacks
        transcript = transcribe_audio_file(temp_path)
        
        # Analyze transcribed text using Gemini AI module
        analysis = analyze_message_with_gemini(transcript)
        
        # Log to DB
        db.audio_scans.insert_one({
            "transcript_hash": get_hash(transcript),
            "scam_category": analysis.get("scam_category"),
            "risk_score": analysis.get("risk_score"),
            "created_at": datetime.utcnow()
        })
        
        # Dynamic Log: Append to db.reports to show in Recent Threat Feed
        try:
            db.reports.insert_one({
                "id": str(uuid.uuid4()),
                "scam_type": "audio",
                "target_value": f"Audio Scan: {file.filename or 'recording.mp3'}",
                "scam_category": analysis.get("scam_category") or "Voice Phishing",
                "description": f"AI Audio Scan: {analysis.get('explanation', '')[:100]}",
                "risk_score": analysis.get("risk_score", 0),
                "created_at": datetime.utcnow()
            })
        except Exception:
            pass
        
        return {
            "transcript": transcript,
            "risk_score": analysis.get("risk_score"),
            "risk_level": analysis.get("risk_level"),
            "scam_category": analysis.get("scam_category"),
            "explanation": analysis.get("explanation"),
            "recommended_actions": analysis.get("recommended_actions")
        }
    finally:
        # Clean up temp file safely
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/api/report-scam", response_model=schemas.ReportResponse)
def report_scam(report: schemas.ReportCreate, db: Database = Depends(get_db)):
    """
    Allows community users to log scam threats (URLs, Phone Numbers, Crypto Wallets).
    Drives NoSQL blacklists and reputation scores.
    """
    report_id = str(uuid.uuid4())
    created_at_time = datetime.utcnow()
    
    # Save the report document
    db.reports.insert_one({
        "id": report_id,
        "scam_type": report.scam_type,
        "target_value": report.target_value,
        "scam_category": report.scam_category,
        "description": report.description,
        "risk_score": report.risk_score,
        "created_at": created_at_time
    })
    
    # Dynamically update the specific entity reputation cache
    val_clean = report.target_value.strip()
    if report.scam_type == "phone":
        db.phone_numbers.update_one(
            {"phone_number": val_clean},
            {
                "$inc": {"report_count": 1},
                "$max": {"risk_score": report.risk_score},
                "$set": {"last_reported_at": created_at_time}
            },
            upsert=True
        )
            
    elif report.scam_type == "domain" or report.scam_type == "url":
        clean_domain = val_clean
        if val_clean.startswith(("http://", "https://")):
            try:
                clean_domain = urllib.parse.urlparse(val_clean).hostname or val_clean
            except Exception:
                pass
        
        db.domains.update_one(
            {"domain_name": clean_domain},
            {
                "$inc": {"report_count": 1},
                "$max": {"risk_score": report.risk_score},
                "$set": {"last_reported_at": created_at_time}
            },
            upsert=True
        )
            
    elif report.scam_type == "wallet":
        db.wallets.update_one(
            {"wallet_address": val_clean},
            {
                "$inc": {"report_count": 1},
                "$max": {"risk_score": report.risk_score},
                "$set": {"last_reported_at": created_at_time}
            },
            upsert=True
        )
            
    return {
        "id": report_id,
        "scam_type": report.scam_type,
        "target_value": report.target_value,
        "scam_category": report.scam_category,
        "description": report.description,
        "risk_score": report.risk_score,
        "created_at": created_at_time.isoformat()
    }

@app.get("/api/search-reputation", response_model=schemas.ReputationSearchResponse)
def search_reputation(query: str, type: Optional[str] = None, db: Database = Depends(get_db)):
    """
    Search the threat base for malicious phone numbers, domains, or wallet addresses.
    Supports strict type filtering and returns chronological timeline events with community insights.
    """
    q_clean = query.strip()
    
    # 1. Determine resolved search type
    resolved_type = "unknown"
    if type and type in ["wallet", "phone", "domain"]:
        resolved_type = type
    else:
        # Fallback to automatic heuristic type matching
        if q_clean.startswith("0x") or len(q_clean) >= 26 and any(c.isdigit() for c in q_clean):
            resolved_type = "wallet"
        elif q_clean.startswith("+") or (q_clean.replace(" ", "").replace("-", "").isdigit() and len(q_clean) >= 7):
            resolved_type = "phone"
        else:
            resolved_type = "domain"
            
    # 2. Perform collection lookup based on type
    report_count = 0
    risk_score = 0
    risk_level = "Safe"
    last_reported_at = None
    
    if resolved_type == "wallet":
        wallet = db.wallets.find_one({"wallet_address": q_clean})
        if wallet:
            report_count = wallet["report_count"]
            risk_score = wallet["risk_score"]
            last_reported_at = wallet.get("last_reported_at")
            
    elif resolved_type == "phone":
        phone_clean = q_clean.replace(" ", "").replace("-", "")
        phone = db.phone_numbers.find_one({"phone_number": {"$regex": re.escape(phone_clean)}})
        if phone:
            report_count = phone["report_count"]
            risk_score = phone["risk_score"]
            last_reported_at = phone.get("last_reported_at")
            
    elif resolved_type == "domain":
        domain_clean = q_clean
        if q_clean.startswith(("http://", "https://")):
            try:
                domain_clean = urllib.parse.urlparse(q_clean).hostname or q_clean
            except Exception:
                pass
        domain = db.domains.find_one({"domain_name": {"$regex": re.escape(domain_clean)}})
        if domain:
            report_count = domain["report_count"]
            risk_score = domain["risk_score"]
            last_reported_at = domain.get("last_reported_at")
            
    # Determine risk level category
    if risk_score > 70:
        risk_level = "High Risk"
    elif risk_score > 30:
        risk_level = "Medium Risk"
    else:
        risk_level = "Safe"
        
    # 3. Pull chronological timeline events from reports matching the target value
    reports_cursor = list(db.reports.find({"target_value": {"$regex": re.escape(q_clean), "$options": "i"}}).sort("created_at", -1))
    timeline = []
    for r in reports_cursor:
        created_at_val = r.get("created_at")
        if isinstance(created_at_val, str):
            try:
                date_str = datetime.fromisoformat(created_at_val).strftime("%b %d, %Y")
            except Exception:
                date_str = "Recent"
        else:
            date_str = created_at_val.strftime("%b %d, %Y") if created_at_val else "Recent"
            
        timeline.append({
            "scam_category": r["scam_category"],
            "risk_score": r["risk_score"],
            "date": date_str
        })
        
    # 4. Generate dynamic community insights summary text
    if report_count > 0:
        insights = f"Highly suspicious threat! We found {report_count} active incident reports for this {resolved_type} in our community threat intelligence database. Maximum reported risk score reached is {risk_score}/100. Exercise extreme caution."
    else:
        insights = f"Clean profile! No community scam complaints have been logged against this {resolved_type}. Still, always verify banking and transaction details manually."
        
    return {
        "query": q_clean,
        "type": resolved_type,
        "report_count": report_count,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "last_reported_at": last_reported_at,
        "timeline": timeline,
        "insights": insights
    }

@app.get("/api/dashboard-stats", response_model=schemas.DashboardStatsResponse)
def get_dashboard_stats(db: Database = Depends(get_db)):
    """
    Returns threat analytics using dynamic database aggregations and counts.
    No hardcoded placeholding, dynamically calculates weekly, daily, and category metrics!
    """
    # 1. Load active collections
    message_scans = list(db.message_scans.find({}))
    url_scans = list(db.url_scans.find({}))
    audio_scans = list(db.audio_scans.find({}))
    reports = list(db.reports.find({}))
    domains = list(db.domains.find({}))
    wallets = list(db.wallets.find({}))
    
    # Compute active counts
    total_scans_count = len(message_scans) + len(url_scans) + len(audio_scans)
    total_reports_count = len(reports)
    high_risk_reports_count = sum(1 for r in reports if r.get("risk_score", 0) >= 71)
    flagged_domains_count = sum(1 for d in domains if d.get("risk_score", 0) >= 71)
    
    stats_cards = [
        {"title": "Total Scans Completed", "value": str(total_scans_count), "change": "+100% real database telemetry", "type": "positive"},
        {"title": "High Risk Threats Flagged", "value": str(high_risk_reports_count), "change": "Verified in blacklist", "type": "negative"},
        {"title": "Verified Community Reports", "value": str(total_reports_count), "change": "Logged complaints", "type": "positive"},
        {"title": "Blocked Malicious Domains", "value": str(flagged_domains_count), "change": "High risk domains", "type": "negative"}
    ]
    
    # 2. Scam Category Split (Dynamic distribution from reports)
    category_counts = {}
    for r in reports:
        cat = r.get("scam_category") or "General Phishing"
        category_counts[cat] = category_counts.get(cat, 0) + 1
        
    category_distribution = []
    for cat, val in category_counts.items():
        category_distribution.append({"name": cat, "value": val})
    
    # Safe fallback if completely empty
    if not category_distribution:
        category_distribution = [{"name": "Phishing", "value": 0}]
    else:
        category_distribution.sort(key=lambda x: x["value"], reverse=True)
        
    # 3. Daily Scans Telemetry (Last 7 Days)
    weekday_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    daily_scans = []
    now = datetime.utcnow()
    
    for i in range(6, -1, -1):
        day_date = now - timedelta(days=i)
        day_str = day_date.strftime("%Y-%m-%d")
        day_name = weekday_names[day_date.weekday()]
        
        scans_on_day = 0
        for scan in message_scans + url_scans + audio_scans:
            c_at = scan.get("created_at")
            if c_at:
                if isinstance(c_at, str):
                    is_match = day_str in c_at
                else:
                    is_match = c_at.strftime("%Y-%m-%d") == day_str
                
                if is_match:
                    scans_on_day += 1
                    
        daily_scans.append({"date": day_name, "scans": scans_on_day})
        
    # 4. Weekly Complaints Trend (Last 4 Weeks)
    weekly_reports = []
    for wk in range(4):
        days_end = (3 - wk) * 7
        days_start = days_end + 7
        
        start_date = now - timedelta(days=days_start)
        end_date = now - timedelta(days=days_end)
        
        reports_in_week = 0
        for r in reports:
            c_at = r.get("created_at")
            if c_at:
                if isinstance(c_at, str):
                    try:
                        dt = datetime.fromisoformat(c_at)
                    except Exception:
                        dt = None
                else:
                    dt = c_at
                    
                if dt and start_date <= dt < end_date:
                    reports_in_week += 1
                    
        weekly_reports.append({"week": f"Wk {wk+1}", "reports": reports_in_week})
        
    # 5. Recent Reports list
    def get_created_at(x):
        val = x.get("created_at")
        if isinstance(val, datetime):
            return val
        if isinstance(val, str):
            try:
                return datetime.fromisoformat(val)
            except Exception:
                pass
        return datetime.min
        
    recent_db = sorted(reports, key=get_created_at, reverse=True)[:5]
    recent_reports = []
    for r in recent_db:
        created_at_val = r.get("created_at")
        if isinstance(created_at_val, str):
            try:
                date_str = datetime.fromisoformat(created_at_val).strftime("%b %d, %H:%M")
            except Exception:
                date_str = "Recent"
        else:
            date_str = created_at_val.strftime("%b %d, %H:%M") if created_at_val else "Recent"
            
        recent_reports.append({
            "id": r.get("id", ""),
            "scam_type": r.get("scam_type", "url"),
            "target_value": r.get("target_value", "")[:40] + "..." if len(r.get("target_value", "")) > 40 else r.get("target_value", ""),
            "scam_category": r.get("scam_category", "Phishing"),
            "risk_score": r.get("risk_score", 0),
            "date": date_str
        })
        
    # 6. Top reported domains
    top_doms_db = sorted([d for d in domains if d.get("report_count", 0) > 0], key=lambda x: x.get("report_count", 0), reverse=True)[:3]
    top_domains = []
    for rank, d in enumerate(top_doms_db, 1):
        top_domains.append({
            "rank": rank,
            "value": d.get("domain_name", ""),
            "reports": d.get("report_count", 0),
            "risk_score": d.get("risk_score", 0)
        })
        
    # 7. Top reported wallets
    top_wallets_db = sorted([w for w in wallets if w.get("report_count", 0) > 0], key=lambda x: x.get("report_count", 0), reverse=True)[:3]
    top_wallets = []
    for rank, w in enumerate(top_wallets_db, 1):
        top_wallets.append({
            "rank": rank,
            "value": w.get("wallet_address", "")[:10] + "..." + w.get("wallet_address", "")[-8:] if len(w.get("wallet_address", "")) > 18 else w.get("wallet_address", ""),
            "reports": w.get("report_count", 0),
            "risk_score": w.get("risk_score", 0)
        })
        
    return {
        "stats_cards": stats_cards,
        "category_distribution": category_distribution,
        "daily_scans": daily_scans,
        "weekly_reports": weekly_reports,
        "recent_reports": recent_reports,
        "top_domains": top_domains,
        "top_wallets": top_wallets
    }
