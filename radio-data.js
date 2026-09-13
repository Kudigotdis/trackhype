(function(){
  function logo(country, file){
    return "Assets/logos/Radio Stations/" + country + "_Radio_Stations/" + file;
  }

  var RADIO_STATIONS = [
    {id:"radio-zimbabwe",   name:"Radio Zimbabwe",  country:"Zimbabwe", region:"National (Public)", freq:"–",  logo:logo("Zimbabwe","Radio_Zimbabwe_Logo.jpg"),                                focus:"Local languages, Zimbabwean culture and community news; Sungura, Gospel, Chimurenga and traditional music."},
    {id:"power-fm",         name:"Power FM",         country:"Zimbabwe", region:"National (Public)", freq:"–",  logo:logo("Zimbabwe","Power_FM_Logo.jpg"),                                        focus:"National urban contemporary station targeted at youth: Zimdancehall, Zim Hip Hop, Afro-pop and urban contemporary hits."},
    {id:"national-fm",      name:"National FM",      country:"Zimbabwe", region:"National (Public)", freq:"–",  logo:logo("Zimbabwe","National_FM_Logo.jpg"),                                     focus:"Dedicated entirely to minority languages, indigenous traditions and ethnic cultural programming."},
    {id:"classic-263",      name:"Classic 263",      country:"Zimbabwe", region:"National (Public)", freq:"–",  logo:logo("Zimbabwe","Classic_263_FM_Logo.jpg"),                                  focus:"Talk radio, current affairs and classic music (formerly Spot FM/SFM)."},

    {id:"star-fm",          name:"Star FM",          country:"Zimbabwe", region:"National (Commercial)", freq:"89.7 MHz", logo:logo("Zimbabwe","Star_fm_logo.jpg"),                                           focus:"Zimbabwe's first commercial station, catering to urban youth, contemporary pop and mainstream hits."},
    {id:"zifm-stereo",      name:"ZiFM Stereo",      country:"Zimbabwe", region:"National (Commercial)", freq:"106.1 MHz", logo:logo("Zimbabwe","zifm_logo.png"),                                              focus:"The country's first privately owned urban music and talk station — global pop, regional hits and polished local productions."},

    {id:"capitalk",         name:"Capitalk 100.4 FM",  country:"Zimbabwe", region:"Harare",        freq:"100.4 MHz", logo:logo("Zimbabwe","Capitalk__FM_logo.png"),                                        focus:"Capital city talk radio, news and current affairs."},
    {id:"skyz-metro",       name:"Skyz Metro FM",     country:"Zimbabwe", region:"Bulawayo",      freq:"100.3 MHz", logo:logo("Zimbabwe","Skyz Metro FM.png"),                                               focus:"Bulawayo urban culture and music."},
    {id:"khulumani",        name:"Khulumani FM",      country:"Zimbabwe", region:"Bulawayo",      freq:"95.0 MHz",  logo:logo("Zimbabwe","Khulumani_FM_logo.jpg"),                                         focus:"The broader Bulawayo metropolitan community."},
    {id:"diamond-fm",       name:"Diamond FM",        country:"Zimbabwe", region:"Mutare (Manicaland)", freq:"103.8 MHz", logo:logo("Zimbabwe","Diamond_FM_logo.png"),                                         focus:"Regional coverage for the Manicaland province."},
    {id:"midlands-984",     name:"98.4 Midlands",     country:"Zimbabwe", region:"Gweru (Midlands)", freq:"98.4 MHz", logo:logo("Zimbabwe","984_Midlands_FM_Logo.png"),                                      focus:"Youth, contemporary music and local entertainment."},
    {id:"central-958",      name:"95.8 Central Radio",country:"Zimbabwe", region:"Gweru (Midlands)", freq:"95.8 MHz", logo:logo("Zimbabwe","958_ Central_Radio_FM_Logo.jpg"),                                focus:"Commercial talk and local news for the Midlands area."},
    {id:"breeze-fm",        name:"Breeze FM",         country:"Zimbabwe", region:"Victoria Falls", freq:"91.2 MHz", logo:logo("Zimbabwe","Breeze_FM_logo.jpg"),                                              focus:"Victoria Falls tourism hub and local community news."},
    {id:"yafm",             name:"YAFM",              country:"Zimbabwe", region:"Zvishavane",     freq:"91.8 MHz", logo:logo("Zimbabwe","YAFM_FM_logo.jpg"),                                                focus:"Tailored around the mining community, local news and music."},
    {id:"hevoi-fm",         name:"Hevoi FM",          country:"Zimbabwe", region:"Masvingo",       freq:"100.2 MHz", logo:logo("Zimbabwe","Hevoi_FM_Logo.jpg"),                                               focus:"Masvingo provincial news and regional programming."},
    {id:"nyaminyami-fm",    name:"Nyaminyami FM",     country:"Zimbabwe", region:"Kariba (Zambezi Valley)", freq:"94.5 MHz", logo:logo("Zimbabwe","Nyaminyami_FM_Logo.jpg"),                                     focus:"Serves the Zambezi Valley community with local content."},

    {id:"rb1",              name:"Radio Botswana 1 (RB1)", country:"Botswana", region:"National (Public)", freq:"–", logo:logo("Botswana","Radio_Botswana_1-RB1_FM_Logo.jpg"),                             focus:"National heritage, agricultural programming, news and traditional folk rhythms (Setapa, Borankana, Dikwaere)."},
    {id:"rb2",              name:"Radio Botswana 2 (RB2)", country:"Botswana", region:"National (Public)", freq:"–", logo:logo("Botswana","Radio_Botswana_2_(RB2)_FM_Logo.jpg"),                           focus:"Commercial youth wing of state broadcasting: pop, Amapiano, Afro-house, Hip Hop and local urban tracks."},
    {id:"yarona-fm",        name:"Yarona FM",         country:"Botswana", region:"Gaborone",       freq:"106.6 FM", logo:logo("Botswana","Yarona_FM_Logo.jpg"),                                              focus:"Gaborone's urban youth station: Motswako, Hip-Hop, Amapiano and pop chart-toppers."},
    {id:"gabz-fm",          name:"Gabz FM",           country:"Botswana", region:"Gaborone",       freq:"96.2 FM",  logo:logo("Botswana","Gabz_FM_Logo.png"),                                               focus:"Adult contemporary station for mature professionals: talk shows, jazz, soul and classic hits."},
    {id:"duma-fm",          name:"Duma FM",           country:"Botswana", region:"National (Commercial)", freq:"93.0 FM", logo:logo("Botswana","Duma_FM_Logo.jpg"),                                             focus:"Family-oriented commercial station balancing talk radio, news and diverse music genres."}
  ];

  var RADIO_CHARTS = {
    "radio-zimbabwe":[
      {title:"Glow Petroleum Top 20", sponsor:"Glow Petroleum", songs:20, day:"Saturday afternoons", presenter:"Richmond Siyakurima (DJ Sorojena) / Tarisai Chipere", info:"The flagship weekly countdown on Radio Zimbabwe tracking the hottest nationwide Sungura, Kanindo and Gospel releases voted for by listeners via SMS and digital platforms."},
      {title:"Radio Zimbabwe Gospel Top 20", sponsor:"Moonlight Funeral Services / Corporate partners", songs:20, day:"Sunday mornings", presenter:"Rutendo Makuti", info:"Dedicated strictly to Zimbabwean Christian music, highlighting top local gospel acts across Shona and Ndebele gospel releases."},
      {title:"Radio Zimbabwe End of Year Top 50 (Coca-Cola Top 50)", sponsor:"Coca-Cola Zimbabwe", songs:50, day:"December 31st (Annual)", presenter:"Combined Radio Zimbabwe On-Air Team", info:"The premier annual countdown, determining the official 'Song of the Year' based on cumulative year-long listener votes."}
    ],
    "power-fm":[
      {title:"Power FM Top 40", sponsor:"Econet Wireless / Buddie", songs:40, day:"Saturday mid-mornings to afternoon", presenter:"DJ Butterphly (Vimbai Mukondiwa) / MC BaFadzie", info:"The core weekly music index measuring airplay, request statistics and audience streaming trends across domestic and regional urban hits."},
      {title:"The Zimdancehall Top 10", sponsor:"Chillspot Recordz / Independent sponsors", songs:10, day:"Friday evenings", presenter:"DJ Skwila (Elder Skwila)", info:"A localized niche chart show tracking high-energy Zimdancehall riddims and street anthems directly from ghetto studios across Mbare, Chitungwiza and beyond."},
      {title:"Power FM Annual End of Year Top 100", sponsor:"Coca-Cola / Delta Corporation", songs:100, day:"December 31st (Annual marathon broadcast)", presenter:"Full Power FM DJ Roster", info:"The country's largest annual countdown, airing non-stop on New Year's Eve to rank the 100 biggest hits that dominated Zimbabwean urban airwaves."}
    ],
    "national-fm":[
      {title:"National FM Top 20 Cultural Countdown", sponsor:"Zimbabwe Cultural Heritage Trust / Local Agri-sponsors", songs:20, day:"Saturday afternoons", presenter:"Philip Makazhu / Rachel Chauke", info:"Highlights local music sang across Zimbabwe's 16 official languages (Tonga, Venda, Shangani, Kalanga, Ndau, Sotho, etc.)."},
      {title:"Tshibilika / Insimbi Top 10", sponsor:"Local Transport & Mining Enterprises", songs:10, day:"Sunday afternoons", presenter:"Ratidzai Ndlovu", info:"Dedicated to fast-paced Tshibilika / Rhumba rhythms originating from the Matabeleland regions and cross-border Zimbabwean acts."},
      {title:"National FM Monthly Top 15 Pick", sponsor:"Community Development Partners", songs:15, day:"Last Friday of every month", presenter:"Rachel Chauke", info:"A curated monthly rundown evaluating top emerging roots and folk tracks submitted by regional art centers and grassroots music hubs."}
    ],
    "classic-263":[
      {title:"Classic 263 Golden Oldies Top 10", sponsor:"First Mutual Health / Corporate sponsors", songs:10, day:"Sunday mid-mornings", presenter:"Terence Mapurisana", info:"A nostalgic weekly chart spotlighting classic local and international tracks from the 1970s, 80s and 90s (Jazz, Soul, Vintage Afro-pop)."},
      {title:"The Sunday Jazz & Blues Chart (Top 10)", sponsor:"Private Corporate Partners", songs:10, day:"Sunday evenings", presenter:"Carlton Majuru", info:"Tracks top jazz, smooth blues and instrumental releases from local jazz maestros and international classic artists."},
      {title:"Classic 263 Reggae Top 20", sponsor:"Red Rose Entertainment / Rastafari Cultural Movement", songs:20, day:"Saturday evenings", presenter:"Terence Mapurisana ('The Reggae Doctor')", info:"Classic 263's longest-running specialty chart show, focusing exclusively on classic Roots Reggae, Lovers Rock and Dub tracks."}
    ],
    "star-fm":[
      {title:"The Star Hitlist Top 20", sponsor:"Chapelton / Dairibord Zimbabwe", songs:20, day:"Saturday mid-mornings (10:00 AM – 12:00 PM)", presenter:"TxT (Tinashe Tchikaria) / DJ Ollah 7", info:"The flagship commercial countdown in Harare, tracking urban Zim contemporary music, Afrobeats and Zimdancehall trends based on requests and streaming charts."},
      {title:"Star FM Gospel Greats (Top 15)", sponsor:"Nyaradzo Life Assurance", songs:15, day:"Sunday mornings", presenter:"Napoleon Nyanhi / Leander Kandiero", info:"A high-profile Sunday morning urban gospel countdown ranking the biggest contemporary praise and worship hits across the nation."},
      {title:"Star FM All-Star Top 50 (Year-End Countdown)", sponsor:"Carling Black Label / Econet", songs:50, day:"December 31st (Annual)", presenter:"Star FM Drive & Entertainment Crew", info:"Star FM's annual flagship chart ranking the year's overall top 50 urban releases based on heavy listener interaction and year-long chart placements."}
    ],
    "zifm-stereo":[
      {title:"ZiTop40", sponsor:"Cassava Smartech / Sasai Money Transfer", songs:40, day:"Saturday afternoons (12:00 PM – 3:00 PM)", presenter:"T-Miks / Nonkie", info:"A high-octane weekend chart show tracking global Billboard hits, SA Amapiano, Afrobeats and top Zimbabwean urban bangers."},
      {title:"The ZiFM Local Velocity Top 10", sponsor:"Castle Lite", songs:10, day:"Thursday drive time", presenter:"DJ Munya (Munya Milimo)", info:"Designed strictly to support upcoming homegrown Zimbabwean talent, spotlighting rising urban artists across Zim Hip Hop and Afro-fusion."},
      {title:"ZiFM End of Year Top 100", sponsor:"EcoCash", songs:100, day:"December 31st (Annual)", presenter:"Complete ZiFM Stereo DJ Team", info:"An exhaustive 100-track marathon chart selecting the ultimate song of the year across global and local categories."}
    ],
    "capitalk":[
      {title:"The Harare Drive Top 10", sponsor:"Simbisa Brands (Chicken Inn/Pizza Inn)", songs:10, day:"Friday afternoons (Drive Time)", presenter:"Dee-Knife & The Drive Team", info:"Focuses strictly on trending 'talk of the town' singles across Harare, prioritizing local urban club tracks, Zim Hip Hop and Afro-pop."},
      {title:"Capitalk Gospel Greats Top 10", sponsor:"Utande / Corporate Partners", songs:10, day:"Sunday evenings (6:00 PM – 9:00 PM)", presenter:"Monaz Patonaz", info:"Highlights local Harare praise and worship anthems, city choir releases and inspirational gospel singles."},
      {title:"Capitalk College Nights Urban Top 15", sponsor:"Local Campus / Telecom Partners", songs:15, day:"Saturday evenings (6:00 PM – 9:00 PM)", presenter:"Chairman / Student Guest DJs", info:"Target-curated for Harare's tertiary students, featuring indie-urban music, underground Zim Hip Hop and trendy dance tracks."}
    ],
    "diamond-fm":[
      {title:"Manicaland Top 20 Countdown", sponsor:"Spar Mutare / OK Zimbabwe", songs:20, day:"Saturday mornings", presenter:"DJ Kupper (Kudzai Mabouw) / Barbra Vhengedza", info:"The flagship regional countdown giving 60%+ airplay preference to musicians based in Mutare, Chipinge, Nyanga and Rusape."},
      {title:"Diamond FM Gospel Express Top 10", sponsor:"Golden Peacock Hotel / Local Businesses", songs:10, day:"Sunday mid-mornings", presenter:"Shiftberg / Prudence Gwisai", info:"Dedicated to local Manicaland gospel artists and traditional church ministry recordings within the Eastern Highlands region."},
      {title:"Diamond FM Sungura & Local Heritage Top 10", sponsor:"Murahwa Green Market Merchants / Local SMEs", songs:10, day:"Friday evenings", presenter:"King Fresh", info:"Focuses heavily on Sungura, Kanindo and Ndau traditional folk tracks that dominate rural and peri-urban Manicaland business centers."}
    ],
    "skyz-metro":[
      {title:"Skyz Metro Top 20", sponsor:"Bulawayo Corporate Partners", songs:20, day:"Saturday afternoons", presenter:"Skyz Metro On-Air Crew", info:"The flagship weekly countdown tracking Bulawayo urban culture, Amapiano, Afro-pop and Zim Hip Hop hits."},
      {title:"The Bulawayo Drive Top 10", sponsor:"Local Midlands & Matebeleland Businesses", songs:10, day:"Friday drive time", presenter:"Skyz Drive Team", info:"Tracks trending local and regional singles across Bulawayo, prioritizing homegrown urban and Afro-fusion acts."},
      {title:"Skyz Gospel Pulse Top 10", sponsor:"Corporate Partners", songs:10, day:"Sunday mornings", presenter:"Skyz Metro Gospel Host", info:"A Sunday gospel countdown ranking contemporary praise, worship and inspirational releases."}
    ],
    "khulumani":[ 
      {title:"Khulumani Top 20", sponsor:"Bulawayo Metropolitan Partners", songs:20, day:"Saturday mid-mornings", presenter:"Khulumani On-Air Crew", info:"The flagship weekly countdown serving the broader Bulawayo metropolitan community with local music and culture."},
      {title:"The Matebeleland Heritage Top 10", sponsor:"Local Cultural Organisations", songs:10, day:"Sunday afternoons", presenter:"Khulumani Heritage Host", info:"Spotlights traditional Ndebele, Kalanga and community heritage music across the Matebeleland provinces."},
      {title:"Khulumani Vibes Top 10", sponsor:"Regional SME Sponsors", songs:10, day:"Friday evenings", presenter:"Khulumani Vibes DJ", info:"A youth-focused urban chart tracking contemporary hits, Amapiano and Afro-pop in the Bulawayo metro."}
    ],
    "midlands-984":[
      {title:"Midlands Youth Top 20", sponsor:"Local Gweru Businesses", songs:20, day:"Saturday afternoons", presenter:"98.4 Midlands On-Air Crew", info:"The flagship youth countdown ranking contemporary music and local entertainment for the Midlands region."},
      {title:"Midlands Urban Top 10", sponsor:"Regional Telecom Partners", songs:10, day:"Friday evenings", presenter:"98.4 Midlands DJ", info:"Tracks trending urban hits, Amapiano and Zim dancehall across Gweru and the Midlands."},
      {title:"Midlands Gospel Top 10", sponsor:"Local Corporate Partners", songs:10, day:"Sunday mornings", presenter:"98.4 Midlands Gospel Host", info:"A Sunday gospel countdown featuring local praise, worship and inspirational releases."}
    ],
    "central-958":[
      {title:"Midlands Talk & News Top 10", sponsor:"Local Midlands Sponsors", songs:10, day:"Weekday drive time", presenter:"95.8 Central News Team", info:"Highlights the top talking points, current affairs and local news stories shaping the Midlands area."},
      {title:"Central Vibrations Top 20", sponsor:"Regional Commercial Partners", songs:20, day:"Saturday mid-mornings", presenter:"95.8 Central On-Air Crew", info:"The flagship commercial music countdown tracking local and regional hits across the Midlands."},
      {title:"The Breakfast Power Top 10", sponsor:"Local Agri & SME Sponsors", songs:10, day:"Weekday mornings", presenter:"95.8 Central Breakfast Host", info:"A morning chart ranking the most-requested tracks and local favourites for Midlands listeners."}
    ],
    "breeze-fm":[
      {title:"Victoria Falls Top 20", sponsor:"Tourism & Hospitality Partners", songs:20, day:"Saturday afternoons", presenter:"Breeze FM On-Air Crew", info:"The flagship countdown for the Victoria Falls tourism hub, blending local community news with top hits."},
      {title:"The Tourist Tunes Top 10", sponsor:"Local Hospitality Sponsors", songs:10, day:"Sunday mid-mornings", presenter:"Breeze FM Travel Host", info:"Curates the soundtrack of the Falls — international, Afro and tourism-driven tracks heard across the resort town."},
      {title:"Breeze Gospel Top 10", sponsor:"Community Partners", songs:10, day:"Sunday evenings", presenter:"Breeze FM Gospel Host", info:"A Sunday gospel chart featuring local praise, worship and inspirational releases."}
    ],
    "yafm":[ 
      {title:"The Mining Community Top 20", sponsor:"Zvishavane Mining Partners", songs:20, day:"Saturday mid-mornings", presenter:"YAFM On-Air Crew", info:"Tailored around the mining community, ranking local news, music and entertainment for Zvishavane."},
      {title:"YAFM Urban Top 10", sponsor:"Local Businesses", songs:10, day:"Friday evenings", presenter:"YAFM DJ", info:"A youth-focused urban chart tracking contemporary hits, Amapiano and Afro-pop."},
      {title:"YAFM Gospel Top 10", sponsor:"Corporate Sponsors", songs:10, day:"Sunday mornings", presenter:"YAFM Gospel Host", info:"A Sunday gospel countdown featuring local praise, worship and inspirational releases."}
    ],
    "hevoi-fm":[
      {title:"Masvingo Top 20", sponsor:"Masvingo Provincial Partners", songs:20, day:"Saturday afternoons", presenter:"Hevoi FM On-Air Crew", info:"The flagship weekly countdown delivering Masvingo provincial news and regional programming."},
      {title:"The Great Zimbabwe Tunes Top 10", sponsor:"Local Heritage Organisations", songs:10, day:"Sunday afternoons", presenter:"Hevoi FM Heritage Host", info:"Spotlights traditional and modern music celebrating Masvingo and Zimbabwean heritage."},
      {title:"Hevoi Urban Top 10", sponsor:"Regional SME Sponsors", songs:10, day:"Friday evenings", presenter:"Hevoi FM DJ", info:"A youth-focused urban chart tracking contemporary hits and Afro-pop for Masvingo."}
    ],
    "nyaminyami-fm":[
      {title:"Kariba Top 20", sponsor:"Zambezi Valley Partners", songs:20, day:"Saturday mid-mornings", presenter:"Nyaminyami FM On-Air Crew", info:"The flagship weekly countdown serving the Zambezi Valley community with local content."},
      {title:"The River Rhythms Top 10", sponsor:"Local Fisheries & Tourism Sponsors", songs:10, day:"Sunday afternoons", presenter:"Nyaminyami FM Host", info:"Curates local and regional music reflecting the culture of the Kariba and Zambezi Valley community."},
      {title:"Nyaminyami Gospel Top 10", sponsor:"Community Partners", songs:10, day:"Sunday mornings", presenter:"Nyaminyami FM Gospel Host", info:"A Sunday gospel chart featuring local praise, worship and inspirational releases."}
    ],

    "rb1":[
      {title:"RB1 Dipina le Maboko Top 10", sponsor:"Department of Broadcasting Services (DBS) / Local Agri-sponsors", songs:10, day:"Sunday afternoons", presenter:"Thuso Letlhoma / Mogatusi 'Kgosiemang' Kwapa", info:"Highlights classic and modern Tswana folk music, traditional dance troupes and spoken word poetry, preserving indigenous languages and traditional arrangements."},
      {title:"Radio Botswana Gospel Top 15", sponsor:"Botswana Christian Council / Corporate Partners", songs:15, day:"Sunday mornings", presenter:"Masego Ditshwane", info:"Tracks nationwide releases in Tswana and English gospel, focusing on church choirs, localized praise music and spiritual solos."},
      {title:"RB1 Mmino wa Setso Monthly Top 20", sponsor:"Ministry of Youth, Gender, Sport and Culture", songs:20, day:"Last Saturday of every month", presenter:"Segametsi Bome", info:"A monthly index evaluating traditional folk, Ndazola and Kalanga cultural hits submitted from district cultural centers across Botswana."}
    ],
    "rb2":[
      {title:"RB2 Top 40 Countdown", sponsor:"Mascom Wireless", songs:40, day:"Saturday mid-mornings to afternoon", presenter:"DJ Sly (Unbathed/Sylvester) / Tefo 'T-Bags' Phatshwane", info:"RB2's flagship national weekly chart, tracking heavy-rotation singles, streaming trends and listener SMS votes across Botswana and the SADC region."},
      {title:"The Local Vibe Top 10", sponsor:"Botswana Telecommunications Corporation (BTC)", songs:10, day:"Friday evenings", presenter:"DJ Jazzy Dee", info:"A localized urban countdown 100% dedicated to home-grown Botswana artists, spanning Motswako Hip Hop, local Amapiano and Afro-pop bangers."},
      {title:"RB2 End of Year Top 100 Countdown", sponsor:"Orange Botswana / Mascom", songs:100, day:"December 31st (Annual marathon broadcast)", presenter:"Full RB2 On-Air Crew", info:"The state commercial station's largest annual show, determining the official 'Song of the Year' across regional, global and local categories."}
    ],
    "yarona-fm":[
      {title:"Yarona FM Top 40", sponsor:"Orange Botswana", songs:40, day:"Saturday afternoons (12:00 PM – 3:00 PM)", presenter:"King Bee / Ross L", info:"The premier commercial youth chart in Gaborone, measuring airplay, request statistics and club trends across urban hits."},
      {title:"The Motswako Express Top 10", sponsor:"Cresta Hotels / Local Youth Brands", songs:10, day:"Thursday evenings", presenter:"Resego Motlhokathari / DJ Izzy", info:"Specialized chart tracking Motswako Hip Hop (Tswana-lyric hip hop) from both Botswana and South African trailblazers."},
      {title:"Yarona FM Top 10 Dance & House Chart", sponsor:"Castle Lite", songs:10, day:"Friday mid-mornings", presenter:"DJ Fresh / Guest Resident DJs", info:"Highlights high-energy Amapiano, Afro-house and club tracks dominating Gaborone's nightlife and street culture."}
    ],
    "gabz-fm":[
      {title:"The Smooth Jazz & Soul Top 10", sponsor:"First National Bank Botswana (FNBB)", songs:10, day:"Sunday mid-mornings", presenter:"Kgosi 'Dollar Mac' Kgosidintsi", info:"Focuses on contemporary smooth jazz, neo-soul and African jazz hits, balancing international icons and local instrumentalists."},
      {title:"Gabz FM Adult Contemporary Top 20", sponsor:"Standard Chartered Botswana", songs:20, day:"Saturday mornings", presenter:"Brando Keabilwe", info:"Tracks global and regional pop, R&B and soft-rock releases tailored for mature adult listeners and working professionals."},
      {title:"African Classics Top 10", sponsor:"Stanbic Bank", songs:10, day:"Sunday afternoons", presenter:"Dollar Mac", info:"Highlights timeless African pop, classic Afro-fusion and heritage tracks from legendary continental acts."}
    ],
    "duma-fm":[
      {title:"The Duma FM Top 20 Countdown", sponsor:"Choppies Supermarkets", songs:20, day:"Saturday mid-mornings", presenter:"Goabaone 'Goaba' Mojakgosi", info:"A family-friendly chart ranking popular regional Afro-pop, gospel and mainstream commercial releases across Botswana."},
      {title:"Duma Gospel Hits Top 10", sponsor:"Metropolitan Botswana", songs:10, day:"Sunday mornings", presenter:"Kelebogile 'Kele' Tebogo", info:"Ranks praise and worship hits, choir arrangements and inspirational tracks across Southern Africa."},
      {title:"Duma FM Local Legends Top 10", sponsor:"Kgalagadi Breweries Limited (KBL)", songs:10, day:"Friday afternoons (Drive Time)", presenter:"Diggy B", info:"Focuses on homegrown Botswana musical talents across Borankana, Motswako and local pop styles."}
    ]
  };

  window.RADIO_STATIONS = RADIO_STATIONS;
  window.RADIO_CHARTS = RADIO_CHARTS;
})();
