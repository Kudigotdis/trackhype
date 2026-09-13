# TrackHype — Master Product & Development Specification

## Product
Build **TrackHype**, a Zimbabwe-focused music discovery, artist discovery, music submission, chart voting, and music promotion platform.

The existing TrackHype HTML files are the visual starting point. Preserve the existing visual language where practical; improve architecture, responsiveness, data flow, and interaction.

Zimbabwe-first configuration:
- Country: Zimbabwe
- Country code: ZW
- Dial code: +263
- Currency: USD
- Mobile networks: Econet, NetOne, Telecel
- Mobile money: EcoCash, OneMoney, TeleCash
- Artist submission price: **$10.00 USD per song**

Remove Botswana/Pula/+267/Yarona FM references.

## Main navigation
Primary tabs:
1. Hyped
2. History
3. Artists
4. Search
5. Menu

The bottom area switches between:
- Bottom Player
- Bottom Navigation

The far-right square toggle switches between them.

## Mobile Android portrait
Design primarily for Android portrait screens around 320–430px wide. Use large touch targets, readable typography, vertical layouts, and no hover-dependent interactions. Desktop support may exist but must not drive the design.

## Global header
When the user scrolls down, the header hides. When the user scrolls up, it reappears. Use smooth transforms and a sensible scroll threshold.

## Global bottom player
Reusable across major pages:
- artwork
- play/pause
- playlist
- seek/progress bar with draggable dot
- square toggle

The player maintains the current song and playlist while navigating, hides on downward scrolling, and reappears on upward scrolling.

Playlist item:
- artwork on left
- artist name on first line
- song title on second line
- favourite and repeat controls on right

## YouTube
Use official YouTube embedded playback where appropriate. Store/reference YouTube URL and video ID, and use permitted metadata/thumbnail information.

Do NOT:
- download or rip YouTube audio
- convert YouTube videos to MP3
- strip advertisements
- manipulate YouTube engagement
- create hidden/background playback outside permitted player behaviour

Lazy-load YouTube players. Do not load many iframes automatically.

Chart song behaviour:
- Tap artwork → expand YouTube player
- Tap song info → expand song information

## WhatsApp Channel
Use the official TrackHype WhatsApp Channel as a broadcast/discovery layer, not the TrackHype database.

Publish:
- chart announcements
- #1 announcements
- new music
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

TrackHype remains the source of truth for users, authentication, votes, submissions, playlists, artists, songs, and charts. Use only supported/current WhatsApp/Meta capabilities for automation.

## Hyped
`index.html` should be the primary discovery feed.

Order:
- advert
- Radio Shows horizontal scroller
- advert
- Recent Charts, 2 columns
- advert
- All Number 1, horizontal scroller + View All
- advert
- National Top 100, 2 columns
- advert
- genre sections, each with Chart + Artists actions and a horizontal Top 20

## Genres
Use Zimbabwe-focused categories including:

Traditional/Indigenous:
Mbira, Jiti, Mhande, Mbende/Jerusarema, Muchongoyo, Mbakumba, Shangare, Amabhiza

Modern:
Sungura, Chimurenga, Tuku Music, Afro-Jazz, Zimbabwean Jazz, Imbube, Kanindo, Zimbabwean Rumba, Afro-Fusion, Afro-Pop

Urban:
Zimdancehall, Urban Grooves, Zim Hip Hop, Amapiano, Zimbabwean House, Zim EDM, Zim-TrapSoul

Hip-Hop/fusion examples:
Shona Hip Hop, Ndebele Hip Hop, Mbare Trap, Ghetto Drill, Jecha Trap, Clarks Rap, Bulawayo Kasi Rap, Zim-Skhanda, Alternative/Conscious Zim-Rap, Diaspora Afro-Drill, Gospel Hip Hop, Trap Gospel, Afro-Gospel Rap, Conscious Christian Rap, Sungura Trap

Use parent/child genre relationships so onboarding is not overwhelming.

## Onboarding
Collect:
- first name
- surname
- date of birth
- mobile number
- mobile network
- mobile money provider
- email

Network choices:
- Econet
- NetOne
- Telecel
- Other

Mobile money:
- EcoCash
- OneMoney
- TeleCash
- None

Then require the user to select **at least 8 genres** before continuing.

Optional next step:
- follow artists they already listen to

Use preferences to drive recommendations, Hyped content, chart recommendations, artist recommendations, songs, and notifications.

## Official charts
Charts are distinct from New Music discovery.

Chart fields:
- chartId
- chartName
- genre
- period
- startDate
- endDate
- status
- songs

Song fields:
- songId
- title
- artists
- artwork
- genres
- youtubeVideoId
- platformLinks
- lyrics
- submissionId

## Chart-card accordion
Preserve the current visual chart-card style.

Normal:
`[RANK] [ARTWORK] [SONG INFO]`

Interactions:
- artwork → YouTube accordion
- song info → song information accordion

Song information may include:
- artist portrait(s)
- artist name(s)
- Apple Music
- Spotify
- YouTube
- Amazon Music
- favourite
- Lyrics button

Multiple artists should be displayed vertically where necessary.

## Song page
`song.html` should show:
- artwork
- title
- artist(s)
- favourite
- YouTube
- Spotify
- Apple Music
- Amazon Music
- current chart positions
- chart history
- lyrics

## Voting
The official chart vote is based on personal ranking.

