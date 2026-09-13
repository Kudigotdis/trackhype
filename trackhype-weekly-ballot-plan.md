# TrackHype Weekly Ballot System – Implementation Plan

## Overview
Migrate from **daily single-vote (24h cadence)** to **weekly top-10 ballot (Sunday reset)** with historical chart archives and movement tracking.

---

## Part 1: State & Storage Schema

### Current (Existing)
```javascript
// Single vote per chart per day
{
  id: "vote-1692374400000",
  chartKey: "charts/trending",
  date: "2026-08-30",
  songId: "song123",
  songTitle: "...",
  fromRank: 8,
  targetPos: 3,
  points: 18  // pointsForPosition: 21 - targetPos
}
```

### New (Weekly Ballot)
```javascript
// Ballot: one submission per chart per week
{
  id: "ballot-1692374400000",
  chartKey: "charts/trending",
  weekKey: "2026-W35",           // NEW: ISO week identifier
  timestamp: Date.now(),
  picks: [                        // NEW: array of ranked picks
    { songId: "song123", rank: 1, title: "...", points: 10 },
    { songId: "song456", rank: 2, title: "...", points: 9 },
    // ... up to 10 picks
  ],
  submittedAt: Date.now()
}

// Archive snapshot (generated at week boundary)
{
  id: "snapshot-2026-W35",
  chartKey: "charts/trending",
  weekKey: "2026-W35",
  publishedAt: Date.now(),
  rankings: [
    { 
      rank: 1, 
      songId: "song123", 
      title: "...",
      totalPoints: 450,        // Aggregated from all ballots
      movement: "+3",          // vs. last week
      newEntry: false,
      peakRank: 1
    },
    // ... 20 positions
  ]
}

// Draft ballot (in-progress, unsaved)
{
  chartKey: "charts/trending",
  weekKey: "2026-W35",
  picks: [
    { songId: "song123", rank: 1 },
    { songId: "song456", rank: 2 },
    // ... partial, 1-10 picks
  ],
  lastModified: Date.now()
}
```

### localStorage Keys
```
// All ballots for a chart (history)
"trackhype:ballots_<chartKey>" → Array<ballot>

// Current draft for a chart
"trackhype:draft_<chartKey>" → draftBallot

// Archived snapshots (read-only)
"trackhype:snapshots_<chartKey>" → Array<snapshot>

// User metadata
"trackhype:user_weeksSeen" → { chartKey: "2026-W35", ... }
```

---

## Part 2: Core Helper Functions

Add these to **trackhype.js** (replace/supplement existing helpers):

### Date & Week Utilities

```javascript
/**
 * Generate ISO 8601 week key: "2026-W35"
 * Based on Thursday-relative week numbering (ISO 8601)
 */
function currentWeekKey() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  
  // Set to nearest Thursday
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Get exact timestamp for next Sunday midnight UTC
 * Used for countdown timer
 */
function getNextSundayReset() {
  const now = new Date();
  const nextSunday = new Date(now);
  const day = now.getUTCDay();
  const daysUntilSunday = (day === 0) ? 7 : 7 - day;
  
  nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
  nextSunday.setUTCHours(0, 0, 0, 0); // Midnight UTC
  
  return nextSunday.getTime();
}

/**
 * Convert week key to human-readable date range
 * "2026-W35" → "Aug 24–30"
 */
function weekKeyToDateRange(weekKey) {
  const [year, week] = weekKey.split('-W').map(Number);
  const jan4 = new Date(year, 0, 4);
  const weekStart = new Date(jan4);
  
  weekStart.setDate(jan4.getDate() - jan4.getDay() + 1);
  weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const monthStart = jan4.toLocaleString('en-US', { month: 'short' });
  const dateStart = weekStart.getDate();
  const monthEnd = weekEnd.toLocaleString('en-US', { month: 'short' });
  const dateEnd = weekEnd.getDate();
  
  return monthStart === monthEnd 
    ? `${monthStart} ${dateStart}–${dateEnd}`
    : `${monthStart} ${dateStart} – ${monthEnd} ${dateEnd}`;
}
```

