const WORKER = 'https://affinity-api.chintana.workers.dev';

// Field IDs from IIMA Ventures Affinity list
const FIELDS = {
  460869: { name: 'Status',                type: 'dropdown' },
  460871: { name: 'CIIE Investment (INR)', type: 'number'   },
  451292: { name: 'Investment Date',       type: 'date'     },
  631054: { name: 'Post Money Valuation',  type: 'number'   },
  632189: { name: 'Current Stake',         type: 'text'     },
  546338: { name: 'CIIE Grant (INR)',      type: 'number'   },
  717575: { name: 'Exit Amount',           type: 'number'   },
  717576: { name: 'IRR',                   type: 'number'   },
  717595: { name: 'Multiplier',            type: 'number'   },
  509521: { name: 'Follow-On Raised (INR)',type: 'number'   },
  460870: { name: 'Owners',               type: 'person'   },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800');

  const { entity_id } = req.query;
  if (!entity_id) return res.status(400).json({ error: 'Missing entity_id' });

  try {
    const r    = await fetch(`${WORKER}/field-values?list_entry_id=${entity_id}`);
    const data = await r.json();

    const values = {};

    for (const fv of (Array.isArray(data) ? data : [])) {
      const fieldDef = FIELDS[fv.field_id];
      if (!fieldDef) continue;

      let val = null;

      if (fv.value !== null && fv.value !== undefined) {
        if (fieldDef.type === 'dropdown') {
          // value is an array of dropdown option objects
          val = Array.isArray(fv.value)
            ? fv.value.map(v => v.text || v).join(', ')
            : (fv.value.text || fv.value);
        } else if (fieldDef.type === 'date') {
          val = fv.value ? new Date(fv.value).toLocaleDateString('en-IN') : null;
        } else if (fieldDef.type === 'person') {
          val = Array.isArray(fv.value)
            ? fv.value.map(p => p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : p).join(', ')
            : fv.value;
        } else {
          val = fv.value;
        }
      }

      if (val !== null && val !== '' && val !== undefined) {
        values[fieldDef.name] = val;
      }
    }

    res.json({ entity_id, fields: values });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
