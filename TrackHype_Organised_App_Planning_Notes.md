# TrackHype — Organised App Planning & UI Structure Notes

## 1. Project Overview

TrackHype is a Zimbabwe-focused music discovery, artist discovery, music submission, official chart voting, and music promotion platform.

The existing HTML pages are already visually strong and should be treated as the **base UI**. The main objective is to organise and connect them, while adding missing behaviours and app systems.

### Core instructions

- Preserve the current visual language wherever practical.
- Do not unnecessarily redesign the existing HTML.
- Focus improvements on functionality, navigation, data flow, mobile behaviour, chart voting, submissions, YouTube integration, and WhatsApp distribution.
- Build the platform as one unified application rather than unrelated HTML pages.

---

## 2. Zimbabwe Conversion

TrackHype is for **Zimbabwe**, not Botswana.

Remove Botswana-specific information from the current HTMLs, including country references, currencies, telephone codes, artists, charts, email addresses, and business wording where applicable.

### Zimbabwe configuration

| Item | TrackHype value |
|---|---|
| Country | Zimbabwe |
| Country code | ZW |
| Dial code | +263 |
| Currency | USD |

### Mobile networks

- Econet
- Telecel
- NetOne

### Mobile money

- Econet → EcoCash
- Telecel → TeleCash
- NetOne → OneMoney

### Remove/replace examples

- `+267`
- `P`
- `BWP`
- Botswana
- Yarona FM
- `.co.bw`

---

## 3. Existing HTML Philosophy

The current HTML files are already close to the desired TrackHype visual experience.

The existing design should therefore be **preserved** and upgraded primarily through:

- better architecture
- shared components
- mobile-first behaviour
- consistent navigation
- chart voting logic
- artist submissions
- New Music discovery
- YouTube player integration
- WhatsApp integration

The current charts page already provides a useful foundation of chart header, chart artwork, chart title, genre, date, favourite chart functionality, chart selector, song cards, and voting controls.

The current submit-music page already provides the Artist → Tracks → Genres → Target Chart → Artwork → YouTube → Preview → Payment flow.

---

# 4. Main TrackHype Navigation

The primary bottom navigation should contain:

1. Hyped
2. History
3. Artists
4. Search
5. Menu

The application also has a global music player.

The bottom player and bottom navigation occupy the same bottom area and are switchable.

## Bottom Player layout

```text
song-thumb | play/pause | playlist | seek/progress | toggle square
```

The seek/progress bar must have a visible draggable dot.

The far-right square button switches between:

```text
Bottom Player
```

and:

```text
Bottom Navigation
```

---

# 5. Global Scroll Behaviour

## Scrolling down

- Top header disappears.
- Bottom player disappears.

## Scrolling up

- Top header reappears.
- Bottom player reappears.

Use smooth transitions and a sensible scroll threshold so the controls do not flicker during tiny movements.

---

# 6. Mobile Android Portrait Requirement

TrackHype must be designed primarily as a **mobile Android portrait app**.

Target narrow portrait layouts approximately around:

```text
320px–430px width
```

Prioritise:

- large readable text
- large touch targets
- one-handed use
- vertical layouts
- touch-first interactions
- minimal horizontal overflow
- lightweight rendering
- fast loading
- clear information hierarchy

Desktop support may exist, but desktop must not drive the design.

Avoid:

- desktop-first layouts
- tiny text
- hover-only interactions
- dense desktop tables
- controls that are difficult to touch

---

# 7. User Onboarding

The unrelated onboarding document should be used only for its **input structure**, not its original branding or business context.

TrackHype onboarding should collect information relevant to the music platform.

## Personal information

- First name
- Surname
- Date of birth
- Mobile number
- Email address

Gender may be included only if there is a clear TrackHype reason for collecting it.

Do not collect unnecessary information simply because it appeared in another onboarding form.

## Mobile network

- Econet
- Telecel
- NetOne
- Other

## Mobile money

