import json
from pathlib import Path

root = Path(r"c:\Users\Kudzanai\Documents\2025\App Developments\TrackHype")
out_path = root / "docs" / "Demo Charts" / "chart_history.json"
extra_path = root / "Additional Top 100 Songs.txt"

if not out_path.exists():
    raise FileNotFoundError(f"JSON file not found: {out_path}")

records = json.loads(out_path.read_text(encoding="utf-8"))
existing_titles = {item["title"].strip().lower() for item in records}

art_files = [
    "Assets/charts/top_40_chart/1.jpg",
    "Assets/charts/top_40_chart/2.jpg",
    "Assets/charts/top_40_chart/3.jpg",
    "Assets/charts/top_40_chart/4.jpg",
    "Assets/charts/top_40_chart/5.jpg",
    "Assets/charts/top_40_chart/6.jpg",
    "Assets/charts/top_40_chart/7.jpg",
    "Assets/charts/top_40_chart/8.jpg",
    "Assets/charts/top_40_chart/9.jpg",
    "Assets/charts/top_40_chart/10.jpg",
    "Assets/charts/top_40_chart/11.jpg",
    "Assets/charts/top_40_chart/12.jpg",
    "Assets/charts/top_40_chart/13.jpg",
    "Assets/charts/top_40_chart/14.jpg",
    "Assets/charts/top_40_chart/15.jpg",
    "Assets/charts/top_40_chart/16.jpg",
    "Assets/charts/top_40_chart/17.jpg",
    "Assets/charts/top_40_chart/18.jpg",
    "Assets/charts/top_40_chart/19.jpg",
    "Assets/charts/top_40_chart/20.jpg",
    "Assets/charts/top_25_local_hip_hop/1.jpg",
    "Assets/charts/top_25_local_hip_hop/2.jpg",
    "Assets/charts/top_25_local_hip_hop/3.jpg",
    "Assets/charts/top_25_local_hip_hop/4.jpg",
    "Assets/charts/top_25_local_hip_hop/5.jpg",
    "Assets/charts/top_25_local_hip_hop/6.jpg",
    "Assets/charts/top_25_local_hip_hop/7.jpg",
    "Assets/charts/top_25_local_hip_hop/8.jpg",
    "Assets/charts/top_25_local_hip_hop/9.jpg",
    "Assets/charts/top_25_local_hip_hop/10.jpg",
    "Assets/charts/top_25_local_hip_hop/11.jpg",
    "Assets/charts/top_25_local_hip_hop/12.jpg",
    "Assets/charts/top_25_local_hip_hop/13.jpg",
    "Assets/charts/top_25_local_hip_hop/14.jpg",
    "Assets/charts/top_25_local_hip_hop/15.jpg",
    "Assets/charts/top_25_local_hip_hop/16.jpg",
    "Assets/charts/top_25_local_hip_hop/17.jpg",
    "Assets/charts/top_25_local_hip_hop/18.jpg",
    "Assets/charts/top_20_house/1.jpg",
    "Assets/charts/top_20_house/2.jpg",
    "Assets/charts/top_20_house/3.jpg",
    "Assets/charts/top_20_house/4.jpg",
    "Assets/charts/top_20_house/5.jpg",
    "Assets/charts/top_20_house/6.jpg",
    "Assets/charts/top_20_house/7.jpg",
    "Assets/charts/top_20_house/8.jpg",
    "Assets/charts/top_20_house/9.jpg",
    "Assets/charts/top_20_house/10.jpg",
    "Assets/charts/top_20_rnb_chart/1.jpg",
    "Assets/charts/top_20_rnb_chart/2.jpg",
    "Assets/charts/top_20_rnb_chart/3.jpg",
    "Assets/charts/top_20_rnb_chart/4.jpg",
    "Assets/charts/top_20_rnb_chart/5.jpg",
    "Assets/charts/top_20_rnb_chart/6.jpg",
    "Assets/charts/top_20_rnb_chart/7.jpg",
    "Assets/charts/top_20_rnb_chart/8.jpg",
    "Assets/charts/top_20_rnb_chart/9.jpg",
    "Assets/charts/top_20_rnb_chart/10.jpg",
    "Assets/charts/top_20_rnb_chart/11.jpg",
    "Assets/charts/top_20_rnb_chart/12.jpg",
    "Assets/charts/top_20_rnb_chart/13.jpg",
    "Assets/charts/top_20_rnb_chart/14.jpg",
    "Assets/charts/top_20_rnb_chart/15.jpg",
    "Assets/charts/top_20_rnb_chart/16.jpg",
    "Assets/charts/top_20_rnb_chart/17.jpg",
    "Assets/charts/top_20_rnb_chart/18.jpg",
    "Assets/charts/top_20_rnb_chart/19.jpg",
    "Assets/charts/top_20_rnb_chart/20.jpg",
]

added = []
for line in extra_path.read_text(encoding="utf-8").splitlines():
    if not line.strip() or line.startswith("Song Title"):
        continue
    parts = [p.strip() for p in line.split("\t")]
    if len(parts) < 2:
        continue
    title, artist = parts[0], parts[1]
    if title.lower() in existing_titles:
        continue
    existing_titles.add(title.lower())
    art = art_files[(len(records) + len(added)) % len(art_files)]
    history = []
    for week in range(1, 21):
        votes = 880 + ((week * 109) + (len(added) * 37) + (len(title) * 13)) % 1800
        history.append(f"Week {week} • Top 100 Chart List • {votes} votes")
    added.append({
        "title": title,
        "artist": artist,
        "chart": "Top 100 Chart List",
        "genre": "Hip-Hop / Rap",
        "artwork": art,
        "peak": (len(added) % 99) + 1,
        "weeks_on_chart": 20,
        "charts": 1,
        "history": history,
    })

records.extend(added)

def real_artwork(project_root, art):
    if not art:
        return art
    full = project_root / art
    if full.exists():
        return art
    folder = full.parent
    if not folder.is_dir():
        return art
    for f in sorted(folder.iterdir()):
        if f.stem == full.stem and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
            return str(f.relative_to(project_root)).replace("\\", "/")
    return art

records = [dict(r, artwork=real_artwork(root, r.get("artwork", ""))) for r in records]

js_path = root / "docs" / "Demo Charts" / "chart_history-data.js"
header = "/* Generated from chart_history.json by expand_top100.py - do not edit by hand. */\nwindow.CHART_HISTORY = "
js_path.write_text(header + json.dumps(records, ensure_ascii=True, indent=2) + ";\n", encoding="utf-8")

out_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Added {len(added)} Top 100 entries. Total records: {len(records)}")
print(f"Wrote data scripts: {js_path}")
