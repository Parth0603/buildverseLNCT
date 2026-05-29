-- ScamRadar X Database Schema (Supabase/PostgreSQL Compatible)

-- Drop existing tables if they exist to allow clean reinstall
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS audio_scans CASCADE;
DROP TABLE IF EXISTS url_scans CASCADE;
DROP TABLE IF EXISTS message_scans CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS phone_numbers CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Aligned with Supabase Auth or standard PostgreSQL users)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) optionally for Supabase, but keep it standard SQL for pure compatibility.

-- 2. Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    scam_type TEXT NOT NULL CHECK (scam_type IN ('message', 'url', 'audio', 'phone', 'wallet', 'domain')),
    target_value TEXT NOT NULL,
    scam_category TEXT NOT NULL, -- 'Phishing', 'OTP Scam', 'Investment Scam', 'Crypto Scam', 'Job Scam', 'Bank Impersonation'
    description TEXT,
    risk_score INT DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Phone Numbers Reputation Table
CREATE TABLE phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    risk_score INT DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    report_count INT DEFAULT 0,
    last_reported_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Domains Reputation Table
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_name TEXT UNIQUE NOT NULL,
    risk_score INT DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    report_count INT DEFAULT 0,
    last_reported_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Wallets Reputation Table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    risk_score INT DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    report_count INT DEFAULT 0,
    last_reported_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. Message Scans Logging Table
CREATE TABLE message_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    scam_category TEXT,
    risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    red_flags TEXT[],
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. URL Scans Logging Table
CREATE TABLE url_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    domain_age_days INT,
    ssl_active BOOLEAN,
    phish_detected BOOLEAN,
    risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Audio Scans Logging Table
CREATE TABLE audio_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript TEXT NOT NULL,
    scam_category TEXT,
    risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Analytics/Threat Intelligence Table
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value INT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create performance indexes for search queries
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports (target_value);
CREATE INDEX IF NOT EXISTS idx_reports_scam_type ON reports (scam_type);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_num ON phone_numbers (phone_number);
CREATE INDEX IF NOT EXISTS idx_domains_name ON domains (domain_name);
CREATE INDEX IF NOT EXISTS idx_wallets_addr ON wallets (wallet_address);

-- Insert high quality startup-grade initial threat database/mock seed data
INSERT INTO phone_numbers (phone_number, risk_score, report_count) VALUES
('+18005550199', 95, 12),
('+919876543210', 85, 8),
('+442079460192', 40, 2),
('+13125550143', 98, 25);

INSERT INTO domains (domain_name, risk_score, report_count) VALUES
('secure-login-chase-update.info', 99, 42),
('metamask-wallet-support.cn', 98, 31),
('netflix-payment-renew.xyz', 92, 19),
('google.com', 0, 0),
('github.com', 0, 0);

INSERT INTO wallets (wallet_address, risk_score, report_count) VALUES
('0x71C7656EC7ab88b098defB751B7401B5f6d1476B', 98, 14),
('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfJH50s67', 95, 23),
('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 5, 0);

INSERT INTO reports (scam_type, target_value, scam_category, description, risk_score) VALUES
('url', 'secure-login-chase-update.info', 'Phishing', 'Fake Chase login panel prompting for card credentials and SSN.', 99),
('phone', '+18005550199', 'Bank Impersonation', 'Automated robo-call claiming security breach, prompting to share 6-digit OTP.', 95),
('wallet', '0x71C7656EC7ab88b098defB751B7401B5f6d1476B', 'Crypto Scam', 'Address associated with a fake Ethereum dual-deposit yield farming website.', 98),
('message', 'DEAR USER, YOUR NETFLIX ACCOUNT IS SUSPENDED. RE-VERIFY IMMEDIATELY AT netflix-renew.xyz', 'Phishing', 'SMS alert with urgent text prompting credential inputs.', 92);
