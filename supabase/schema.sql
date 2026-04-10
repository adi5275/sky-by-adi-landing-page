-- Sky by Adi Aharoni — Database Schema
-- פרוטוקול האיפוס: Lead capture & CRM

-- טבלת לידים (נשים שמילאו את טופס שיחת האיפיון)
CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  -- מידע בסיסי
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,

  -- מידע על הבת
  daughter_age      INT CHECK (daughter_age BETWEEN 10 AND 18),
  relationship_desc TEXT,       -- תיאור הדינמיקה ביניהן

  -- מקור הליד
  source      TEXT DEFAULT 'landing_page',  -- landing_page / instagram / referral
  utm_source  TEXT,
  utm_medium  TEXT,
  utm_campaign TEXT,

  -- סטטוס
  status      TEXT DEFAULT 'new'
              CHECK (status IN ('new', 'contacted', 'qualified', 'booked', 'closed', 'not_fit')),

  -- הערות פנימיות
  notes       TEXT,
  call_scheduled_at TIMESTAMPTZ
);

-- RLS: רק עדי רואה לידים
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authenticated users can view leads"
  ON leads FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert a lead"
  ON leads FOR INSERT
  WITH CHECK (true);

-- טבלת הזמנות (אחרי שיחת האיפיון — קנו)
CREATE TABLE IF NOT EXISTS bookings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID REFERENCES leads(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  -- פרטי החבילה
  package_type TEXT NOT NULL,   -- glow_up_bond_greece / cyprus / dubai
  travel_dates DATERANGE,
  total_price  NUMERIC(10,2),
  deposit_paid NUMERIC(10,2),

  -- סטטוס
  status      TEXT DEFAULT 'pending'
              CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),

  -- קובץ חוזה
  contract_url TEXT
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only authenticated users can manage bookings"
  ON bookings FOR ALL
  USING (auth.role() = 'authenticated');

-- Index לחיפוש מהיר
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_phone ON leads(phone);
