import type {
  MessageScanResponse,
  URLScanResponse,
  AudioScanResponse,
  ReputationSearchResponse,
  ReportCreate,
  ReportResponse,
  DashboardStats
} from './types';

// Detect whether we are running inside Vercel or locally
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function analyzeMessage(content: string): Promise<MessageScanResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  if (!response.ok) {
    throw new Error('Failed to analyze message. Ensure your server is running.');
  }
  return response.json();
}

export async function analyzeUrl(url: string): Promise<URLScanResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!response.ok) {
    throw new Error('Failed to scan URL. Verify the server connection.');
  }
  return response.json();
}

export async function analyzeAudio(file: File): Promise<AudioScanResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/analyze-audio`, {
    method: 'POST',
    body: formData // Fetch sets content-type multipart/form-data automatically with correct boundary
  });
  if (!response.ok) {
    throw new Error('Failed to process and transcribe audio recording.');
  }
  return response.json();
}

export async function reportScam(report: ReportCreate): Promise<ReportResponse> {
  const response = await fetch(`${API_BASE_URL}/api/report-scam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  });
  if (!response.ok) {
    throw new Error('Failed to submit scam report to the threat database.');
  }
  return response.json();
}

export async function searchReputation(query: string, type?: string): Promise<ReputationSearchResponse> {
  const encodedQuery = encodeURIComponent(query);
  let url = `${API_BASE_URL}/api/search-reputation?query=${encodedQuery}`;
  if (type) {
    url += `&type=${encodeURIComponent(type)}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to query search parameters in databases.');
  }
  return response.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard-stats`);
  if (!response.ok) {
    throw new Error('Failed to load dashboard metrics.');
  }
  return response.json();
}
