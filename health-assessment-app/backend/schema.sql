-- Health Assessment Database Schema for Supabase PostgreSQL

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id BIGSERIAL PRIMARY KEY,
    health_score DECIMAL(5,2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    category_scores JSONB,
    recommendations JSONB,
    answers JSONB,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);

-- Create index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);

-- Create index on risk_level for analytics
CREATE INDEX IF NOT EXISTS idx_assessments_risk_level ON assessments(risk_level);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (adjust based on your auth needs)
CREATE POLICY "Allow all operations on assessments" ON assessments
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: Create a view for assessment summaries
CREATE OR REPLACE VIEW assessment_summaries AS
SELECT 
    id,
    health_score,
    risk_level,
    created_at,
    DATE_TRUNC('day', created_at) as assessment_date
FROM assessments
ORDER BY created_at DESC;

-- Insert sample data for testing (optional)
INSERT INTO assessments (health_score, risk_level, category_scores, recommendations, answers)
VALUES 
    (
        75.5,
        'Low',
        '{"Sleep": 80, "Exercise": 75, "Stress": 70, "Nutrition": 85, "Medical": 90}',
        '[{"title": "Maintain Your Routine", "description": "Keep up your excellent health habits!"}]',
        '{"1": {"value": "7_to_8", "label": "7-8 hours", "score": 0}}'
    ),
    (
        55.2,
        'Moderate',
        '{"Sleep": 60, "Exercise": 50, "Stress": 55, "Nutrition": 65, "Medical": 70}',
        '[{"title": "Improve Sleep Quality", "description": "Aim for 7-8 hours of quality sleep each night."}]',
        '{"1": {"value": "5_to_6", "label": "5-6 hours", "score": 2}}'
    );

-- Comments for documentation
COMMENT ON TABLE assessments IS 'Stores health assessment results and recommendations';
COMMENT ON COLUMN assessments.health_score IS 'Overall health score (0-100)';
COMMENT ON COLUMN assessments.risk_level IS 'Risk level: Low, Moderate, or High';
COMMENT ON COLUMN assessments.category_scores IS 'JSON object containing scores for each health category';
COMMENT ON COLUMN assessments.recommendations IS 'JSON array of personalized health recommendations';
COMMENT ON COLUMN assessments.answers IS 'JSON object containing user answers to assessment questions';
