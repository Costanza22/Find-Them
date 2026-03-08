const { sql, ensureTables } = require('./db');
const { put } = require('@vercel/blob');

async function listMissingPersons(limit = 50, offset = 0) {
  const { rows } = await sql`
    SELECT id, name, description, date_missing, last_seen, contact_info, photo_url, created_at
    FROM missing_persons
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    date_missing: r.date_missing,
    last_seen: r.last_seen,
    contact_info: r.contact_info,
    photo_url: r.photo_url,
    photo_path: r.photo_url,
    created_at: r.created_at,
  }));
}

async function getMissingPerson(id) {
  const { rows } = await sql`
    SELECT id, name, description, date_missing, last_seen, contact_info, photo_url, created_at
    FROM missing_persons WHERE id = ${id}
  `;
  return rows[0] || null;
}

async function createMissingPerson({ name, description, date_missing, last_seen, contact_info, photo_url }) {
  const { rows } = await sql`
    INSERT INTO missing_persons (name, description, date_missing, last_seen, contact_info, photo_url)
    VALUES (${name}, ${description}, ${date_missing}, ${last_seen}, ${contact_info}, ${photo_url})
    RETURNING id, name, description, date_missing, last_seen, contact_info, photo_url, created_at
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
      const person = await getMissingPerson(id);
      if (!person) return res.status(404).json({ error: 'Missing person not found' });
      return res.status(200).json({ ...person, photo_path: person.photo_url });
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const list = await listMissingPersons(limit, offset);
    return res.status(200).json(list);
  }

  if (req.method === 'POST') {
    const formidable = require('formidable');
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve([fields, files])));
    });
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    const photo = files.photo?.[0] || files.photo;
    if (!photo || !photo.mimetype?.startsWith('image/')) return res.status(400).json({ error: 'Photo file required' });

    let photo_url = null;
    try {
      const fs = require('fs');
      const buffer = await fs.promises.readFile(photo.filepath);
      const blob = await put(`missing_persons/${Date.now()}-${photo.originalFilename || 'photo'}`, buffer, {
        access: 'public',
      });
      photo_url = blob.url;
    } catch (e) {
      console.error('Blob upload', e);
      return res.status(500).json({ error: 'File storage not configured. Add Vercel Blob to this project.' });
    }

    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const date_missing = Array.isArray(fields.date_missing) ? fields.date_missing[0] : fields.date_missing;
    const last_seen = Array.isArray(fields.last_seen) ? fields.last_seen[0] : fields.last_seen;
    const contact_info = Array.isArray(fields.contact_info) ? fields.contact_info[0] : fields.contact_info;

    const person = await createMissingPerson({
      name: name.trim(),
      description: description?.trim() || null,
      date_missing: date_missing || null,
      last_seen: last_seen?.trim() || null,
      contact_info: contact_info?.trim() || null,
      photo_url,
    });
    return res.status(201).json({ ...person, photo_path: person.photo_url });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