- EcoCash
- TeleCash
- OneMoney
- None

## Music preferences

Ask:

> What music do you listen to?

The user must select **at least 8 genres** before continuing.

This requirement is mandatory.

## Optional artist preferences

Ask:

> Which artists do you already listen to?

Users may select artists they already like/follow.

---

# 8. Why Genre Onboarding Matters

The user's selected genres should power personalisation.

Preferences can influence:

- Hyped feed
- recommended charts
- recommended songs
- recommended artists
- New Music recommendations
- notifications
- search recommendations

Example user profile:

```text
Zim Hip Hop
Zimdancehall
Amapiano
Sungura
R&B
Gospel
Afro-Pop
House
```

TrackHype can then prioritise content matching these preferences.

---

# 9. Zimbabwe Genre System

Use a Zimbabwe-focused genre hierarchy.

## Traditional / Indigenous

- Mbira Music
- Jiti / Jit
- Mhande
- Mbende / Jerusarema
- Muchongoyo
- Mbakumba
- Shangare
- Amabhiza

## Modern / Popular / Fusion

- Sungura
- Chimurenga
- Tuku Music
- Afro-Jazz
- Zimbabwean Jazz
- Imbube
- Kanindo
- Zimbabwean Rumba
- Afro-Fusion
- Afro-Pop

## Urban / Contemporary

- Zimdancehall
- Urban Grooves
- Zim Hip Hop
- Amapiano
- Zimbabwean House
- Zim EDM
- Zim-TrapSoul

## Hip-Hop / Fusion subgenres

- Shona Hip Hop
- Ndebele Hip Hop
- Mbare Trap
- Ghetto Drill
- Jecha Trap
- Clarks Rap
- Bulawayo Kasi Rap
- Zim-Skhanda
- Alternative / Conscious Zim-Rap
- Diaspora Afro-Drill
- Gospel Hip Hop
- Trap Gospel
- Afro-Gospel Rap
- Conscious Christian Rap
- Sungura Trap

Use parent/child genre relationships so onboarding is not overwhelming.

---

# 10. Hyped Page

`index.html` is the main discovery page.

Recommended vertical structure:

```text
TRACKHYPE HEADER

ADVERT

RADIO SHOWS
2 across × 2 visible
Horizontal scrolling

ADVERT

RECENT CHARTS
2 columns
10 items

ADVERT

ALL NUMBER 1
2 across
Horizontal scrolling
View All

ADVERT

NATIONAL TOP 100
2 columns
10 items

ADVERT

GENRE SECTION
ZIM HIP HOP
[Chart] [Artists]
Horizontal Top 20

GENRE SECTION
ZIMDANCEHALL
[Chart] [Artists]
Horizontal Top 20

GENRE SECTION
AMAPIANO
[Chart] [Artists]
Horizontal Top 20

Continue through supported genres.
```

The page should feel like a music discovery feed rather than an administrative dashboard.

---

# 11. Radio Shows

The Hyped page should contain a horizontally scrollable Radio Shows section.

Display approximately 4 visible thumbnails as:

```text
2 across
2 below
```

Users swipe horizontally to reveal more Zimbabwe radio station/show items.

---

# 12. Recent Charts

Show approximately 10 recent chart thumbnails in:

```text
2 columns
5 rows
```

Use square thumbnails with compact supporting text.

---

# 13. All Number 1

Show a horizontally scrollable list of Number 1 songs from selected genres.

Include:

```text
ALL NUMBER 1
View All
```

The View All action opens the relevant chart/list page.

---

# 14. National Top 100

Show a National Top 100 discovery section.

The Hyped preview should show around 10 items.

View All opens the complete National Top 100.

---

# 15. Genre Sections

Every major genre section should contain:

```text
Genre Name
[Chart] [Artists]
```

Below the heading:

- horizontally scrollable Top 20
- song artwork
- artist
- song title

The `Chart` action opens the relevant genre chart.

The `Artists` action opens the Artists page filtered to that genre.

