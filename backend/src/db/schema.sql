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

