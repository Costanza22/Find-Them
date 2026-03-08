const { sql, ensureTables } = require('./db');
const { put } = require('@vercel/blob');

async function listSightings(limit, offset) {
  const { rows } = await sql`
    SELECT id, image_url, notes, location, created_at
    FROM sightings
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows.map((r) => ({ ...r, image_path: r.image_url }));
}

async function getSighting(id) {
  const { rows } = await sql`
    SELECT id, image_url, notes, location, created_at
    FROM sightings WHERE id = ${id}
  `;
  return rows[0] || null;
}

async function createSighting(attrs) {
  const { rows } = await sql`
    INSERT INTO sightings (image_url, notes, location)
    VALUES (${attrs.image_url}, ${attrs.notes}, ${attrs.location})
    RETURNING id, image_url, notes, location, created_at
  `;
  return rows[0];
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    await ensureTables();
  } catch (e) {
    console.error('ensureTables', e);
    return res.status(500).json({ error: 'Database not configured. Add Vercel Postgres to this project.' });
  }

  if (req.method === 'GET') {
    const id = req.query.id;
    if (id) {
      const sighting = await getSighting(id);
      if (!sighting) return res.status(404).json({ error: 'Sighting not found' });
      return res.status(200).json({ ...sighting, image_path: sighting.image_url });
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const list = await listSightings(limit, offset);
    return res.status(200).json(list);
  }

  if (req.method === 'POST') {
    const formidable = require('formidable');
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve([fields, files])));
    });
    const image = files.image?.[0] || files.image;
    if (!image || !image.mimetype?.startsWith('image/')) return res.status(400).json({ error: 'Image file required' });

    let image_url = null;
    try {
      const fs = require('fs');
      const buffer = await fs.promises.readFile(image.filepath);
      const blob = await put('sightings/' + Date.now() + '-' + (image.originalFilename || 'image'), buffer, {
        access: 'public',
      });
      image_url = blob.url;
    } catch (e) {
      console.error('Blob upload', e);
      return res.status(500).json({ error: 'File storage not configured. Add Vercel Blob to this project.' });
    }

    const notes = Array.isArray(fields.notes) ? fields.notes[0] : fields.notes;
    const location = Array.isArray(fields.location) ? fields.location[0] : fields.location;

    const sighting = await createSighting({
      image_url,
      notes: notes?.trim() || null,
      location: location?.trim() || null,
    });
    return res.status(201).json({ ...sighting, image_path: sighting.image_url, matches: [] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