---

# 16. Charts

`charts.html`

Keep the current chart appearance.

Do not replace the existing visual design unnecessarily.

The chart page should provide:

- chart header
- chart artwork
- chart title
- genre
- date/period
- favourite chart
- chart selector
- song list
- Vote button

---

# 17. Chart Card Accordion

The `chart-card` must behave as an accordion extending the white card downward.

The card should have two main interaction zones.

## Tap chart artwork

When the user taps:

```text
chart-thumb
```

expand a YouTube section inside the card.

The user can play the official embedded YouTube video.

## Tap chart information

When the user taps:

```text
chart-info
```

expand detailed song information.

Include:

- iTunes / Apple Music
- Spotify
- YouTube
- Amazon Music
- Favourite / Heart
- Lyrics button

---

# 18. Artist Thumbnails in Song Information

Show:

```text
artist-portrait-thumbnail
artist name
```

For multiple artists, stack artist names vertically.

Artist names/portraits should link to artist profiles.

---

# 19. Song Detail Page

Create/use:

`song.html`

Show:

- artwork
- title
- artist(s)
- favourite
- Apple Music
- Spotify
- YouTube
- Amazon Music
- current chart positions
- chart history
- lyrics

The Lyrics button from the chart accordion should navigate to this page.

---

# 20. Global Music Player

The global bottom player is separate from the chart-specific YouTube accordion.

TrackHype will later receive a source for the music played in the global player.

Do not invent a permanent music source.

The player must support:

- song artwork
- play/pause
- playlist
- progress/seek
- playlist persistence across navigation
- current track persistence across navigation

---

# 21. Playlist Page

The playlist button opens a dedicated playlist page.

Each item should contain:

```text
Artwork | Artist name
        | Song title       Repeat  Favourite
```

Artist name is on line 1.

Song title is on line 2.

---

# 22. Voting Logic

The official voting model is a preference-ranking system.

The app loads the daily Top 20 singles.

The user can manually reorder the songs according to personal preference.

There is **no movement limit**.

The user can rearrange one song, several songs, or the entire list.

## Points

```text
#1  = 20 points
#2  = 19 points
#3  = 18 points
...
#20 = 1 point
```

## Voting flow

```text
Daily Top 20 loads
        ↓
User taps VOTE
        ↓
Reorder mode activates
        ↓
User drags songs
        ↓
User can rearrange any number of songs
        ↓
Final order is captured
        ↓
Vote submitted
        ↓
Individual points feed global daily tally
        ↓
Global leaderboard is updated
```

Do not use the old +/- voting model.

Do not use the old `*15` scoring model.

Do not immediately change the public chart every time a single user votes.

Use:

```text
User order
→ vote record
→ daily aggregation
→ global chart calculation
→ published chart
```

---

# 23. Vote Button

Keep the **VOTE button at the bottom of charts**.

Before voting:

```text
VOTE
```

During voting:

```text
SAVE MY VOTE
```

After voting:

```text
VOTED
```

Show the next available vote period/countdown when applicable.

---

# 24. 24-Hour Voting Rule

A user may vote on the same chart once every 24 hours.

For production, the server/database must enforce this.

LocalStorage may be used for prototype UI state, but it must not be the authoritative production voting database.

Production vote records should conceptually contain:

```text
userId
chartId
votingPeriod
submittedOrder
points
timestamp
```

---

# 25. New Music / Submission Discovery

A major missing feature is a place where newly submitted songs can be discovered **outside the official charts**.

Create:

`new-music.html`

This is a first-class TrackHype section.

## Critical distinction

```text
NEW MUSIC
≠
OFFICIAL CHART
```

An artist paying the submission fee does not automatically receive an official chart position.

---

# 26. New Music Pipeline

Use this lifecycle:

```text
Artist Submission
        ↓
$10.00 USD Payment
        ↓
Submission Received
        ↓
Moderation / Review
        ↓
Approved
        ↓
New Music / Discovery
        ↓
Users Discover / Play / Favourite
        ↓
Chart Eligibility
        ↓
Official Chart
        ↓
Community Voting
```

