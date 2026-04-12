const WORKER = 'https://affinity-api.chintana.workers.dev';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');

  try {
    const r    = await fetch(`${WORKER}/lists/51696/list-entries`);
    const data = await r.json();

    const companies = data
      .filter(e => e.entity?.name)
      .map(e => ({
        id:            e.entity_id,
        list_entry_id: e.id,
        name:          e.entity.name,
        domain:        e.entity.domain  || null,
        domains:       e.entity.domains || []
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ companies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
