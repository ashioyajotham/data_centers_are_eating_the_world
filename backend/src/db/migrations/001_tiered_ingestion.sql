-- Tiered ingestion: public map only shows verified DCs; harvested rows land in ingestion_candidates first.
-- Safe to run on existing DBs (idempotent column add).
-- Requires update_updated_at_column() from schema.sql; define here if missing.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

ALTER TABLE data_centers ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT true;
UPDATE data_centers SET verified = true WHERE verified IS NULL;
ALTER TABLE data_centers ALTER COLUMN verified SET DEFAULT true;
ALTER TABLE data_centers ALTER COLUMN verified SET NOT NULL;

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
CREATE INDEX IF NOT EXISTS idx_data_centers_verified ON data_centers (verified);

DROP TRIGGER IF EXISTS update_ingestion_candidates_updated_at ON ingestion_candidates;
CREATE TRIGGER update_ingestion_candidates_updated_at
    BEFORE UPDATE ON ingestion_candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
