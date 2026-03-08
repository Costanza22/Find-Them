const { sql, ensureTables } = require('./db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await ensureTables();
  } catch (e) {
    console.error('ensureTables', e);
    return res.status(500).json({ error: 'Database not configured. Add Vercel Postgres to this project.' });
  }

  const sighting_id = req.query.sighting_id;
  const missing_person_id = req.query.missing_person_id;
  const min_score = parseFloat(req.query.min_score);
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
  const offset = parseInt(req.query.offset, 10) || 0;

  let result;
  if (sighting_id && missing_person_id) {
    result = await sql`
      SELECT m.id, m.missing_person_id, m.sighting_id, m.similarity_score, m.created_at,
             mp.name AS mp_name, mp.photo_url AS mp_photo_url,
             s.image_url AS s_image_url, s.created_at AS s_created_at
      FROM matches m
      JOIN missing_persons mp ON mp.id = m.missing_person_id
      JOIN sightings s ON s.id = m.sighting_id
      WHERE m.sighting_id = ${sighting_id} AND m.missing_person_id = ${missing_person_id}
      ORDER BY m.similarity_score DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (sighting_id) {
    result = await sql`
      SELECT m.id, m.missing_person_id, m.sighting_id, m.similarity_score, m.created_at,
             mp.name AS mp_name, mp.photo_url AS mp_photo_url,
             s.image_url AS s_image_url, s.created_at AS s_created_at
      FROM matches m
      JOIN missing_persons mp ON mp.id = m.missing_person_id
      JOIN sightings s ON s.id = m.sighting_id
      WHERE m.sighting_id = ${sighting_id}
      ORDER BY m.similarity_score DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (missing_person_id) {
    result = await sql`
      SELECT m.id, m.missing_person_id, m.sighting_id, m.similarity_score, m.created_at,
             mp.name AS mp_name, mp.photo_url AS mp_photo_url,
             s.image_url AS s_image_url, s.created_at AS s_created_at
      FROM matches m
      JOIN missing_persons mp ON mp.id = m.missing_person_id
      JOIN sightings s ON s.id = m.sighting_id
      WHERE m.missing_person_id = ${missing_person_id}
      ORDER BY m.similarity_score DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    result = await sql`
      SELECT m.id, m.missing_person_id, m.sighting_id, m.similarity_score, m.created_at,
             mp.name AS mp_name, mp.photo_url AS mp_photo_url,
             s.image_url AS s_image_url, s.created_at AS s_created_at
      FROM matches m
      JOIN missing_persons mp ON mp.id = m.missing_person_id
      JOIN sightings s ON s.id = m.sighting_id
      ORDER BY m.similarity_score DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  let rows = result.rows || [];
  if (!isNaN(min_score)) rows = rows.filter((r) => parseFloat(r.similarity_score) >= min_score);

  const matches = rows.map((r) => ({
    id: r.id,
    missing_person_id: r.missing_person_id,
    sighting_id: r.sighting_id,
    similarity_score: parseFloat(r.similarity_score),
    created_at: r.created_at,
    missing_person: {
      id: r.missing_person_id,
      name: r.mp_name,
      photo_url: r.mp_photo_url,
    },
    sighting: {
      id: r.sighting_id,
      image_url: r.s_image_url,
      uploadedAt: r.s_created_at,
    },
  }));

  return res.status(200).json({ matches });
};
