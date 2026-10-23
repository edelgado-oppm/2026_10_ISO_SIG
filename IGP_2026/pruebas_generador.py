"""Pruebas del lector y los controles usando el Excel real, sin crear datos ficticios."""
import json, sys
from pathlib import Path
from generar_dashboards import source, reference_checks, safe_json, code

path=Path(sys.argv[1]); records,actions,validations,criteria,dictionary=source(path)
checks=reference_checks(records,actions)
assert all(c['estado']=='OK' for c in checks), checks
assert len({r['id_registro'] for r in records})==len(records)
for p in {r['proceso'] for r in records}:
    subset=[r for r in records if r['proceso']==p]; ids={r['id_registro'] for r in subset}
    payload={'records':subset,'actions':[a for a in actions if a['id_registro'] in ids],'validations':[a for a in validations if a['id_registro'] in ids]}
    assert json.loads(safe_json(payload))==payload
    assert all(a['id_registro'] in ids for a in payload['actions']+payload['validations'])
assert len({code(r['proceso']) for r in records})==17
assert code('Operaciones y Mantenimiento (volcanes)')!=code('Operaciones y Mantenimiento (VOLCANES)')
assert '\\u003c/script' in safe_json('</script>')
assert json.loads(safe_json('</script>'))=='</script>'
print('OK: controles reales, IDs, 17 ámbitos, relaciones y codificación segura sin pérdida de texto.')
