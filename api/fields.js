const WORKER = 'https://affinity-api.chintana.workers.dev';

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

    // Response is a plain array
    const rows = Array.isArray(data) ? data : [];
    const values = {};

    for (const fv of rows) {
      const fieldDef = FIELDS[fv.field_id];
      if (!fieldDef) continue;
      if (fv.value === null || fv.value === undefined) continue;

      let val = null;

      if (fieldDef.type === 'dropdown') {
        // value can be object {text:...} or array of such objects
        if (Array.isArray(fv.value)) {
          val = fv.value.map(v => v.text || v).join(', ');
        } else if (typeof fv.value === 'object') {
          val = fv.value.text || JSON.stringify(fv.value);
        } else {
          val = fv.value;
        }
      } else if (fieldDef.type === 'date') {
        val = new Date(fv.value).toLocaleDateString('en-IN');
     } else if (fieldDef.type === 'person') 
  if (Array.isArray(fv.value)) {
    val = fv.value.map(p => p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : String(p)).join(', ');
  } else if (typeof fv.value === 'object' && fv.value?.first_name) {
    val = `${fv.value.first_name} ${fv.value.last_name || ''}`.trim();
  } else {
    // It's just an ID — skip it for now
    continue;
  }
      } else {
        val = fv.value;
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
