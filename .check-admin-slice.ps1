$ErrorActionPreference = "Stop"
$root = "C:\Users\Kudzanai\Documents\2025\App Developments\TrackHype"

"=== 1) the exact line I just edited: admin-api.js L12 must now be `: null;` (byte-truth, not banner-truth) ==="
$l12 = (Get-Content -LiteralPath (Join-Path $root "js\admin-api.js"))[11]
"  L12 => '$l12'"
if ($l12 -match '\*\*' -or $l12 -notmatch ': null;') { "  FAIL: artifact still present or line not fixed." } else { "  OK: healthy `: null;`" }

""
"=== 2) node --check whole admin-api.js (real syntax gate) ==="
node --check (Join-Path $root "js\admin-api.js") 2>&1
if ($LASTEXITCODE -eq 0) { "  OK: js/admin-api.js parses" }

""
"=== 3) sweep ALL three new files for the `**` byte pattern (the exact mojibake/artifact class) ==="
$files = @(
  (Join-Path $root "js\admin-api.js"),
  (Join-Path $root "admin.html"),
  (Join-Path $root "supabase\migrations\20260914_0009_pending_submission_admin.sql")
)
foreach ($f in $files) {
  $raw = Get-Content -LiteralPath $f -Raw
  $hits = [regex]::Matches($raw, '\*\*')
  if ($hits.Count -eq 0) { "  OK  {0}: no `**` artifact" -f $_.Name } else { "  BAD {0}: {1} `**` hits" -f (Split-Path $f -Leaf), $hits.Count }
}
$rootCandidates = Get-ChildItem "C:\Users\Kudzanai\Documents" -Directory -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq "TrackHype" }
""
"=== 4) where does git think the repo is? (final root ground-truth, byte-exact) ==="
$rootCandidates | ForEach-Object { "  {0}" -f $_.FullName }
