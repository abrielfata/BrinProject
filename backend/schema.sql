-- Supabase PostgreSQL Schema for Sentiment Analysis
-- Run this in your Supabase SQL Editor

-- Create sentiment_analysis table
CREATE TABLE IF NOT EXISTS sentiment_analysis (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    predicted_class VARCHAR(20) NOT NULL CHECK (predicted_class IN ('positive', 'negative', 'neutral')),
    confidence DECIMAL(6,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    positive_prob DECIMAL(6,4) NOT NULL CHECK (positive_prob >= 0 AND positive_prob <= 1),
    negative_prob DECIMAL(6,4) NOT NULL CHECK (negative_prob >= 0 AND negative_prob <= 1),
    neutral_prob DECIMAL(6,4) NOT NULL CHECK (neutral_prob >= 0 AND neutral_prob <= 1),
    source VARCHAR(50) DEFAULT 'web_analyzer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_sentiment_created_at ON sentiment_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sentiment_class ON sentiment_analysis(predicted_class);
CREATE INDEX IF NOT EXISTS idx_sentiment_source ON sentiment_analysis(source);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_sentiment_analysis_updated_at ON sentiment_analysis;
CREATE TRIGGER update_sentiment_analysis_updated_at
    BEFORE UPDATE ON sentiment_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) if needed
-- ALTER TABLE sentiment_analysis ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust as needed)
-- CREATE POLICY "Enable read access for all users" ON sentiment_analysis FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON sentiment_analysis FOR INSERT WITH CHECK (true);