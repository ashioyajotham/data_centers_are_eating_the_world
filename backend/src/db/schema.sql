-- Data Centers table
CREATE TABLE IF NOT EXISTS data_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    operator VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('operational', 'planned', 'under-construction', 'decommissioned')),
    ownership_type VARCHAR(50) NOT NULL CHECK (ownership_type IN ('local', 'foreign', 'joint-venture')),
    power_capacity_mw DECIMAL(10, 2),
    floor_space_sqm DECIMAL(12, 2),
    rack_count INTEGER,
    year_established INTEGER,
    tier_rating VARCHAR(20),
    certifications TEXT[],
    connectivity TEXT[],
    verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_center_id UUID REFERENCES data_centers(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scrape logs table
CREATE TABLE IF NOT EXISTS scrape_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name VARCHAR(255) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
    records_found INTEGER DEFAULT 0,
    records_new INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_centers_country ON data_centers(country);
CREATE INDEX IF NOT EXISTS idx_data_centers_status ON data_centers(status);
CREATE INDEX IF NOT EXISTS idx_data_centers_ownership ON data_centers(ownership_type);
CREATE INDEX IF NOT EXISTS idx_sources_data_center ON sources(data_center_id);
CREATE INDEX IF NOT EXISTS idx_data_centers_verified ON data_centers (verified);

-- Harvested rows awaiting admin promotion (Tier B+; Kenya-focused in application layer)
CREATE TABLE IF NOT EXISTS ingestion_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
    source_system VARCHAR(64) NOT NULL,
    external_id TEXT NOT NULL,
    country_scope VARCHAR(100) NOT NULL DEFAULT 'Kenya',
    candidate_payload JSONB NOT NULL,
    raw_payload JSONB,
    source_urls TEXT[] NOT NULL DEFAULT '{}',
    confidence SMALLINT NOT NULL DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
    merged_data_center_id UUID REFERENCES data_centers(id) ON DELETE SET NULL,
    resolution_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (source_system, external_id)
);

CREATE INDEX IF NOT EXISTS idx_ingestion_candidates_status ON ingestion_candidates (status);
CREATE INDEX IF NOT EXISTS idx_ingestion_candidates_created ON ingestion_candidates (created_at DESC);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_data_centers_updated_at
    BEFORE UPDATE ON data_centers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingestion_candidates_updated_at
    BEFORE UPDATE ON ingestion_candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Admin auth (singleton row; password is bcrypt hash, never plaintext)
CREATE TABLE IF NOT EXISTS admin_auth (
    singleton SMALLINT PRIMARY KEY CHECK (singleton = 1),
    password_hash TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_auth (singleton, password_hash)
VALUES (1, NULL)
ON CONFLICT (singleton) DO NOTHING;

