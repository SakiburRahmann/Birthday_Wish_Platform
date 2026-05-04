-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  recipient_name TEXT NOT NULL,
  birthday_date DATE NOT NULL,
  theme_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create wishes table
CREATE TABLE wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  style JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime for wishes
ALTER PUBLICATION supabase_realtime ADD TABLE wishes;

-- Row Level Security (RLS) - For MVP, we'll allow public reads/writes
-- You can tighten this later with Auth
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public insert events" ON events FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read wishes" ON wishes FOR SELECT USING (true);
CREATE POLICY "Allow public insert wishes" ON wishes FOR INSERT WITH CHECK (true);
