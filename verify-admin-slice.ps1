$ErrorActionPreference = "Stop"
$root = "C:\Users\Kudzanai\Documents\2025\App Developments\TrackHype"
$tmp = Join-Path $env:TEMP "th-gate"
if (-not (Test-Path -LiteralPath $tmp)) { New-Item -ItemType Directory -Path $tmp | Out-Null }

function Ascii-Sweep([string]$p) {
  $bytes = [IO.File]::ReadAllBytes($p)
  ($bytes | Where-Object { $_ -gt 127 }).Count
}

"=== GATE 1: js/admin-api.js — node --check ==="
node --check (Join-Path $root "js\admin-api.js") 2>&1
if ($LASTEXITCODE -eq 0) { "  OK: parses" } else { "  FAIL" }

""
"=== GATE 2: admin.html inline <script> blocks — node --check each (no src attr) ==="
$h = Get-Content -LiteralPath (Join-Path $root "admin.html") -Raw
$blocks = [regex]::Matches($h, '(?s)<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>')
$i = 0
foreach ($b in $blocks) {
  $code = $b.Groups[1].Value
  if (-not $code.Trim()) { continue }
  $i++
  $f = Join-Path $tmp ("admin-inline-{0}.js" -f $i)
  [IO.File]::WriteAllText($f, $code, (New-Object Text.UTF8Encoding($false)))
  node --check $f 2>&1
  if ($LASTEXITCODE -eq 0) { "  OK  inline block #{0} parses ({1} chars)" -f $i, $code.Length } else { "  FAIL inline block #{0}" -f $i }
}

""
"=== GATE 3: non-ASCII sweep (mojibake gate) — expect 0 in all three ==="
@("js\admin-api.js", "admin.html", "supabase\migrations\20260914_0009_pending_submission_admin.sql") | ForEach-Object {
  $p = Join-Path $root $_
  $n = Ascii-Sweep $p
  if ($n -eq 0) { "  OK   {0,-58} non-ascii=0" -f $_ } else { "  FAIL {0,-58} non-ascii={1}" -f $_, $n }
}

""
"=== GATE 4: view-column parity (admin.html renderPendingItem reads vs migration 0009 view emits) ==="
"  migration view columns: submission_id status payment_status payment_id review_notes submitted_at submitter_email artist_name song_title song_artwork"
"  admin-api.js select:"
Select-String -LiteralPath (Join-Path $root "js\admin-api.js") -Pattern 'from\("admin_pending_submissions"\)' | ForEach-Object { "    {0}: {1}" -f $_.LineNumber, $_.Line.Trim() }