Payment should not be described as guaranteeing chart placement.

---

# 27. New Music Page

`new-music.html`

Show approved new submissions that are not currently official chart entries.

Suggested sections:

```text
NEW MUSIC

Newest
Trending
Most Played
Most Favourited
```

Filters:

- Genre
- Artist
- City
- Date Added
- Language

Every New Music card should link to the Song page.

---

# 28. Artist Submission

`submit-music.html`

Artists must be able to submit music for:

```text
$10.00 USD per song
```

Examples:

```text
1 song = $10.00
2 songs = $20.00
3 songs = $30.00
```

## Artist information

- Artist / Group Name
- Legal / Registered Name (optional)
- Contact Email
- Contact Number
- Mobile Network
- City
- Artist Type
- Artist Portrait
- Artist Biography

Artist types can include:

- Solo artist
- Group
- Band
- DJ
- Producer

## Track information

- Track title
- Primary artist
- Featured artists
- Release date
- Genre
- Subgenre
- Language
- Target chart/category
- Explicit content status
- Cover art
- YouTube URL
- Lyrics
- Songwriters
- Producers
- Label / Independent
- Additional notes

---

# 29. YouTube Requirement on Submission

Do not describe YouTube as:

> Required for voting

Instead use wording such as:

> YouTube Link — used for the TrackHype YouTube player and song discovery.

Voting eligibility should be determined by TrackHype's own chart/submission rules.

---

# 30. Submission Preview

Before payment, show a complete preview:

```text
ARTIST
Artist Name

TRACKS
Track 1
Track 2
Track 3

GENRES
...

TARGET CHART
...

YOUTUBE
...

TOTAL
$30.00 USD
```

Actions:

```text
EDIT
```

or:

```text
CONFIRM & PAY
```

---

# 31. Submission Status

Artists should be able to see:

- Payment Received
- Submission Received
- Under Review
- Approved
- Published in New Music
- Chart Eligible
- Charting
- Rejected

Every submission should have a TrackHype Submission ID, for example:

```text
TH-000123
```

---

# 32. Artist Dashboard

Provide an artist-facing dashboard containing:

```text
Artist Profile

My Music
    Submitted
    Under Review
    Approved
    New Music
    Charting

Submission History

Payments

Chart History

Edit Artist Profile
```

This lets artists follow their music through the TrackHype pipeline.

---

# 33. Artists Page

`artists.html`

Filters:

- Genre
- Year Active
- Charting
- Recently Active
- Following

Sort options:

- A–Z
- Recently Active
- Charting
- Most Successful
- Following

---

# 34. Artist Directory Card

Each artist card should show:

```text
Artist portrait
Artist name
Primary genre
Current chart position
Highest chart position
Follow
```

Tap the card to open the artist profile.

---

# 35. Artist Profile

`artist.html`

Show:

- portrait
- artist name
- genre(s)
- Follow
- biography
- top songs
- current charts
- chart history
- latest releases
- New Music
- social links

Show the relationship between:

```text
Artist
→ New Music
→ Official Charts
→ Historical Charts
```

---

# 36. History

`history.html`

Users should be able to browse previous chart periods.

Provide:

```text
Date selector
Chart selector
```

Example:

```text
24 August 2026

National Top 100
Top Zim Hip Hop
Top Zimdancehall
Top Gospel
Top Amapiano
Top Sungura
```

Historical chart entries should link to their Song and Artist pages.

---

# 37. Search

`search.html`

Search across:

- Songs
- Artists
- Charts
- Genres
- Lyrics

Group results by type.

---

# 38. Menu / Profile

`menu.html`

Include:

```text
Profile
Edit Profile

Liked Songs
Favourite Artists
Favourite Charts
Playlists
Voting History

Artist Dashboard
Submit Music

Notifications
Settings
Privacy
Terms
Help
```

