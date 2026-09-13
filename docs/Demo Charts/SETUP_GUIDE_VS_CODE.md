# TrackHype Chart Data Generation — VS Code Setup Guide

## Overview
This guide walks you through generating realistic chart history JSON data for your TrackHype music app using Claude Code in VS Code.

---

## Prerequisites

1. **VS Code installed** on your machine
2. **Claude Code extension** installed in VS Code
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
   - Search for "Claude Code"
   - Install the official Anthropic extension

3. **Claude API access** (or use claude.ai web interface)
   - If using Claude Code extension, ensure your API credentials are configured

---

## Step 1: Copy the Generation Prompt

You have two options:

### Option A: Use the Quick Paste Version (Recommended)
- Open the file `vscode_claude_code_prompt.txt`
- Copy the entire contents
- This is pre-formatted for Claude Code

### Option B: Use the Detailed Markdown Version
- Open the file `trackhype_chart_generation_prompt.md`
- Copy from the "How to Use in VS Code" section onwards
- More verbose but includes all background

---

## Step 2: Open Claude Code in VS Code

1. Open VS Code
2. Look for the Claude/Anthropic icon in the left sidebar
3. Click it to open the Claude Code panel
4. You should see a chat interface

**Alternatively:**
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
- Type "Claude Code: Open Chat"
- Press Enter

---

## Step 3: Paste the Prompt

1. Click in the chat input box at the bottom of the Claude Code panel
2. Paste the prompt you copied (from Step 1)
3. The prompt includes all necessary data:
   - Full song catalog
   - Chart types
   - Output format specifications
   - Generation rules

---

## Step 4: Run the Generation

1. Press Enter or click "Send" in the Claude Code interface
2. Claude will analyze the prompt and generate valid JSON
3. The generation typically takes 30-60 seconds

**Expected output:**
- A complete JSON array
- Contains all ~75 songs from your catalog
- Each song has 20+ weeks of history
- Properly formatted and valid

---

## Step 5: Save the JSON File

Once Claude finishes generating:

### Quick Save (Recommended)
1. Claude Code will likely offer a "Create File" or "Save" button
2. Click it
3. Name the file: `chart_history.json`
4. Choose location: project root or `/src/data/`

### Manual Save
1. Select all the JSON output (Claude will likely provide a copy button)
2. Create a new file in VS Code (`Ctrl+N` / `Cmd+N`)
3. Paste the JSON
4. Save as `chart_history.json` (`Ctrl+S` / `Cmd+S`)
5. Choose your project directory

---

## Step 6: Verify the Output

After saving, verify the JSON is valid:

### In VS Code:
1. Open `chart_history.json`
2. Check for any syntax errors (VS Code will highlight them)
3. Look for red squiggly lines — if none, the JSON is valid

### In Terminal (if you want to double-check):
```bash
# Navigate to your project directory
cd /path/to/your/project

# Validate JSON syntax
cat chart_history.json | python -m json.tool > /dev/null && echo "Valid JSON" || echo "Invalid JSON"
```

---

## Step 7: Integrate Into Your TrackHype App

Once the JSON is saved and validated:

1. **For React/JavaScript:**
   ```javascript
   import chartData from './chart_history.json';
   
   // Use in your component
   const charts = chartData;
   ```

2. **For other frameworks:**
   - Load the JSON file as needed
   - Parse it in your data layer
   - Feed it to your chart display components

3. **For Firebase/Database:**
   - Parse the JSON
   - Load each entry into your database
   - Index by song title and artist for lookups

---

## Troubleshooting

### Issue: Claude Code not showing in VS Code
- **Solution:** Reinstall Claude Code extension
  - Open Extensions (Ctrl+Shift+X / Cmd+Shift+X)
  - Search "Claude Code"
  - Uninstall, then reinstall

### Issue: "Permission denied" when saving
- **Solution:** Run VS Code with admin privileges, or save to a different directory

### Issue: JSON output has syntax errors
- **Solution:** Ask Claude Code to fix it
  - Copy the error message
  - Paste in Claude Code: "Fix this JSON error: [error message]"
  - Paste the broken JSON
  - Claude will provide corrected version

### Issue: Generation timeout (too long)
- **Solution:** Split the generation
  - Ask Claude to generate first 30 songs
  - Then request the remaining songs
  - Manually merge the JSON arrays

---

## What You'll Get

The generated `chart_history.json` will contain:

```json
[
  {
    "title": "Uhambo",
    "artist": "Andrea The Vocalist ft Aubrey Qwana",
    "chart": "Top 40 Chart",
    "genre": "Afro-Pop",
    "artwork": "Assets/charts/top_40_chart/1.jpg",
    "peak": 3,
    "weeks_on_chart": 18,
    "charts": 2,
    "history": [
      "Week 1 • Top 100 Chart List • 1240 votes",
      "Week 2 • Top 40 Chart • 1380 votes",
      "Week 3 • Top 40 Chart • 1490 votes",
      ... (15+ more weeks)
    ]
  },
  ... (74 more songs)
]
```

Each song includes:
- **Realistic peak positions** for their chart type
- **Varied weeks on chart** (1-24 weeks)
- **Multiple chart appearances** (1-5 different charts per song)
- **20+ week history** entries with natural vote fluctuations
- **Consistent artwork references** from your Assets folder

---

## Next Steps

After generation:
1. ✅ Validate the JSON
2. ✅ Integrate into your app
3. ✅ Test chart displays with real data
4. ✅ Iterate on the data (Claude can regenerate if needed)
5. ✅ Deploy with your app

---

## Need to Regenerate?

If you want to regenerate with different parameters:

1. Modify the prompt (change number of weeks, vote ranges, etc.)
2. Paste the modified prompt into Claude Code again
3. Claude will generate new data based on your changes

Example modifications:
- **More weeks per song:** Change "at least 20 weeks" to "at least 30 weeks"
- **Different vote ranges:** Change "800-2500 votes" to "2000-5000 votes"
- **Focus on specific genres:** Add genre-specific generation rules

---

## Questions?

If something doesn't work:
1. Check the troubleshooting section above
2. Review the prompt for any typos or missing data
3. Ensure you're using the latest Claude Code extension
4. Try generating a smaller subset first (10 songs vs all 75)

Happy charting! 🎵