### Ballot Management

```javascript
/**
 * Load all ballots for a chart from localStorage
 */
function getBallotHistory(chartKey) {
  const key = `trackhype:ballots_${chartKey}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Check if user has already submitted a ballot for this week
 */
function hasVotedThisWeek(chartKey) {
  const ballots = getBallotHistory(chartKey);
  const thisWeek = currentWeekKey();
  
  return ballots.some(b => b.weekKey === thisWeek);
}

/**
 * Get current draft ballot for a chart
 */
function getDraftBallot(chartKey) {
  const key = `trackhype:draft_${chartKey}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : { chartKey, weekKey: currentWeekKey(), picks: [] };
}

/**
 * Save draft ballot (in-progress)
 */
function saveDraftBallot(chartKey, picks) {
  const key = `trackhype:draft_${chartKey}`;
  const draft = {
    chartKey,
    weekKey: currentWeekKey(),
    picks,
    lastModified: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(draft));
}

/**
 * Submit final ballot for this week
 * Returns true if successful, throws if already voted or invalid
 */
function submitWeeklyBallot(chartKey, picks) {
  if (hasVotedThisWeek(chartKey)) {
    throw new Error("You have already submitted your ballot for this week.");
  }
  
  if (picks.length !== 10) {
    throw new Error(`Ballot must have exactly 10 picks. You have ${picks.length}.`);
  }
  
  // Validate ranks 1–10 used exactly once
  const ranks = picks.map(p => p.rank).sort((a, b) => a - b);
  if (!ranks.every((r, i) => r === i + 1)) {
    throw new Error("Picks must use ranks 1–10 exactly once.");
  }
  
  const ballot = {
    id: `ballot-${Date.now()}`,
    chartKey,
    weekKey: currentWeekKey(),
    timestamp: Date.now(),
    picks: picks.map(p => ({
      songId: p.songId,
      rank: p.rank,
      title: p.title,
      points: 11 - p.rank  // 10 points for rank 1, 1 for rank 10
    })),
    submittedAt: Date.now()
  };
  
  // Append to history
  const key = `trackhype:ballots_${chartKey}`;
  const ballots = getBallotHistory(chartKey);
  ballots.push(ballot);
  localStorage.setItem(key, JSON.stringify(ballots));
  
  // Clear draft
  localStorage.removeItem(`trackhype:draft_${chartKey}`);
  
  // Dispatch event
  document.dispatchEvent(new CustomEvent('trackhype:ballot-submitted', { 
    detail: { chartKey, weekKey: ballot.weekKey, ballot } 
  }));
  
  return ballot;
}

/**
 * Clear draft for a chart (used on submit or cancel)
 */
function clearDraftBallot(chartKey) {
  localStorage.removeItem(`trackhype:draft_${chartKey}`);
}
```

### Aggregation & Snapshots

```javascript
/**
 * Aggregate all ballots for a chart and return rankings
 * Called at week boundary or on-demand for display
 */
function aggregateBallots(chartKey, weekKey) {
  const ballots = getBallotHistory(chartKey).filter(b => b.weekKey === weekKey);
  
  if (ballots.length === 0) {
    return [];
  }
  
  // Sum points per song
  const songScores = {};
  ballots.forEach(ballot => {
    ballot.picks.forEach(pick => {
      if (!songScores[pick.songId]) {
        songScores[pick.songId] = { 
          title: pick.title, 
          totalPoints: 0, 
          votes: 0 
        };
      }
      songScores[pick.songId].totalPoints += pick.points;
      songScores[pick.songId].votes += 1;
    });
  });
  
  // Sort and assign ranks
  const rankings = Object.entries(songScores)
    .map(([songId, data]) => ({
      songId,
      title: data.title,
      totalPoints: data.totalPoints,
      voteCount: data.votes,
      pickRate: ((data.votes / ballots.length) * 100).toFixed(1) + '%'
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 20) // Top 20
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
  
  return rankings;
}

/**
 * Generate and save a snapshot at week boundary
 * Typically called by cron or manual trigger
 */
function publishWeeklySnapshot(chartKey, weekKey) {
  const rankings = aggregateBallots(chartKey, weekKey);
  const previousWeekKey = getPreviousWeekKey(weekKey);
  const previousRankings = getSnapshotRankings(chartKey, previousWeekKey) || [];
  
  // Compute movement
  const rankingsByPrevious = {};
  previousRankings.forEach(r => {
    rankingsByPrevious[r.songId] = r.rank;
  });
  
  const snapshot = {
    id: `snapshot-${chartKey}-${weekKey}`,
    chartKey,
    weekKey,
    publishedAt: Date.now(),
    rankings: rankings.map(item => ({
      ...item,
      movement: rankingsByPrevious[item.songId] 
        ? rankingsByPrevious[item.songId] - item.rank 
        : null,  // null = new entry or not in previous top 20
      peakRank: item.rank  // Start tracking peak (extended later)
    }))
  };
  
  // Save snapshot
  const key = `trackhype:snapshots_${chartKey}`;
  const snapshots = getChartSnapshots(chartKey);
  snapshots.push(snapshot);
  localStorage.setItem(key, JSON.stringify(snapshots));
  
  document.dispatchEvent(new CustomEvent('trackhype:snapshot-published', { 
    detail: { chartKey, weekKey, snapshot } 
  }));
  
  return snapshot;
}

/**
 * Load all snapshots for a chart
 */
function getChartSnapshots(chartKey) {
  const key = `trackhype:snapshots_${chartKey}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get snapshot rankings for a specific week
 */
function getSnapshotRankings(chartKey, weekKey) {
  const snapshots = getChartSnapshots(chartKey);
  const snapshot = snapshots.find(s => s.weekKey === weekKey);
  return snapshot ? snapshot.rankings : null;
}

/**
 * Get previous week's ISO week key
 */
function getPreviousWeekKey(weekKey) {
  const [year, week] = weekKey.split('-W').map(Number);
  if (week === 1) {
    return `${year - 1}-W52`;
  }
  return `${year}-W${String(week - 1).padStart(2, '0')}`;
}

/**
 * Get available weeks for archive dropdown
 */
function getAvailableWeeks(chartKey) {
  const snapshots = getChartSnapshots(chartKey);
  return snapshots
    .map(s => ({
      weekKey: s.weekKey,
      label: `Week ${s.weekKey.split('W')[1]} (${weekKeyToDateRange(s.weekKey)})`
    }))
    .reverse()  // Most recent first
    .slice(0, 13);  // Last 13 weeks (3 months)
}
```

---

## Part 3: UI Component Updates

### `charts.html` – Structure

Replace the current vote modal and chart view with:

```html
<div id="chart-container" class="chart-container">
  <!-- Header with archive selector -->
  <div class="chart-header">
    <h1 id="chart-title">Top 20 Trending</h1>
    <div class="chart-header-actions">
      <select id="week-selector" onchange="handleWeekChange(this.value)" class="week-select">
        <option value="current">Current Chart (This Week)</option>
        <!-- Populated by JS -->
      </select>
    </div>
  </div>

  <!-- Countdown timer (only show on current week) -->
  <div id="countdown-banner" class="countdown-banner">
    <span id="countdown-text">Next reset in: loading...</span>
  </div>

  <!-- Chart legend -->
  <div class="chart-legend">
    <span>Rank</span>
    <span>Song</span>
    <span>Points</span>
    <span class="movement-header">Movement</span>
  </div>

  <!-- Current chart or archived view -->
  <div id="chart-view" class="chart-view">
    <!-- Populated by JS -->
  </div>

  <!-- Vote button (only on current week, disabled if already voted) -->
  <button id="start-ballot-btn" class="btn-primary" onclick="startNewBallot()">
    Create My Top 10
  </button>
  <div id="already-voted" class="already-voted" style="display:none;">
    ✓ You voted this week. Chart resets <span id="reset-time">...</span>.
  </div>
</div>

<!-- Ballot modal (overlay) -->
<div id="ballot-modal" class="modal" style="display:none;">
  <div class="modal-content">
    <div class="modal-header">
      <h2>My Top 10</h2>
      <button class="close-btn" onclick="closeBallotModal()">✕</button>
    </div>
    
    <div class="modal-body">
      <!-- Progress indicator -->
      <div class="ballot-progress">
        <span id="picks-count">0</span>/10 picks made
        <div class="progress-bar">
          <div id="progress-fill" class="progress-fill"></div>
        </div>
      </div>

      <!-- Available songs (from chart) -->
      <div class="ballot-section">
        <h3>Available Songs</h3>
        <div id="available-songs" class="songs-list">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- Current picks (ranked 1-10) -->
      <div class="ballot-section">
        <h3>Your Ranking</h3>
        <div id="current-picks" class="picks-ranking">
          <!-- Populated by JS, shows 1-10 slots -->
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeBallotModal()">Cancel</button>
      <button id="submit-ballot-btn" class="btn-primary" disabled onclick="submitBallot()">
        Submit My Top 10
      </button>
    </div>
  </div>
</div>
```

### `charts.html` – CSS (add to your stylesheet)

```css
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
}