---

# 39. WhatsApp Channel Strategy

The TrackHype WhatsApp Channel should operate as a lightweight broadcast/discovery layer.

It should not become the main TrackHype database.

Use the channel for:

- chart announcements
- Number 1 announcements
- new music announcements
- artist discoveries
- voting reminders
- new releases
- TrackHype news
- YouTube links
- TrackHype links

Example:

```text
#101 — ARTIST NAME — SONG TITLE

Listen on YouTube:
https://youtu.be/VIDEO_ID

Vote on TrackHype:
https://trackhype.app/charts.html?chart=top20&song=101
```

TrackHype remains responsible for:

- user accounts
- authentication
- chart data
- votes
- submissions
- artists
- songs
- playlists
- favourites

Use supported/current Meta/WhatsApp capabilities for automation.

---

# 40. YouTube Strategy

There are three intended YouTube uses.

## 1. Official embedded player

Use the official YouTube iframe/player where appropriate.

Likely locations:

```text
chart-card accordion
song page
```

Lazy-load the player so it is not unnecessarily loaded before the user requests it.

## 2. Direct WhatsApp links

WhatsApp can send users directly to public YouTube URLs.

This keeps WhatsApp posts lightweight compared with embedding video inside TrackHype.

## 3. YouTube Data API

The YouTube API may be used for permitted metadata such as:

- title
- channel
- thumbnail
- video information

Example concept:

```js
fetch(
  `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${API_KEY}`
)
  .then(response => response.json())
  .then(data => {
    // Map permitted metadata into TrackHype song data
  });
```

Keep YouTube API integration isolated from the main UI.

Do not expose secrets unnecessarily in frontend code.

---

# 41. Strictly Avoid With YouTube

Do not build features that:

- download YouTube audio
- convert YouTube videos to MP3
- upload ripped YouTube audio to WhatsApp
- strip YouTube advertising
- hide required YouTube player elements
- manipulate YouTube views or engagement
- create fake YouTube plays
- rely on prohibited undocumented scraping methods

Use official YouTube embedding/API mechanisms and follow applicable platform rules.

---

# 42. Data Usage Considerations

Keep TrackHype lightweight.

YouTube playback can consume significantly more data than the TrackHype UI/data layer.

Therefore:

- do not preload videos
- lazy-load YouTube players
- use appropriately sized thumbnails
- use compressed artwork
- avoid unnecessary autoplay of video

The global TrackHype music player is a separate system from YouTube embeds and will later use the approved source supplied by the TrackHype owner.

---

# 43. Shared Data Model

Use shared entities rather than independent page-specific data.

Core entities:

```text
User
Artist
Song
Genre
Chart
ChartEntry
Vote
Submission
Playlist
Favourite
YouTubeVideo
Advert
RadioShow
```

Relationships:

```text
User
├── preferredGenres
├── followedArtists
├── favouriteSongs
├── favouriteCharts
├── playlists
└── votes

Artist
├── songs
├── submissions
├── chartEntries
└── followers

Song
├── artists
├── genres
├── youtubeVideo
├── lyrics
├── submission
└── chartEntries

Submission
└── becomes New Music item

Chart
└── chart entries
```

---

# 44. Song Lifecycle

Every song can conceptually move through:

```text
Submission
↓
Moderation
↓
Approved
↓
New Music
↓
Discovery
↓
Chart Eligible
↓
Official Chart
↓
Community Voting
↓
Chart History
```

Keep these concepts separate.

---

# 45. Suggested Frontend Structure

Avoid duplicating headers, players, cards, and controls across every page.

Recommended pages:

```text
/trackhype

index.html
charts.html
song.html
history.html
artists.html
artist.html
search.html
menu.html
playlist.html
onboarding.html
submit-music.html
new-music.html
```

Shared styling:

```text
/css
    trackhype.css
    components.css
    mobile.css
```

Shared JavaScript:

