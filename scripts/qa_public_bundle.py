"""Run the public static-site validation used for the current local bundle."""
from pathlib import Path
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
report = ROOT / 'qa' / 'validation-79.json'
proc = subprocess.run([
    sys.executable, str(ROOT / 'scripts/validate_site.py'),
    '--site', str(ROOT / 'site'), '--report', str(report), '--pdf-scan'
], text=True, encoding='utf-8', capture_output=True)
print(proc.stdout, end='')
if proc.stderr:
    print(proc.stderr, file=sys.stderr, end='')
if proc.returncode:
    raise SystemExit(proc.returncode)
data = json.loads(report.read_text(encoding='utf-8-sig'))
assert data['status'] == 'passed'
assert data['books'] == 9 and data['chapters'] == 59 and data['videos'] == 79
assert data['errors'] == []
print(json.dumps({k: data[k] for k in ('status','books','chapters','videos','file_count','bytes','links_checked','pdfs_scanned')}, ensure_ascii=False))
