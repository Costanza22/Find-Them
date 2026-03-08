const { sql } = require('@vercel/postgres');

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS missing_persons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      date_missing DATE,
      last_seen VARCHAR(500),
      contact_info VARCHAR(500),
      photo_url VARCHAR(1024),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sightings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      image_url VARCHAR(1024) NOT NULL,
      notes TEXT,
      location VARCHAR(500),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS matches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      missing_person_id UUID REFERENCES missing_persons(id),
      sighting_id UUID REFERENCES sightings(id),
      similarity_score FLOAT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(missing_person_id, sighting_id)
    )
  `;
}

module.exports = { sql, ensureTables };