.chart-header-actions {
  display: flex;
  gap: 0.5rem;
}

.week-select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
}

.countdown-banner {
  background: #f5f5f5;
  border-left: 4px solid #007bff;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #555;
}

.chart-legend {
  display: grid;
  grid-template-columns: 60px 1fr 80px 100px;
  gap: 1rem;
  padding: 0.75rem;
  background: #f0f0f0;
  font-weight: bold;
  font-size: 0.85rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.chart-view {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 2rem;
}

.chart-row {
  display: grid;
  grid-template-columns: 60px 1fr 80px 100px;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  align-items: center;
}

.chart-row.archived {
  background: #f9f9f9;
  opacity: 0.8;
}

.rank-badge {
  font-weight: bold;
  font-size: 1.1rem;
  color: #007bff;
}

.movement {
  font-size: 0.9rem;
  font-weight: 500;
}

.movement.up {
  color: #28a745;
}

.movement.down {
  color: #dc3545;
}

.movement.new {
  color: #ffc107;
  font-weight: bold;
}

.movement.same {
  color: #666;
}

/* Ballot Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 100%;
  max-height: 90vh;
  border-radius: 12px 12px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.ballot-progress {
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.ballot-section {
  margin-bottom: 2rem;
}

.ballot-section h3 {
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  color: #333;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.song-card {
  padding: 0.75rem;
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.song-card:hover {
  background: #f0f7ff;
  border-color: #007bff;
}

.song-card.picked {
  opacity: 0.5;
  background: #f0f0f0;
  pointer-events: none;
}

.song-title {
  font-weight: 500;
  font-size: 0.9rem;
}

.song-rank-input {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 50px;
  text-align: center;
  font-size: 0.9rem;
}

.picks-ranking {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.rank-slot {
  padding: 1rem;
  background: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 6px;
  text-align: center;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.rank-slot:hover {
  border-color: #007bff;
  background: #f0f7ff;
}

.rank-slot.filled {
  border-style: solid;
  border-color: #007bff;
  background: #e7f3ff;
}

.rank-number {
  font-weight: bold;
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.rank-slot.filled .rank-number {
  color: #007bff;
}

.rank-song {
  font-size: 0.8rem;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-slot.filled .rank-song {
  color: #333;
  font-weight: 500;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #eee;
  background: #f9f9f9;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.already-voted {
  padding: 1rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  border-radius: 6px;
  text-align: center;
  margin-bottom: 1rem;
}
```

### `charts.html` – JavaScript Functions

```javascript
// ============================================================================
// BALLOT UI STATE MANAGEMENT
// ============================================================================

let ballotState = {
  chartKey: null,
  picks: [],      // Array of { songId, rank, title }
  allSongs: [],   // All available songs for picking
};

function startNewBallot() {
  const chartKey = getActiveChartKey();
  
  if (hasVotedThisWeek(chartKey)) {
    alert("You've already voted this week!");
    return;
  }
  
  // Load available songs (you already have this from chart rendering)
  ballotState.chartKey = chartKey;
  ballotState.picks = [];
  ballotState.allSongs = getChartSongs(chartKey); // Function to fetch songs
  
  openBallotModal();
}

function openBallotModal() {
  document.getElementById('ballot-modal').style.display = 'flex';
  renderAvailableSongs();
  renderRankSlots();
}

function closeBallotModal() {
  document.getElementById('ballot-modal').style.display = 'none';
  ballotState.picks = [];
}

function renderAvailableSongs() {
  const container = document.getElementById('available-songs');
  const pickedSongIds = new Set(ballotState.picks.map(p => p.songId));
  
  container.innerHTML = ballotState.allSongs
    .filter(song => !pickedSongIds.has(song.songId))
    .map(song => `
      <div class="song-card" onclick="pickSong('${song.songId}', '${song.title}')">
        <span class="song-title">${song.title}</span>
        <span>→</span>
      </div>
    `)
    .join('');
}

function renderRankSlots() {
  const container = document.getElementById('current-picks');
  
  let html = '';
  for (let rank = 1; rank <= 10; rank++) {
    const pick = ballotState.picks.find(p => p.rank === rank);
    html += `
      <div class="rank-slot ${pick ? 'filled' : ''}" onclick="editRank(${rank})">
        <div class="rank-number">#${rank}</div>
        ${pick ? `<div class="rank-song">${pick.title}</div>` : '<div class="rank-song">Tap to add</div>'}
      </div>
    `;
  }
  
  container.innerHTML = html;
  updateProgress();
}

function pickSong(songId, title) {
  // If song already picked, remove it
  const existing = ballotState.picks.find(p => p.songId === songId);
  if (existing) {
    ballotState.picks = ballotState.picks.filter(p => p.songId !== songId);
  } else {
    // Find next available rank
    for (let rank = 1; rank <= 10; rank++) {
      if (!ballotState.picks.find(p => p.rank === rank)) {
        ballotState.picks.push({ songId, rank, title });
        break;
      }
    }
  }
  
  renderAvailableSongs();
  renderRankSlots();
}

function editRank(rank) {
  const pick = ballotState.picks.find(p => p.rank === rank);
  
  if (!pick) {
    // Show available songs to add to this rank
    // (alternative: open dropdown of available songs)
    return;
  }
  
  // If rank is filled, allow user to:
  // 1. Swap with another rank
  // 2. Remove from ballot
  const action = confirm(
    `Move "${pick.title}" to a different rank, or remove it?\n\n` +
    `OK = Change rank | Cancel = Remove`
  );
  
  if (action) {
    const newRank = prompt('Enter new rank (1–10):', rank);
    const newRankNum = parseInt(newRank, 10);
    
    if (newRankNum >= 1 && newRankNum <= 10 && newRankNum !== rank) {
      // Swap ranks
      const other = ballotState.picks.find(p => p.rank === newRankNum);
      if (other) {
        other.rank = rank;
      }
      pick.rank = newRankNum;
    }
  } else {
    // Remove song from ballot
    ballotState.picks = ballotState.picks.filter(p => p.songId !== pick.songId);
  }
  
  renderAvailableSongs();
  renderRankSlots();
}

function updateProgress() {
  const count = ballotState.picks.length;
  document.getElementById('picks-count').textContent = count;
  document.getElementById('progress-fill').style.width = `${(count / 10) * 100}%`;
  
  const submitBtn = document.getElementById('submit-ballot-btn');
  submitBtn.disabled = count !== 10;
}

function submitBallot() {
  try {
    const ballot = submitWeeklyBallot(ballotState.chartKey, ballotState.picks);
    
    closeBallotModal();
    
    // Show success message
    alert("✓ Your ballot has been submitted!");
    
    // Refresh chart to show updated ranking
    refreshChartView();
    updateVotedState();
    
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// ============================================================================
// CHART VIEW & COUNTDOWN
// ============================================================================

function refreshChartView() {
  const chartKey = getActiveChartKey();
  const selectedWeek = document.getElementById('week-selector').value;
  const weekKey = selectedWeek === 'current' ? currentWeekKey() : selectedWeek;
  
  let rankings;
  
  if (selectedWeek === 'current') {
    // Show live aggregation for current week
    rankings = aggregateBallots(chartKey, weekKey);
  } else {
    // Show archived snapshot
    rankings = getSnapshotRankings(chartKey, weekKey);
  }
  
  if (!rankings || rankings.length === 0) {
    document.getElementById('chart-view').innerHTML = 
      '<p style="text-align:center;color:#999;">No votes yet this week.</p>';
    return;
  }
  
  const isArchived = selectedWeek !== 'current';
  
  const chartHtml = rankings
    .map(item => {
      let movementHtml = '—';
      
      if (item.movement !== null && !isArchived) {
        if (item.movement > 0) {
          movementHtml = `<span class="movement up">↑ +${item.movement}</span>`;
        } else if (item.movement < 0) {
          movementHtml = `<span class="movement down">↓ ${item.movement}</span>`;
        } else {
          movementHtml = `<span class="movement same">=</span>`;
        }
      } else if (isArchived) {
        movementHtml = item.movement !== null ? `↑ ${item.movement > 0 ? '+' : ''}${item.movement}` : '🆕';
      }
      
      return `
        <div class="chart-row ${isArchived ? 'archived' : ''}">
          <div class="rank-badge">#${item.rank}</div>
          <div>
            <strong>${item.title}</strong>
            ${item.pickRate ? `<div style="font-size:0.8rem;color:#999;">${item.pickRate} picked</div>` : ''}
          </div>
          <div>${item.totalPoints} pts</div>
          <div class="movement">${movementHtml}</div>
        </div>
      `;
    })
    .join('');
  
  document.getElementById('chart-view').innerHTML = chartHtml;
}

function updateVotedState() {
  const chartKey = getActiveChartKey();
  const hasVoted = hasVotedThisWeek(chartKey);
  
  const btnContainer = document.getElementById('start-ballot-btn');
  const votedContainer = document.getElementById('already-voted');
  
  if (hasVoted) {
    btnContainer.style.display = 'none';
    votedContainer.style.display = 'block';
    updateCountdown();
  } else {
    btnContainer.style.display = 'block';
    votedContainer.style.display = 'none';
  }
}

function updateCountdown() {
  const resetTime = getNextSundayReset();
  
  const timer = setInterval(() => {
    const now = Date.now();
    const diff = resetTime - now;
    
    if (diff <= 0) {
      clearInterval(timer);
      document.getElementById('countdown-text').textContent = 
        "Chart reset! New votes available now.";
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('countdown-text').textContent = 
      `Next reset in: ${days}d ${hours}h ${minutes}m`;
  }, 1000);
}

function handleWeekChange(value) {
  // Hide countdown on archived weeks
  const isCurrent = value === 'current';
  document.getElementById('countdown-banner').style.display = isCurrent ? 'block' : 'none';
  document.getElementById('start-ballot-btn').style.display = isCurrent ? 'block' : 'none';
  document.getElementById('already-voted').style.display = isCurrent && hasVotedThisWeek(getActiveChartKey()) ? 'block' : 'none';
  
  refreshChartView();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initBallotSystem() {
  const chartKey = getActiveChartKey();
  
  // Populate week selector
  const selector = document.getElementById('week-selector');
  const weeks = getAvailableWeeks(chartKey);
  
  weeks.forEach(week => {
    const option = document.createElement('option');
    option.value = week.weekKey;
    option.textContent = week.label;
    selector.appendChild(option);
  });
  
  // Initial view
  updateVotedState();
  refreshChartView();
  updateCountdown();
  
  // Listen for ballot submissions
  document.addEventListener('trackhype:ballot-submitted', (e) => {
    refreshChartView();
    updateVotedState();
  });
}

// Call on page load
document.addEventListener('DOMContentLoaded', initBallotSystem);
```

---

## Part 4: Migration Strategy

### Step 1: Backup Current Data
```javascript
// In browser console before deployment
const backupVotes = localStorage.getItem('trackhype:votes');
console.log('Backup:', backupVotes);
// Save this string to a safe location
```

### Step 2: Clear Legacy Keys
```javascript
// Remove old 24-hour vote system keys
localStorage.removeItem('trackhype:votes');
localStorage.removeItem('trackhype:lastVote');
localStorage.removeItem('trackhype:lastVoteResult');
// etc.
```

### Step 3: Fresh User Opt-In
- On first load, existing users see:
  ```
  "TrackHype is now weekly voting! Create your first ballot →"
  ```
- New users see the normal flow.

### Step 4: Archive Historical Snapshots (Optional)
If you want to preserve vote data from the old system:
```javascript
// One-time migration function
function migrateOldVotesToSnapshot(chartKey, oldVotesArray) {
  // Group old votes by date
  // Aggregate to a score per song
  // Create a fake snapshot with old data
  // Save under "2026-W34-legacy" or similar
}
```

---

## Part 5: Testing Checklist

- [ ] Submit 10-pick ballot → verify saved to `trackhype:ballots_<chartKey>`
- [ ] Try to vote twice in same week → should throw error
- [ ] View current week chart → shows aggregated rankings + movement
- [ ] View archived week → shows read-only snapshot
- [ ] Countdown timer counts down to Sunday midnight UTC
- [ ] After Sunday reset, voting button re-enables
- [ ] Progress bar updates as picks are added
- [ ] Week selector dropdown populated with available snapshots
- [ ] Movement badges show +/— correctly vs. previous week

---

## Part 6: Future Backend Integration (Notes)

When you add a server, wire these endpoints:

```
POST /api/charts/{chartKey}/ballots
  Body: { picks: [...], weekKey: "2026-W35" }
  Response: { ballot: {...}, ok: true }

GET /api/charts/{chartKey}/snapshots
  Response: { snapshots: [...] }

GET /api/charts/{chartKey}/aggregate?week=2026-W35
  Response: { rankings: [...] }
```

Server runs cron every Sunday 00:00 UTC:
```
1. Fetch all ballots for weekKey
2. Run aggregateBallots()
3. Save snapshot to db
4. Broadcast event to all clients
```

---

## Implementation Order

1. **Add date helpers** (currentWeekKey, getNextSundayReset, etc.)
2. **Add ballot functions** (submitWeeklyBallot, getDraftBallot, etc.)
3. **Add aggregation** (aggregateBallots, publishWeeklySnapshot)
4. **Update HTML structure** (modal, selectors, chart rows)
5. **Add CSS** (ballot modal styles, movement badges)
6. **Implement ballot UI** (pick songs, edit ranks, submit)
7. **Implement chart view** (current + archived, countdown)
8. **Test end-to-end** (ballot → snapshot → archive view)
9. **Migrate legacy data** (if needed)
10. **Deploy & monitor**
