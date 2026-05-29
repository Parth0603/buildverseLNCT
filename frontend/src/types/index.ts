export interface MessageScanResponse {
  risk_score: number;
  risk_level: 'Safe' | 'Medium Risk' | 'High Risk';
  scam_category: string;
  confidence_score: number;
  red_flags: string[];
  explanation: string;
  recommended_actions: string[];
}

export interface URLScanResponse {
  url: string;
  risk_score: number;
  risk_level: 'Safe' | 'Medium Risk' | 'High Risk';
  domain_age_days?: number;
  ssl_active: boolean;
  phish_detected: boolean;
  findings: string[];
  recommendations: string[];
}

export interface AudioScanResponse {
  transcript: string;
  risk_score: number;
  risk_level: 'Safe' | 'Medium Risk' | 'High Risk';
  scam_category: string;
  explanation: string;
  recommended_actions: string[];
}

export interface ReputationSearchResponse {
  query: string;
  type: 'phone' | 'domain' | 'wallet' | 'unknown';
  report_count: number;
  risk_score: number;
  risk_level: 'Safe' | 'Medium Risk' | 'High Risk';
  last_reported_at?: string;
  timeline?: { scam_category: string; risk_score: number; date: string }[];
  insights?: string;
}

export interface ReportCreate {
  scam_type: 'message' | 'url' | 'audio' | 'phone' | 'wallet' | 'domain';
  target_value: string;
  scam_category: string;
  description?: string;
  risk_score: number;
}

export interface ReportResponse {
  id: string;
  reporter_id?: string;
  scam_type: string;
  target_value: string;
  scam_category: string;
  description?: string;
  risk_score: number;
  created_at: string;
}

export interface StatCard {
  title: string;
  value: string;
  change: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface CategoryDistribution {
  name: string;
  value: number;
}

export interface DailyScanStat {
  date: string;
  scans: number;
}

export interface WeeklyReportStat {
  week: string;
  reports: number;
}

export interface RecentReportItem {
  id: string;
  scam_type: string;
  target_value: string;
  scam_category: string;
  risk_score: number;
  date: string;
}

export interface TopReportedItem {
  rank: number;
  value: string;
  reports: number;
  risk_score: number;
}

export interface DashboardStats {
  stats_cards: StatCard[];
  category_distribution: CategoryDistribution[];
  daily_scans: DailyScanStat[];
  weekly_reports: WeeklyReportStat[];
  recent_reports: RecentReportItem[];
  top_domains: TopReportedItem[];
  top_wallets: TopReportedItem[];
}
