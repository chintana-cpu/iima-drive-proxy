const WORKER = 'https://affinity-api.chintana.workers.dev';

const FIELDS = {
  460869: { name: 'Status',                 type: 'dropdown' },
  460871: { name: 'CIIE Investment (INR)',  type: 'number'   },
  451292: { name: 'Investment Date',        type: 'date'     },
  631054: { name: 'Post Money Valuation',   type: 'number'   },
  632189: { name: 'Current Stake',          type: 'text'     },
  546338: { name: 'CIIE Grant (INR)',       type: 'number'   },
  717575: { name: 'Exit Amount',            type: 'number'   },
  717576: { name: 'IRR',                    type: 'number'   },
  717595: { name: 'Multiplier',             type: 'number'   },
  509521: { name: 'Follow-On Raised (INR)', type: 'number'   },
  460870: { name: 'Owners',                 type: 'person'   },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800');

  const { entity_id } = req.query;
  if (!entity_id) return res.status(400).json({ error: 'Missing entity_id' });

  try {
    const r    = await fetch(`${WORKER}/field-values?list_entry_id=${entity_id}`);
    const data = await r.json();
    const rows = Array.isArray(data) ? data : [];
    const values = {};

    for (const fv of rows) {
      const fieldDef = FIELDS[fv.field_id];
      if (!fieldDef) continue;
      if (fv.value === null || fv.value === undefined) continue;

      let val = null;

      if (fieldDef.type === 'dropdown') {
        if (Array.isArray(fv.value)) {
          val = fv.value.map(v => v.text || v).join(', ');
        } else if (typeof fv.value === 'object') {
          val = fv.value.text || JSON.stringify(fv.value);
        } else {
          val = fv.value;
        }

      } else if (fieldDef.type === 'date') {
        val = new Date(fv.value).toLocaleDateString('en-IN');

      } else if (fieldDef.type === 'number' || fieldDef.type === 'text') {
        val = fv.value;

      } else if (fieldDef.type === 'person') {
        const resolvePersonId = async (id) => {
          try {
            const pr = await fetch(`${WORKER}/persons/${id}`);
            const pd = await pr.json();
            return pd.first_name ? `${pd.first_name} ${pd.last_name || ''}`.trim() : null;
          } catch {
            return null;
          }
        };

        if (Array.isArray(fv.value)) {
          const names = await Promise.all(
            fv.value.map(p => {
              if (p?.first_name) return `${p.first_name} ${p.last_name || ''}`.trim();
              if (typeof p === 'number') return resolvePersonId(p);
              return null;
            })
          );
          val = names.filter(Boolean).join(', ') || null;

        } else if (typeof fv.value === 'object' && fv.value?.first_name) {
          val = `${fv.value.first_name} ${fv.value.last_name || ''}`.trim();

        } else if (typeof fv.value === 'number') {
          val = await resolvePersonId(fv.value);
        }
      }

      if (val !== null) values[fieldDef.name] = val;  // ← the fix
    }

    res.json({ entity_id, fields: values });           // ← now reachable
  } catch (e
