from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Auth / User Schemas ---
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Reputation Search Schemas ---
class ReputationSearchRequest(BaseModel):
    query: str = Field(..., description="Phone number, domain name, or wallet address to search")

class ReputationSearchResponse(BaseModel):
    query: str
    type: str # 'phone', 'domain', 'wallet', 'unknown'
    report_count: int
    risk_score: int
    risk_level: str # 'Safe', 'Medium Risk', 'High Risk'
    last_reported_at: Optional[datetime] = None

# --- Report Schemas ---
class ReportCreate(BaseModel):
    scam_type: str = Field(..., description="Must be 'message', 'url', 'audio', 'phone', 'wallet', 'domain'")
    target_value: str = Field(..., description="The suspicious payload (URL, phone number, address, message text)")
    scam_category: str = Field(..., description="e.g. Phishing, Bank Impersonation, OTP Scam")
    description: Optional[str] = None
    risk_score: int = Field(50, ge=0, le=100)

class ReportResponse(BaseModel):
    id: str
    reporter_id: Optional[str] = None
    scam_type: str
    target_value: str
    scam_category: str
    description: Optional[str] = None
    risk_score: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Message Scam Scan Schemas ---
class MessageScanRequest(BaseModel):
    content: str = Field(..., min_length=5, description="The SMS, Email, or WhatsApp message text")

class MessageScanResponse(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str # 'Safe', 'Medium Risk', 'High Risk'
    scam_category: str
    confidence_score: int
    red_flags: List[str]
    explanation: str
    recommended_actions: List[str]

# --- URL Scan Schemas ---
class URLScanRequest(BaseModel):
    url: str = Field(..., description="Suspicious URL to analyze")

class URLScanResponse(BaseModel):
    url: str
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str
    domain_age_days: Optional[int] = None
    ssl_active: bool
    phish_detected: bool
    findings: List[str]
    recommendations: List[str]

# --- Audio Scan Schemas ---
class AudioScanResponse(BaseModel):
    transcript: str
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str
    scam_category: str
    explanation: str
    recommended_actions: List[str]

# --- Dashboard Stats Schemas ---
class StatCard(BaseModel):
    title: str
    value: str
    change: str
    type: str # 'positive', 'negative', 'neutral'

class CategoryDistribution(BaseModel):
    name: str # e.g. "Phishing"
    value: int # percentage or count

class DailyScanStat(BaseModel):
    date: str # e.g. "Mon"
    scans: int

class WeeklyReportStat(BaseModel):
    week: str # e.g. "Week 1"
    reports: int

class RecentReportItem(BaseModel):
    id: str
    scam_type: str
    target_value: str
    scam_category: str
    risk_score: int
    date: str

class TopReportedItem(BaseModel):
    rank: int
    value: str # domain or wallet address
    reports: int
    risk_score: int

class DashboardStatsResponse(BaseModel):
    stats_cards: List[StatCard]
    category_distribution: List[CategoryDistribution]
    daily_scans: List[DailyScanStat]
    weekly_reports: List[WeeklyReportStat]
    recent_reports: List[RecentReportItem]
    top_domains: List[TopReportedItem]
    top_wallets: List[TopReportedItem]
