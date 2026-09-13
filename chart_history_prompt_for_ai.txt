# TrackHype Chart History Generation Prompt

## Task
Generate realistic historical chart data for the TrackHype music chart app using the provided song catalog and chart asset folders.

## Important Constraints
- Use ONLY songs from the provided catalog below
- Each song must have artwork from the project's existing chart asset folders:
  - Assets/charts/top_40_chart/
  - Assets/charts/top_25_local_hip_hop/
  - Assets/charts/top_20_house/
  - Assets/charts/top_20_rnb_chart/
- Songs can be shared across multiple charts
- Chart history must feel realistic and vary naturally
- Build at least 20 weeks of chart history per song

## Charts to Include
1. Top 100 Chart List
2. Zim Hip-Hop Top 20
3. Zimdancehall
4. Sungura
5. Gospel
6. Amapiano
7. Top 20 House
8. Top 20 RnB
9. Top 25 Local Hip-Hop
10. Top 40 Chart

## Song Catalog (CSV Format)

```
title,artist,genre,source,artwork
Uhambo,Andrea The Vocalist ft Aubrey Qwana,Afro-Pop,Demo Playlist,Assets/charts/top_40_chart/1.jpg
Inhliziyo Yami,Aphiwe & Sobancane,Afro-Pop,Demo Playlist,Assets/charts/top_40_chart/2.jpg
Sleepover,Denzel ft Skido, Hwiza, Micky Black,Afro-Pop,Demo Playlist,Assets/charts/top_40_chart/3.jpg
Mali,Dlala Thukzin ft Zee Nxumalo, Sykes,Afro-Pop,Demo Playlist,Assets/charts/top_40_chart/4.jpg
Different Breed,Hooksmith,Zim Hip Hop,Demo Playlist,Assets/charts/top_25_local_hip_hop/1.jpg
Bhura Dhanzi,Hulengende feat. Madedido,Zimdancehall,Demo Playlist,Assets/charts/top_40_chart/5.jpg
Muchaita Sei,Killer T,Sungura,Demo Playlist,Assets/charts/top_40_chart/6.jpg
Learn Shona,Learn Shona & Sane Wav,Afro-Pop,Demo Playlist,Assets/charts/top_40_chart/7.jpg
Ndiri Kushanda,Ndini Marshie,Afro-Pop,Demo Playlist,Assets/charts/top_40_chart/8.jpg
Pane Acha Chema,Nutty O ft Buffalo Souljah,Afro-Pop,Demo Playlist,Assets/charts/top_40_chart/9.jpg
Mudododo,Sugar Sugar,Afro-Pop,Demo Playlist,Assets/charts/top_40_chart/10.jpg
Mankalengkaleng Lyrics,A.T.I,Amapiano,Demo Playlist,Assets/charts/top_20_rnb_chart/1.jpg
Stimamolelo,ATI,Amapiano,Demo Playlist,Assets/charts/top_20_rnb_chart/2.jpg
Bo Lavo 10.9,Bukzin Keyz ft Felo Le Tee, Tman Xpress,Amapiano,Demo Playlist,Assets/charts/top_20_rnb_chart/3.jpg
Ngwana'a Batho,Charama Gal,Amapiano,Demo Playlist,Assets/charts/top_20_rnb_chart/4.jpg
Insecurities,Coster ft JujuBoy,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/5.jpg
Mmele Pelo Le Moya,DJ Ngwazi, Han C & Donald,Amapiano,Demo Playlist,Assets/charts/top_20_rnb_chart/6.jpg
Ama Gear,Dlala Thukzin, Funky QLA & Zee Nxumalo,House,Demo Playlist,Assets/charts/top_20_house/1.jpg
Dlala Thukzin,Dlala Thukzin, Zee Nxumalo,House,Demo Playlist,Assets/charts/top_20_house/2.jpg
Tjuele,Mpho Sebina ft A.T.I,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/7.jpg
Heh Heeh,Royal Musiq & W4de,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/8.jpg
You,Samantha Mogwe Ft. Sasa Klaas,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/9.jpg
Transition,Samantha Mogwe ft Zeus,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/10.jpg
Ama Hem Hem,Thatohatsi ft Sjava,Amapiano,Demo Playlist,Assets/charts/top_20_house/3.jpg
Remember,Tman Xpress & Mellow & Sleazy,House,Demo Playlist,Assets/charts/top_20_house/4.jpg
Ha Tholakale,Vee Mampeezy,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/11.jpg
Chomi Yaago,Wave Rhyder & Han-C,Amapiano,Demo Playlist,Assets/charts/top_20_house/5.jpg
Addictions,Brent Faiyaz,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/12.jpg
Burning Bridges,Drake,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/13.jpg
There's no Other,Felly,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/14.jpg
Recommend,Masego,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/15.jpg
Take My Space,Nimino,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/16.jpg
Don't You Know,Runway Richy ft Fetty Wap,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/17.jpg
Cocoanut Water,Trim,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/18.jpg
Slick,Victony,R&B,Demo Playlist,Assets/charts/top_20_rnb_chart/19.jpg
Broken Trophies,Wokeeyes,Zim Hip Hop,Demo Playlist,Assets/charts/top_25_local_hip_hop/2.jpg
Composer,Wokeeyes,Zim Hip Hop,Demo Playlist,Assets/charts/top_25_local_hip_hop/3.jpg
Dawning,Wokeeyes,Zim Hip Hop,Demo Playlist,Assets/charts/top_25_local_hip_hop/4.jpg
Donkno,Wokeeyes,Zim Hip Hop,Demo Playlist,Assets/charts/top_25_local_hip_hop/5.jpg
Halo,Wokeeyes,Zim Hip Hop,Demo Playlist,Assets/charts/top_25_local_hip_hop/6.jpg
Hold Over,Wokeeyes,Zim Hip Hop,Demo Playlist,Assets/charts/top_25_local_hip_hop/7.jpg
Lovin My Body,Wokeeyes,Zim Hip Hop,Demo Playlist,Assets/charts/top_25_local_hip_hop/8.jpg
Samson's Woes,Wokeeyes,Zim Hip Hop,Demo Playlist,Assets/charts/top_25_local_hip_hop/9.jpg
Stone Cold,Wokeeyes,Zim Hip Hop,Demo Playlist,Assets/charts/top_25_local_hip_hop/10.jpg
Come Again,Wokeeyes,Zim Hip Hop,Demo Playlist,Assets/charts/top_25_local_hip_hop/11.jpg
Mbare After Dark,Example Artist,Zim Hip Hop,App Catalog,Assets/charts/top_25_local_hip_hop/12.jpg
Night Bus,Example Artist,Zimdancehall,App Catalog,Assets/charts/top_40_chart/11.jpg
Golden Hour,Example Artist,Afro-Fusion,App Catalog,Assets/charts/top_40_chart/12.jpg
Homecoming,Example Artist,Sungura,App Catalog,Assets/charts/top_40_chart/13.jpg
As We Rise,Example Artist,Gospel Hip Hop,App Catalog,Assets/charts/top_40_chart/14.jpg
Kasi Motion,Example Artist,Amapiano,App Catalog,Assets/charts/top_20_house/6.jpg
uValo,JAZZWRLD,Afro-Fusion,App Catalog,Assets/charts/top_40_chart/15.jpg
Zim Dreams,Feli Nandi,Afro-Soul,App Catalog,Assets/charts/top_40_chart/16.jpg
Mambo,Mambo Dhuterere,Zimdancehall,App Catalog,Assets/charts/top_40_chart/17.jpg
Musarovha,Killer T,Zimdancehall,App Catalog,Assets/charts/top_40_chart/18.jpg
Worroro,Holy Ten,Zim Hip Hop,App Catalog,Assets/charts/top_25_local_hip_hop/13.jpg
Rokita,Killer T,Zimdancehall,App Catalog,Assets/charts/top_40_chart/19.jpg
Number Lelo,Killer T,Zimdancehall,App Catalog,Assets/charts/top_40_chart/20.jpg
Bleed,IKabod,Zim Hip Hop,App Catalog,Assets/charts/top_25_local_hip_hop/14.jpg
Makomana,Chikwata,Zim Hip Hop,App Catalog,Assets/charts/top_25_local_hip_hop/15.jpg
Dear Haters,Voltz JT,Urban Grooves,App Catalog,Assets/charts/top_40_chart/21.jpg
Floeky,Junior Music,Amapiano,App Catalog,Assets/charts/top_20_house/7.jpg
John Vuli Gate,Voltz JT,Amapiano,App Catalog,Assets/charts/top_20_house/8.jpg
Nhaka Yedu,Feli Nandi,Afro-Soul,App Catalog,Assets/charts/top_40_chart/22.jpg
Ropa Dzangu,Feli Nandi,Afro-Fusion,App Catalog,Assets/charts/top_40_chart/23.jpg
Zvakaitika,Somandla Ndebele,Imbube,App Catalog,Assets/charts/top_40_chart/24.jpg
Nkande,MT Tinashe,Amapiano,App Catalog,Assets/charts/top_20_house/9.jpg
Tsano Wangu,MT Tinashe,Zim Hip Hop,App Catalog,Assets/charts/top_25_local_hip_hop/16.jpg
Yewo,MT Tinashe,Afro-Pop,App Catalog,Assets/charts/top_40_chart/25.jpg
Heat Free,Hwinza,Zim Hip Hop,App Catalog,Assets/charts/top_25_local_hip_hop/17.jpg
Season Maroja,Hwinza,Zim Hip Hop,App Catalog,Assets/charts/top_25_local_hip_hop/18.jpg
```