```text
/js
    app.js
    navigation.js
    player.js
    charts.js
    voting.js
    songs.js
    artists.js
    search.js
    onboarding.js
    submissions.js
    favourites.js
    api.js
```

Assets:

```text
/assets
    icons/
    artists/
    songs/
    charts/
    adverts/
```

---

# 46. Reusable UI Components

Create reusable components/modules for:

- AppHeader
- BottomPlayer
- BottomNavigation
- ChartHeader
- ChartCard
- SongCard
- ArtistCard
- PlaylistItem
- AdvertCard
- GenreSection
- YouTubePlayer
- FavouriteButton
- FilterBar
- ModalSheet

---

# 47. Performance

Optimise for Zimbabwean mobile users and lower bandwidth.

Use:

- lazy-loaded images
- correctly sized thumbnails
- compressed artwork
- deferred JavaScript
- deferred YouTube embeds
- lightweight initial render
- minimal unnecessary API calls

---

# 48. Advertising

Hyped can contain paid advertising.

Create a reusable `AdvertCard` supporting image or approved animated creative.

Ads must not cover voting controls, player controls, or navigation.

---

# 49. Production Authentication

Onboarding should eventually connect to real user accounts so preferences, favourites, playlists, and voting history follow users across devices.

---

# 50. Production Payment

Prepare `submit-music.html` for a real payment gateway.

Display:

```text
$10.00 USD per song
```

The payment should create a payment/submission record.

Payment must not guarantee chart placement.

---

# 51. Full TrackHype User Journey

## Listener

```text
Open TrackHype
↓
Complete onboarding
↓
Select 8+ genres
↓
Enter Hyped
↓
Discover a song
↓
Open YouTube player
↓
Favourite song
↓
Open artist
↓
Follow artist
↓
Explore other songs
↓
Open New Music
↓
Discover a new submission
↓
Open official chart
↓
Vote
↓
Rearrange songs
↓
Submit final order
```

## Artist

```text
Create/complete artist profile
↓
Submit music
↓
Pay $10 USD
↓
Track submission
↓
Pass review
↓
Appear in New Music
↓
Gain discovery
↓
Become chart eligible
↓
Enter official chart
↓
Receive community votes
↓
Build chart history
```

---

# 52. Final Product Structure

```text
TRACKHYPE
│
├── ONBOARDING
├── HYPED
├── NEW MUSIC
├── CHARTS
├── SONG
├── HISTORY
├── ARTISTS
├── ARTIST PROFILE
├── SEARCH
├── PLAYLIST
├── MENU / PROFILE
├── ARTIST DASHBOARD
├── SUBMIT MUSIC
├── GLOBAL PLAYER
└── WHATSAPP + YOUTUBE INTEGRATION
```

The most important distinctions are:

```text
SUBMISSION
    ≠
NEW MUSIC
    ≠
OFFICIAL CHART
```

The complete lifecycle is:

```text
SUBMISSION
→ REVIEW
→ NEW MUSIC
→ DISCOVERY
→ CHART ELIGIBILITY
→ OFFICIAL CHART
→ COMMUNITY VOTING
→ GLOBAL RANKING
→ HISTORY
```

---

# 53. Primary Build Priority

Build in this order:

1. Shared mobile app shell
2. Global header behaviour
3. Bottom player/navigation system
4. User onboarding
5. Genre preference system
6. Hyped
7. New Music
8. Charts + accordion
9. Voting
10. Song page
11. Artists
12. Artist profiles
13. History
14. Search
15. Menu/Profile
16. Artist submission/payment
17. Artist dashboard
18. YouTube integration
19. WhatsApp distribution
20. Backend/API integration

---

# 54. Final Direction

TrackHype should feel like:

```text
Zimbabwean music discovery
+
music charts
+
community voting
+
artist discovery
+
artist submissions
+
new music discovery
+
YouTube playback
+
WhatsApp distribution
+
artist dashboard
```

Build everything as one unified mobile Android portrait-first platform.