For a Top 20:
- #1 = 20 points
- #2 = 19
- #3 = 18
- ...
- #20 = 1

On `VOTE`, enter reorder mode:
> Rearrange your chart. Drag songs into your preferred order.

The user can rearrange **as many songs as desired**. There is no movement limit. One final submission locks the vote.

Do not use the old +/- model or old `*15` scoring.

Do not immediately change the public chart after one user's vote.

Flow:
```text
User ordering
→ vote record
→ daily aggregation
→ global chart calculation
→ published official chart
```

One user may vote once per chart per 24-hour voting period. Production enforcement must be server-side; localStorage must not be the authoritative voting database.

## New Music / Submission Discovery
Create a first-class page:
`new-music.html`

This is essential.

**New Music is NOT an official chart.**

Purpose:
1. give approved artists exposure
2. let users discover newly submitted music
3. create a bridge to chart eligibility
4. avoid putting every paid submission directly into official charts

Lifecycle:
```text
Artist Submission
→ $10 USD Payment
→ Submission Received
→ Moderation / Review
→ Approved
→ New Music / Discovery
→ Engagement
→ Chart Eligibility
→ Official Chart
→ Community Voting
```

Payment does not guarantee chart placement.

New Music filters:
- Newest
- Trending
- Most Played
- Most Favourited
- Genre
- City
- Date Added
- Artist
- Language

Possible Zimbabwe locations can include Harare, Bulawayo, Mutare, Gweru, Kwekwe, Masvingo, Kadoma, Chitungwiza, Other. Do not invent artist locations.

## Submit Music
`submit-music.html`

Price:
**$10.00 USD per song**

Artist information:
- artist/group name
- legal/registered name optional
- email
- mobile number
- mobile network
- city
- artist type
- biography
- artist portrait

Song information:
- song title
- primary artist
- featured artists
- release date
- genre
- subgenre
- language
- target chart
- explicit content
- cover art
- YouTube URL
- lyrics
- songwriter(s)
- producer(s)
- label/independent
- additional notes

Do not label YouTube as required for voting; it is the source for the official linked/embedded video player.

## Submission status
Artist-facing status:
- Payment Received
- Submission Received
- Under Review
- Approved
- Published in New Music
- Chart Eligible
- Charting
- Rejected

Create a real submission record with a Submission ID.

## Artist Dashboard
Provide:
- Artist Profile
- My Music
- Submitted
- Under Review
- Approved
- New Music
- Charting
- Submission History
- Payments
- Chart History
- Edit Artist Profile

## Artists
`artists.html`

Filters:
- Genre
- Year Active
- Charting
- Recently Active
- Following

Sort:
- A–Z
- Recently Active
- Charting
- Most Successful
- Following

Artist cards:
- portrait
- artist name
- primary genre
- current chart position
- highest chart position
- follow

## Artist profile
`artist.html`:
- portrait
- artist name
- genres
- follow
- biography
- top songs
- current charts
- chart history
- latest releases
- New Music
- social links

## History
`history.html`

Allow date + chart selection and show historical chart positions. Reuse the chart/song components used by current charts.

## Search
`search.html`

Search:
- songs
- artists
- charts
- genres
- lyrics

Group results by type.

## Menu
`menu.html`:
- Profile
- Edit Profile
- Liked Songs
- Favourite Artists
- Favourite Charts
- Playlists
- Voting History
- Artist Dashboard
- Submit Music
- Notifications
- Settings
- Privacy
- Terms
- Help

## Data model
Use shared entities:
- User
- Artist
- Song
- Genre
- Chart
- ChartEntry
- Vote
- Submission
- Playlist
- Favourite
- YouTubeVideo
- Advert
- RadioShow

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
└── becomesNewMusicItem

Chart
└── chartEntries
```

## Frontend architecture
Do not duplicate large blocks of HTML.

Recommended:
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

/css
  trackhype.css
  components.css
  mobile.css

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

/assets
  icons/
  artists/
  songs/
  charts/
  adverts/
```

Shared components:
- AppHeader
- BottomPlayer
- BottomNavigation
- SongCard
- ChartCard
- ArtistCard
- PlaylistItem
- AdvertCard
- GenreSection
- ChartHeader
- YouTubePlayer
- FavouriteButton
- FilterBar
- ModalSheet

## Performance
Optimise for Zimbabwean mobile users and lower bandwidth:
- lazy-loaded images
- correctly sized thumbnails
- compressed artwork
- deferred JavaScript
- deferred YouTube embeds
- lightweight initial render
- minimal unnecessary API calls

## Ads
Hyped may contain paid ads. Use a reusable AdvertCard. Ads must not cover voting or navigation controls.

## Production authentication
Onboarding should eventually connect to real user accounts so preferences, favourites, playlists, and voting history follow the user across devices.

## Production payment
Prepare `submit-music.html` for a real payment gateway. Show `$10.00 USD per song`. Payment creates a payment/submission record and does not guarantee chart placement.

## Final lifecycle
```text
Artist
↓
Submission
↓
Payment
↓
Moderation
↓
Approved
↓
New Music
↓
Discovery
↓
Chart Eligibility
↓
Official Chart
↓
Voting
↓
Global Ranking
↓
Chart History
```

The critical distinctions are:

```text
SUBMISSION != OFFICIAL CHART
NEW MUSIC != OFFICIAL CHART
PAYMENT != CHART PLACEMENT
```

Build everything as one unified mobile Android portrait-first platform.