## Output Format

Return a JSON array of objects. Each object must follow this exact structure:

```json
{
  "title": "Song title",
  "artist": "Artist name",
  "chart": "Primary Chart name",
  "genre": "Genre",
  "artwork": "Assets/charts/.../image.jpg",
  "peak": 1,
  "weeks_on_chart": 14,
  "charts": 3,
  "history": [
    "Week 1 • Top 100 Chart List • 1240 votes",
    "Week 2 • Top 40 Chart • 1380 votes",
    "Week 3 • Zim Hip-Hop Top 20 • 1490 votes"
  ]
}
```

## Rules for Data Generation

1. **Peak Position**: Must be realistic for the chart type
   - Top 20 charts: peaks between 1–20
   - Top 25 charts: peaks between 1–25
   - Top 40 charts: peaks between 1–40
   - Top 100 charts: peaks between 1–100

2. **Weeks on Chart**: Typically 1–24 weeks for realistic charting

3. **Charts Count**: 1–5 depending on how many charts the song is active on

4. **History Entries**: Minimum 20 week entries per song when possible

5. **Chart Distribution**: Keep a believable mix of chart names across history entries

6. **Consistency**: Each song can appear in multiple charts, but maintain consistent metadata across entries

7. **Vote Counts**: Realistic range 800–2500 votes per week, varying naturally

8. **Genre Alignment**: Match chart selection to song genre (e.g., Hip Hop songs appear in Hip-Hop charts)

## Output Requirements

- Return **valid JSON only** — no commentary, no Markdown fences, no explanations
- Ensure all songs from the catalog are included
- Each song should have at least 20 weeks of history
- Sort or structure chronologically where possible
- The JSON must be properly formatted and parseable

---

## How to Use in VS Code with Claude Code

1. Open VS Code
2. Open the Claude Code extension
3. Paste the entire content of this prompt into the Claude Code chat
4. Wait for Claude to generate the JSON
5. Save the output as `chart_history.json` in your project root
6. Use this JSON to populate your TrackHype app's chart data

The output will be a complete, ready-to-use JSON file with all songs and their complete chart histories.
