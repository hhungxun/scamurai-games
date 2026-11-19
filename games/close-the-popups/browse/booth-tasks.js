/* Presentation only: emphasize existing task words without changing plain-text records. */
(() => {
  const actions = [
    ['search', 'find', 'compare', 'choose', 'select', 'set', 'tick', 'save', 'download', 'add', 'keep', 'check', 'open', 'avoid', 'track', 'plan'],
    ['搜索', '搜', '找到', '查询', '对比', '比较', '选择', '设为', '勾选', '勾', '收藏', '下载', '加入', '保存', '保留', '核对', '检查', '打开', '避开', '不要从赞助结果进入']
  ];
  const keywords = {
    'minute2-wall-earthrise': [
      ['Earthrise', '1972', '3840 × 2160', 'JPG', 'two versions', 'both'],
      ['Earthrise', '1972 年', '3840 × 2160', 'JPG', '两张']
    ],
    'minute2-recipe-budget': [
      ['Red lentil and tomato soup', 'RM5 per serving', 'six servings', 'red lentils', 'shopping list'],
      ['红扁豆番茄汤', 'RM5', '6 人份', '红扁豆', '采购清单']
    ],
    'minute2-tool-webp': [
      ['La Trobe Reading Room', 'WebP', 'width 800 px', '800 px', 'width 800', '70%', 'export settings'],
      ['拉筹伯阅览室', '选 WebP', 'WebP', '宽 800 px', '800 px', '宽 800', '70%', '导出设置']
    ],
    'minute2-movie-animation': [
      ['Sintel', 'Elephants Dream', 'watchlist', 'only those two'],
      ['辛特尔', '大象之梦', '想看片单', '只留这两部']
    ],
    'minute2-outing-craft': [
      ['Central Market', 'RM20', 'return journey', 'trip home', 'weather', 'departure list', 'departure checklist', 'indoors'],
      ['中央艺术坊', 'RM20', '返程', '天气', '出发清单', '室内']
    ],
    'minute2-book-verne': [
      ['Around the World in Eighty Days', 'English', 'French', 'both editions', 'TXT', 'opening excerpt'],
      ['八十天环游地球', '英文', '法文', '两个版本', 'TXT', '开篇']
    ],
    'minute2-museum-manet': [
      ['Manet', 'Boating', 'The Monet Family in Their Garden at Argenteuil', 'under 100 cm', 'narrower than 100 cm', '100 cm', 'My Exhibition', 'width'],
      ['Manet', '划船', '莫奈一家在阿让特伊的花园里', '宽度不到 100 cm', '100 cm', '我的展览', '较窄']
    ],
    'minute2-nature-woodpeckers': [
      ['woodpecker', 'Downy', 'Red-bellied Woodpecker', 'shorter', 'observation list', 'Length'],
      ['woodpecker', '绒啄木鸟', '红腹啄木鸟', '体长较短', '较短者', '观察清单', '体长']
    ],
    'minute2-travel-interchange': [
      ['KLCC', 'KJ', 'Bukit Bintang', '17:20', 'Less walking', 'KG'],
      ['KLCC', 'KJ', '武吉免登', '17:20', '较少步行', 'KG']
    ],
    'minute2-market-lens': [
      ['RM700', 'EOS 550D', 'Good', 'Excellent', 'camera and lens', 'lens included', 'body and lens', 'Included'],
      ['RM700', 'EOS 550D', '良好', '极佳', '机身和镜头', '含机身和镜头', '附带配件']
    ],
    'minute3-courier-redelivery': [
      ['TM24081301', 'tomorrow afternoon', 'Tomorrow', '14:00–18:00', 'campus parcel desk address', 'free redelivery'],
      ['TM24081301', '明天下午', '明天', '14:00–18:00', '校园收件处', '免费改约']
    ],
    'minute3-search-official': [
      ['Pixelpress', 'official', 'free', 'getting-started TXT', 'TXT', 'sponsored results', 'sponsored links', 'pixelpress.example'],
      ['Pixelpress', '官方站点', '官方结果', '免费', '入门说明 TXT', 'TXT', '赞助结果', 'pixelpress.example']
    ],
    'minute4-penang-indoor': [
      ['Malaysia', 'Penang', 'indoor attraction', 'at most 3 hours', '3 hours', 'RM30', 'three hours or less', '≤3h', '≤RM30'],
      ['马来西亚', '槟城', '室内景点', '最多 3 小时', '≤3小时', '不超过RM30', '≤RM30', 'RM30']
    ]
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const pattern = term => {
    const literal = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return (/^[a-z0-9]/i.test(term) ? '\\b' : '') + literal + (/[a-z0-9]$/i.test(term) ? '\\b' : '');
  };
  window.BROWSE_BOOTH_TASK_TEXT = (value, task, lang) => {
    const text = String(value ?? ''), index = lang === 'en' ? 0 : 1;
    const terms = [...new Set([...actions[index], ...(keywords[task?.id]?.[index] || [])])].sort((a,b) => b.length-a.length);
    const matches = new RegExp(terms.map(pattern).join('|'), 'gi');
    let html = '', end = 0;
    for (const match of text.matchAll(matches)) {
      html += escape(text.slice(end, match.index)) + '<strong class="br-task-key">' + escape(match[0]) + '</strong>';
      end = match.index + match[0].length;
    }
    return html + escape(text.slice(end));
  };
})();

/* Earlier round records still resolve their original briefs and answers. */
window.BROWSE_BOOTH_LEGACY_TASKS = [
  {
    id: 'minute-wall-aurora', scene: 'wallpapers', file: 'wallpaper.html', site: 'Stillwall',
    title: ['Green light from orbit', '绿色轨道壁纸'],
    brief: ['Find a NASA photograph of a green aurora taken from orbit in 2012. Save it and download a 2560 × 1440 wallpaper.', '找一张2012年从轨道拍摄的NASA绿色极光照片，收藏，并下载2560 × 1440壁纸。'],
    goals: [['Save the correct photograph.', '收藏正确的照片。'], ['Export its wallpaper at 2560 × 1440.', '为它导出2560 × 1440壁纸。']],
    route: [['Search “aurora”, or filter NASA + green.', '搜索 aurora 或“极光”，也可筛选NASA＋绿色。'], ['Open “Orbital aurora” and check the date: 2012-03-03.', '打开“轨道极光”，核对日期2012-03-03。'], ['Save it, select 2560 × 1440 and download.', '加入收藏，选2560 × 1440，再下载壁纸。']],
    answer: ['Orbital aurora · orbital-aurora · NASA iss030e119777. Check the export record and, where possible, the downloaded file; a button click alone does not prove a file was saved.', '轨道极光 · orbital-aurora · NASA iss030e119777。核对导出记录；可行时检查下载文件。只点下载按钮不代表文件已保存。'],
    cover: 'assets/nasa-iss030e119777-thumb.webp', advanced: false
  },
  {
    id: 'minute-recipe-lunch', scene: 'recipes', file: 'recipe.html', site: 'Pantry & Plate',
    title: ['Lunch for four', '四人份午餐'],
    brief: ['Find a no-cook vegan chickpea lunch ready within 15 minutes. Set it to four servings and save the recipe.', '找一道不用开火、15分钟内能做好的鹰嘴豆纯素午餐，将份量改为4人，并收藏。'],
    goals: [['Save the correct recipe.', '收藏正确的食谱。'], ['Set the servings to 4.', '把份量设为4人。']],
    route: [['Search “chickpea”.', '搜索 chickpea 或“鹰嘴豆”。'], ['Open “Lemon chickpea & cucumber salad”; check vegan, no-cook and 10 minutes.', '打开“柠檬鹰嘴豆黄瓜沙拉”，核对纯素、无需烹饪和10分钟。'], ['Set 4 servings and save.', '选择4人份，再收藏。']],
    answer: ['chickpea-salad. The two-serving recipe uses 240 g chickpeas; four servings show 480 g. Asking this is an optional spoken check.', 'chickpea-salad。原配方2人份用240 g鹰嘴豆，4人份显示480 g；可口头询问，作为额外核对。'],
    cover: 'assets/real-food-chickpea-salad-thumb.webp', advanced: false
  },
  {
    id: 'minute-tool-webp', scene: 'tools', file: 'tools.html', site: 'Pixelpress',
    title: ['An image made for the web', '导出网页图片'],
    brief: ['Use the “Chinatown after dark” sample to export a WebP image, 1280 pixels wide, at 75% quality.', '使用“唐人街入夜”示例，导出宽1280像素、质量75%的WebP图片。'],
    goals: [['Use “Chinatown after dark”.', '使用“唐人街入夜”示例。'], ['Choose WebP, width 1280 and quality 75%.', '选择WebP、宽1280、质量75%。'], ['Generate the result and download it.', '生成结果，并下载图片。']],
    route: [['Load “Chinatown after dark”.', '加载“唐人街入夜 / Chinatown after dark”。'], ['Choose WebP, width 1280, quality 75%.', '格式选WebP、宽1280、质量75%。'], ['Generate, inspect the result and download.', '生成并检查结果，再下载。']],
    answer: ['Sample city · blue-hour-street. The 2400 × 1600 source becomes 1280 × 853 with its aspect ratio kept. Output bytes vary by browser.', '示例city，对应blue-hour-street。源图2400 × 1600，保持比例后为1280 × 853。不同浏览器的文件字节数可能不同。'],
    cover: 'assets/real-wall-blue-hour-street-thumb.webp', advanced: false
  },
  {
    id: 'minute-movie-steel', scene: 'movies', file: 'movie.html', site: 'Frame Movies',
    title: ['A short science-fiction find', '找到科幻短片'],
    brief: ['Find an English-language science-fiction short released in 2012, directed by Ian Hubert and under 15 minutes. Add it to your watchlist.', '找一部2012年、Ian Hubert执导、片长不到15分钟的英语科幻短片，并加入想看片单。'],
    goals: [['Add the correct film to your watchlist.', '把正确电影加入想看片单。']],
    route: [['Filter by year, language and running time, or search “Ian Hubert”.', '使用年份、语言、片长筛选，或搜索 Ian Hubert。'], ['Open “Tears of Steel”; check 2012, Ian Hubert and about 12 minutes.', '打开“Tears of Steel”，核对2012、Ian Hubert和约12分钟。'], ['Add it to your watchlist.', '加入想看片单。']],
    answer: ['steel · Tears of Steel. Watching the whole film or local preview is not required; their running times differ.', 'steel · Tears of Steel。无需看完整影片或当地预览片段；两者时长不同。'],
    cover: 'assets/video-steel.jpg', advanced: false
  },
  {
    id: 'minute-outing-museum', scene: 'events', file: 'events.html', site: 'Out There KL',
    title: ['A museum for a rainy day', '雨天去博物馆'],
    brief: ['Find an indoor history-museum outing in Kuala Lumpur, reachable by rail, taking at most 3 hours with a planning budget no higher than RM30. Add it to your weekend plan.', '寻找吉隆坡一条室内历史博物馆路线，能够搭轨道交通到达、最多3小时、参考预算不超过RM30，并加入周末计划。'],
    goals: [['Add the correct outing to your weekend plan.', '把正确路线加入周末计划。']],
    route: [['Search “museum”.', '搜索 museum 或“博物馆”。'], ['Check indoor, rail access, 3 hours and RM30.', '核对室内、轨道交通、3小时和RM30。'], ['Open “A slow walk through the museum timeline”, check the National Museum and add it to your plan.', '打开“沿博物馆时间线慢慢看”，核对国家博物馆，再加入周末计划。']],
    answer: ['museum-four-galleries. RM30 is a planning allowance in the practice website, not a live ticket quote.', 'museum-four-galleries。RM30是练习网页的规划预留，并非实时门票报价。'],
    cover: 'assets/real-outing-museum-four-galleries-thumb.webp', advanced: false
  },
  {
    id: 'minute-book-alice', scene: 'books', file: 'book.html', site: 'Folio',
    title: ['Follow the White Rabbit', '追随白兔'],
    brief: ['Find an English fantasy first published in 1865, in which a girl follows a white rabbit. Save the book and download its opening excerpt as a TXT file.', '找一本1865年首次出版、女孩追随白兔的英语奇幻作品，加入阅读清单，并下载开篇片段TXT。'],
    goals: [['Add the correct book to your reading list.', '把正确书籍加入阅读清单。'], ['Download its opening excerpt as TXT.', '下载它的开篇片段TXT。']],
    route: [['Filter Fantasy + English, or search “rabbit”.', '筛选奇幻＋英语，或搜索 rabbit。'], ['Open “Alice’s Adventures in Wonderland”; check Lewis Carroll and 1865, then save.', '打开“Alice’s Adventures in Wonderland”，核对Lewis Carroll和1865，再加入清单。'], ['Open the reading excerpt and choose “Download this excerpt”.', '打开阅读片段，点击“下载此片段”。']],
    answer: ['alice · Alice’s Adventures in Wonderland. Reading view: book.html?id=alice&view=read. File: folio-alice-excerpt.txt. Marking it read is not required.', 'alice ·《爱丽丝梦游仙境》。片段路由book.html?id=alice&view=read；文件folio-alice-excerpt.txt。无需标记已读。'],
    cover: 'assets/culture-book-alice-thumb.webp', advanced: false
  },
  {
    id: 'minute-museum-wave', scene: 'museum', file: 'museum.html', site: 'Open Collection',
    title: ['A great wave, a distant mountain', '寻找巨浪与富士山'],
    brief: ['Find a Japanese woodblock print from about 1830–1832, with a great wave surrounding a small mountain in the distance. Add it to “My exhibition”.', '找一幅约1830—1832年的日本木版画，画中巨浪围绕远处的小山，将它加入“我的展览”。'],
    goals: [['Add the correct artwork to “My exhibition”.', '把正确作品加入“我的展览”。']],
    route: [['Filter Woodblock print + Japan, or use search.', '筛选木版画＋Japan，也可使用搜索。'], ['Open “Under the Wave off Kanagawa / The Great Wave”; check Katsushika Hokusai and about 1830–32.', '打开“Under the Wave off Kanagawa / The Great Wave”，核对Katsushika Hokusai和约1830–32。'], ['Add it to “My exhibition”.', '加入“我的展览”。']],
    answer: ['56353 · Katsushika Hokusai, Under the Wave off Kanagawa (The Great Wave). Other valid search and browsing routes are equally acceptable.', '56353 · 葛饰北斋《神奈川冲浪里》。其他有效的搜索或目录路线同样可以。'],
    cover: 'assets/culture-art-56353-thumb.webp', advanced: false
  },
  {
    id: 'minute-nature-cardinal', scene: 'nature', file: 'nature.html', site: 'Field Guide',
    title: ['Name the red garden bird', '识别花园红鸟'],
    brief: ['In the North American bird guide, identify a red garden bird with a pointed crest and a thick orange-red bill. Add it to your observation list.', '在北美鸟类资料中，找出花园里有尖羽冠、橙红色粗喙的红色鸟，并加入观察清单。'],
    goals: [['Add the correct bird to your observation list.', '把正确鸟类加入观察清单。'], ['Show the crest and bill field marks to the staff.', '向工作人员核对尖羽冠和喙的特征。']],
    route: [['Filter Red + Garden.', '筛选红色＋花园。'], ['Open “Northern Cardinal”; check the pointed crest and thick bill.', '打开“Northern Cardinal / 北美红雀”，核对尖羽冠和粗喙。'], ['Add it using the existing default observation fields.', '使用页面已有默认观察字段加入清单。']],
    answer: ['cardinal · Northern Cardinal. Red colour alone is not enough: House Finch is not the target. Field-mark recognition is a staff check.', 'cardinal · 北美红雀。不能只凭红色选House Finch；外观特征由工作人员核对。'],
    cover: 'assets/journey-cardinal-0-thumb.webp', advanced: false
  },
  {
    id: 'minute-travel-klcc', scene: 'travel', file: 'travel.html', site: 'Trackside',
    title: ['From Sentral to KLCC', '从中央车站去KLCC'],
    brief: ['Plan and save a journey leaving at 10:00 from KL Sentral on the Kelana Jaya line to KLCC.', '规划10:00从KL Sentral的Kelana Jaya线站点到KLCC的行程，并保存路线。'],
    goals: [['Set KL Sentral (KJ) → KLCC (KJ), at 10:00.', '设置KL Sentral（KJ）→ KLCC（KJ），时间10:00。'], ['Save the journey with 0 interchanges.', '保存0次换乘的行程。']],
    route: [['Set departure to KL Sentral (KJ), arrival to KLCC (KJ).', '出发选KL Sentral（KJ），到达选KLCC（KJ）。'], ['Keep the default date, set 10:00 and plan the journey.', '保留默认日期，时间设10:00，再规划。'], ['Inspect the recommendation and save it.', '查看推荐路线，再保存行程。']],
    answer: ['From sentral-kj to klcc, 10:00, 0 interchanges. The practice timetable gives boarding 10:06, arrival 10:19 and exit 10:21. No ICS export is required.', 'sentral-kj → klcc，10:00，0次换乘。练习时刻表为10:06上车、10:19到站、10:21出站。无需导出ICS。'],
    cover: 'assets/journey-rail-train-0-thumb.webp', advanced: true
  },
  {
    id: 'minute-market-starter', scene: 'market', file: 'market.html', site: 'loop',
    title: ['A camera body under RM500', 'RM500内的相机机身'],
    brief: ['Find a Canon DSLR body in Kuala Lumpur, in Good condition, for no more than RM500. Save the listing and check whether a lens is included.', '寻找位于吉隆坡、状态Good、RM500以内的Canon单反机身，收藏，并核对是否包含镜头。'],
    goals: [['Save the correct listing.', '收藏正确的刊登。'], ['Tell the staff whether a lens is included.', '向工作人员说明是否包含镜头。']],
    route: [['Filter Canon + Good + maximum RM500 + Kuala Lumpur.', '筛选Canon＋Good＋最高价500＋Kuala Lumpur。'], ['Open the RM420 Canon EOS 550D and read what is included.', '打开RM420的Canon EOS 550D，阅读附带物品。'], ['Save the listing and confirm it is body only.', '收藏，并核对是body only。']],
    answer: ['canon-good · RM420. Body, battery, charger and body cap; no lens. This is a fictional practice listing; the reference photograph is illustrative.', 'canon-good · RM420。包含机身、电池、充电器、机身盖，不含镜头。这是练习用虚构刊登，参考照片仅作展示。'],
    cover: 'assets/market-canon-eos-550d.webp', advanced: true
  }
];

/* Current booth briefs. Cover images illustrate each site without revealing its answer. */
window.BROWSE_BOOTH_TASKS = [
  {
    id: "minute2-wall-earthrise",
    scene: "wallpapers",
    file: "wallpaper.html",
    site: "Stillwall",
    title: ["Earthrise in 4K", "下载 4K「地出」照片"],
    brief: ["Look up Earthrise and put both photos in Compare. Download the 1972 shot as a 3840 × 2160 JPG.", "搜 Earthrise，把两张照片都加进对比。下载 1972 年拍的那张，选 3840 × 2160 的 JPG。"],
    hint: ["The year is in each photo’s description.", "照片说明里有拍摄年份。"],
    goals: [["Add both Earthrise photos to Compare.", "两张「地出」都加进对比。"], ["Download the 1972 photo as a 3840 × 2160 JPG.", "下载 1972 年那张 3840 × 2160 的 JPG。"]],
    route: [["Search Earthrise and add both results to Compare.","搜「地出」或 Earthrise，把两张结果都加入对比。"],["Check the mission in the photograph description. Open the Apollo 16 result.","在照片说明里核对任务，打开阿波罗 16 号的结果。"],["Select 3840 × 2160 and download the wallpaper.","选择 3840 × 2160，下载壁纸。"]],
    answer: ["earthrise-1968 (Apollo 8) and earthrise-1972 (Apollo 16). Export only earthrise-1972 at 3840 × 2160.","对比 earthrise-1968（阿波罗 8 号）和 earthrise-1972（阿波罗 16 号）。只导出后者的 3840 × 2160 JPG。"],
    cover: "assets/nasa-as08-14-2383-thumb.webp",
    advanced: false,
    badge: ["Earthrise·1972","Earthrise·1972"],
    steps: [["Compare both Earthrise photos", "对比两张「地出」"], ["Find the 1972 photo", "找到 1972 年的照片"], ["Download the 3840 × 2160 JPG", "下载 3840 × 2160 JPG"]],
    hint2: ["The 1972 photo is from Apollo 16. Open it and pick 3840 × 2160 in the size menu.", "1972 年那张是阿波罗 16 号拍的。打开照片，在尺寸菜单里选 3840 × 2160。"]
  },
  {
    id: "minute2-recipe-budget",
    scene: "recipes",
    file: "recipe.html",
    site: "Pantry & Plate",
    title: ["Soup for six", "六人份红扁豆汤"],
    brief: ["Find the red lentil and tomato soup at RM5 per serving. Make it six servings, tick red lentils on the shopping list and save the recipe.", "找到每份 RM5 的红扁豆番茄汤。把份量改成 6 人份，在采购清单勾上红扁豆，再收藏菜谱。"],
    hint: ["The serving size and shopping list are on the recipe page.", "份量和采购清单都在菜谱详情里。"],
    goals: [["Set the soup to six servings.", "把汤改成 6 人份。"], ["Tick red lentils on the shopping list.", "在采购清单勾上红扁豆。"], ["Save the recipe.", "收藏这份菜谱。"]],
    route: [["Start with the one-pot or vegan category. Narrow by budget and check the total time.","从「一锅料理」或纯素筛选入手，核对预算和总用时。"],["Open the red lentil and tomato soup, jump to its recipe and set six servings.","打开红扁豆番茄汤，跳到食谱并设为六人份。"],["Tick red lentils and save the recipe.","勾选红扁豆并收藏食谱。"]],
    answer: ["red-lentil-soup · RM5 per serving, 35 minutes, vegan, one pot. At six servings the checklist shows 420 g of red lentils.","red-lentil-soup · 每份 RM5，35 分钟，纯素，一口锅。六人份的食材清单显示 420 g 红扁豆。"],
    cover: "assets/real-food-red-lentil-soup-thumb.webp",
    advanced: false,
    badge: ["6 servings·RM5","红扁豆汤·6人·RM5/份"],
    steps: [["Red lentil and tomato soup, RM5 a serving", "找每份 RM5 的红扁豆番茄汤"], ["Set it to six servings", "改成 6 人份"], ["Tick red lentils", "勾上红扁豆"], ["Save the recipe", "收藏菜谱"]],
    hint2: ["Search “lentil” and use Jump to recipe on the soup page.", "搜「扁豆」。打开汤的详情后，点「直接看食谱」。"]
  },
  {
    id: "minute2-tool-webp",
    scene: "tools",
    file: "tools.html",
    site: "Pixelpress",
    title: ["Resize a photo for the club site", "给社团网页缩一张图"],
    brief: ["Use the La Trobe Reading Room sample. Make it a WebP, 800 px wide at 70% quality, then download it.", "用「拉筹伯阅览室」这张示例图。格式选 WebP，宽度选 800 px，画质调到 70%，然后下载。"],
    hint: ["Pick the photo from the example image library. The preview updates as you change the settings.", "从「示例图片库」选图。改完设置，预览会自动更新。"],
    goals: [["Load the La Trobe Reading Room sample.", "打开「拉筹伯阅览室」示例。"], ["Download the 800 px WebP at 70% quality.", "下载宽 800 px、画质 70% 的 WebP。"]],
    route: [["Look through the example photos and load the La Trobe Reading Room.","浏览示例照片，载入拉筹伯阅览室。"],["Select WebP, width 800 and quality 70%. The settings update the preview automatically.","设为 WebP、宽 800、画质 70%，预览会自动更新。"],["Check the result and download it.","核对结果后下载。"]],
    answer: ["sunroom (sunroom-study). The 1558 × 2048 source scales to 800 × 1052. Use custom settings.","sunroom（拉筹伯阅览室）。原图 1558 × 2048，按比例生成 800 × 1052。使用自定义设置。"],
    cover: "assets/real-wall-sunroom-study-thumb.webp",
    advanced: false,
    badge: ["WebP·800px·70%","WebP·800px·70%"],
    steps: [["Open the La Trobe Reading Room sample", "打开「拉筹伯阅览室」示例"], ["Set WebP, 800 px wide, 70% quality", "选 WebP、宽 800 px、画质 70%"], ["Download the image", "下载图片"]],
    hint2: ["Find the photo below the upload box and click Open example.", "在上传区下方找到那张照片，点「打开示例」。"]
  },
  {
    id: "minute2-movie-animation",
    scene: "movies",
    file: "movie.html",
    site: "Frame Movies",
    title: ["Two films for movie night", "电影夜的两部短片"],
    brief: ["Save Sintel and Elephants Dream to your watchlist. Leave only those two in the list.", "把《辛特尔》和《大象之梦》加进想看片单，最后只留这两部。"],
    hint: ["Search for each film by title. You can save it from the results.", "直接搜片名，在搜索结果里就能加入想看。"],
    goals: [["Add Sintel and Elephants Dream to Watchlist.", "把《辛特尔》和《大象之梦》都加入想看。"], ["Remove anything else from the list.", "片单里如果还有别的，就移掉。"]],
    route: [["Narrow to Fantasy and check the language and running time.","先筛选奇幻，核对语言和片长。"],["Search Sintel and Elephants Dream by name.","分别搜索 Sintel 和 Elephants Dream。"],["Add Sintel and Elephants Dream to the watchlist.","将《辛特尔》和《大象之梦》加入想看片单。"]],
    answer: ["sintel (15 min) and elephants-dream (11 min). The catalogue runtimes describe the works, not the embedded preview lengths.","sintel（15 分钟）和 elephants-dream（11 分钟）。用目录的正片片长核对，无需播放影片。"],
    cover: "assets/open-film-elephants-dream.jpg",
    coverNote: ["Elephants Dream · official film still · (CC) Blender Foundation | studio.blender.org","大象之梦 · 官方剧照 · (CC) Blender Foundation | studio.blender.org"],
    advanced: false,
    badge: ["Sintel·2 films","辛特尔·大象之梦·仅两部"],
    steps: [["Add Sintel to Watchlist", "把《辛特尔》加入想看"], ["Add Elephants Dream to Watchlist", "把《大象之梦》加入想看"], ["Leave only those two films", "片单只留这两部"]],
    hint2: ["Open Watchlist in the top bar to check what’s saved.", "点顶部的「想看片单」，看看里面是不是只有这两部。"]
  },
  {
    id: "minute2-outing-craft",
    scene: "events",
    file: "events.html",
    site: "Out There KL",
    title: ["A rainy day at Central Market", "下雨也能逛中央艺术坊"],
    brief: ["Save the RM20 Central Market craft outing to your weekend plan. On its departure checklist, tick the trip home and the weather.", "把中央艺术坊那条 RM20 的手作路线加进周末计划，再在出发清单里勾上「返程」和「天气」。"],
    hint: ["Look for the indoor craft guide. You can skip the outdoor stretch if it rains.", "找可以在室内逛手作摊的那条。下雨的话，室外那段可以跳过。"],
    goals: [["Save the Central Market craft outing.", "收藏中央艺术坊的手作路线。"], ["Tick the return journey and weather.", "勾上返程和天气。"]],
    route: [["Choose Malaysia → Kuala Lumpur, then filter for indoor outings and rail access. Check the budget and craft theme.","先选马来西亚 → 吉隆坡，再筛选室内和轨道交通，核对预算及手作主题。"],["Open the Central Market craft outing and check the optional outdoor strip in its rain plan.","打开中央艺术坊的手作路线，从雨天方案核对可跳过的室外路段。"],["Save it and tick the return journey and weather entries in the departure checklist.","收藏，并在出发清单勾选返程和天气。"]],
    answer: ["market-craft · Central Market & Kasturi Walk, RM20, 2.5 hours. The outdoor strip is optional. Record the two specified checklist entries.","market-craft · 中央艺术坊与 Kasturi Walk，RM20，2.5 小时。室外步行街可跳过，核对指定两项出发检查。"],
    cover: "assets/real-outing-market-craft-thumb.webp",
    advanced: false,
    badge: ["RM20·indoor","中央艺术坊·室内·RM20"],
    steps: [["Find the RM20 indoor craft outing", "找到 RM20 的室内手作路线"], ["Add it to your weekend plan", "加入周末计划"], ["Tick the return journey and weather", "勾上返程和天气"]],
    hint2: ["Search Central Market and open “Batik, baskets & a sheltered craft browse”.", "搜「中央艺术坊」，打开「蜡染、编篮与室内手作慢逛」。"]
  },
  {
    id: "minute2-book-verne",
    scene: "books",
    file: "book.html",
    site: "Folio",
    title: ["One book, two editions", "《八十天环游地球》的两个版本"],
    brief: ["Save the English and French editions of Around the World in Eighty Days. Download the opening of the French edition as a TXT file.", "收藏《八十天环游地球》的英文版和法文版，再把法文开篇下载成 TXT。"],
    hint: ["Check the language on each book page. The excerpt is under Read.", "打开书目确认语言。点「阅读」就能看到开篇。"],
    goals: [["Save the English and French editions.", "英文版和法文版都要收藏。"], ["Download the French opening as TXT.", "下载法文开篇 TXT。"]],
    route: [["Browse Adventure or search for Jules Verne once identified from an edition.","浏览「冒险」类别，认出作者后也可以搜 Jules Verne。"],["Check the language on both 1873 editions and save both.","核对两个 1873 年版本的语言，并分别收藏。"],["Download the opening excerpt from the French edition.","从法文版下载开篇片段。"]],
    answer: ["around-world (English) and around-world-fr (French). Correct excerpt: folio-around-world-fr-excerpt.txt.","around-world（英文）与 around-world-fr（法文）。正确片段是 folio-around-world-fr-excerpt.txt。"],
    cover: "assets/culture-book-around-world-thumb.webp",
    advanced: false,
    badge: ["English·French","八十天·英法·法文TXT"],
    steps: [["Save the English edition", "收藏英文版"], ["Save the French edition", "收藏法文版"], ["Download the French excerpt as TXT", "下载法文开篇 TXT"]],
    hint2: ["Search “Verne” or the book title to find both editions.", "可以搜书名，也可以直接搜 Verne。"]
  },
  {
    id: "minute2-museum-manet",
    scene: "museum",
    file: "museum.html",
    site: "Open Collection",
    title: ["A painting for a one-metre wall", "给一米宽的墙挑一幅画"],
    brief: ["Compare Manet’s Boating and The Monet Family in Their Garden at Argenteuil. Add the one under 100 cm wide to My Exhibition.", "对比马奈的《划船》和《莫奈一家在阿让特伊的花园里》，把宽度不到 100 cm 的那幅加进「我的展览」。"],
    hint: ["Search for Manet, then open Compare to see both sets of dimensions.", "搜「马奈」，把两幅都加进对比，就能并排看尺寸。"],
    goals: [["Put both Manet paintings in Compare.", "两幅马奈的画都加进对比。"], ["Add the one under 100 cm wide to My Exhibition.", "把宽不到 100 cm 的那幅加进「我的展览」。"]],
    route: [["Search Manet and check the date and subject.","搜索 Manet 或马奈，核对年份与题材。"],["Add Boating and The Monet Family in Their Garden at Argenteuil to Compare.","把《划船》和《莫奈一家在阿让特伊的花园里》加入对比。"],["Compare the second measurement in the dimensions and save the narrower work.","对比尺寸的第二个数值，收藏较窄的作品。"]],
    answer: ["436947 Boating: 130.2 cm wide. 436965 The Monet Family in Their Garden at Argenteuil: 99.7 cm wide. Save 436965.","436947《划船》宽 130.2 cm，436965《莫奈一家在阿让特伊的花园里》宽 99.7 cm。收藏 436965。"],
    cover: "assets/culture-art-436947-thumb.webp",
    advanced: false,
    badge: ["Manet·<100cm","Manet·对比·<100cm"],
    steps: [["Compare Boating and The Monet Family in Their Garden at Argenteuil", "对比《划船》和《莫奈一家在阿让特伊的花园里》"], ["Check which one is under 100 cm wide", "看哪幅宽不到 100 cm"], ["Add the narrower painting to My Exhibition", "把较窄的那幅加进「我的展览」"]],
    hint2: ["Dimensions are listed height first, then width.", "尺寸先写高度，后写宽度。"]
  },
  {
    id: "minute2-nature-woodpeckers",
    scene: "nature",
    file: "nature.html",
    site: "Field Guide",
    title: ["Which woodpecker is smaller?", "哪种啄木鸟更小？"],
    brief: ["Compare the Downy Woodpecker and Red-bellied Woodpecker. Add the shorter bird to your observation list.", "对比绒啄木鸟和红腹啄木鸟，把体长较短的那种加进观察清单。"],
    hint: ["The guide lists each bird’s length.", "图鉴里能查到两种鸟的体长。"],
    goals: [["Add both woodpeckers to Compare.", "把两种啄木鸟都加进对比。"], ["Add the shorter one to the observation list.", "把体长较短的加进观察清单。"]],
    route: [["Search woodpecker or 啄木鸟. Check each candidate’s field marks.","搜「啄木鸟」或 woodpecker，核对候选的外观特征。"],["Compare Downy and Red-bellied Woodpecker and check their lengths.","对比绒啄木鸟和红腹啄木鸟，核对体长。"],["Add the shorter species to the observation list.","把较短的一种加入观察清单。"]],
    answer: ["downy (14–17 cm, broad white stripe) and red-bellied (23–27 cm, barred back). Observe downy.","downy 绒啄木鸟（14–17 cm，宽白纵纹）与 red-bellied 红腹啄木鸟（23–27 cm，背部横纹）。记录绒啄木鸟。"],
    cover: "assets/journey-red-bellied-0-thumb.webp",
    briefCover: "assets/journey-red-bellied-0.webp",
    advanced: false,
    badge: ["woodpecker","woodpecker·较短者"],
    steps: [["Compare the Downy and Red-bellied Woodpeckers", "对比绒啄木鸟和红腹啄木鸟"], ["Check the birds’ lengths", "看两种鸟各有多长"], ["Add the shorter bird to your list", "把较短的那种加进观察清单"]],
    hint2: ["Search “woodpecker”, then look for Length in the comparison.", "搜「啄木鸟」，打开对比后看「体长」那一项。"]
  },
  {
    id: "minute2-travel-interchange",
    scene: "travel",
    file: "travel.html",
    site: "Trackside",
    title: ["Meet at Bukit Bintang", "去武吉免登会合"],
    brief: ["Plan a trip from KLCC (KJ) to Bukit Bintang, leaving at 17:20. Pick Less walking and save the trip.", "从 KLCC（KJ 线）去武吉免登，把出发时间设为 17:20。选「较少步行」，再保存行程。"],
    hint: ["In the planner, check the line code next to each station name.", "在路线规划里选站时，留意站名旁的线路代号。"],
    goals: [["Plan KLCC (KJ) to Bukit Bintang (KG) at 17:20.", "规划 KLCC（KJ）到武吉免登（KG），时间设为 17:20。"], ["Choose Less walking and save the trip.", "选「较少步行」，再保存。"]],
    route: [["Choose KLCC (KJ) and Bukit Bintang (KG). Keep the date and set 17:20.","选 KLCC（KJ）和武吉免登（KG），保留日期并设为 17:20。"],["Select Less walking and plan. Inspect the highlighted connection on the network map.","选择「较少步行」并规划，在网络图查看高亮换乘段。"],["Check the interchange and line codes, then save the journey.","核对换乘站与线路代号，再保存行程。"]],
    answer: ["klcc → bukit-kg, 17:20, Less walking. The practice route switches from KJ to KG at Pasar Seni and shows 9 minutes total walking.","klcc → bukit-kg，17:20，较少步行。练习路线在中央艺术坊站由 KJ 换乘 KG，全程步行 9 分钟。"],
    cover: "assets/journey-rail-train-0-thumb.webp",
    advanced: true,
    badge: ["17:20","17:20·较少步行·保存行程"],
    steps: [["KLCC (KJ) to Bukit Bintang", "KLCC（KJ）到武吉免登"], ["Set departure to 17:20", "出发时间设为 17:20"], ["Choose Less walking", "选「较少步行」"], ["Save the trip", "保存行程"]],
    hint2: ["There are two Bukit Bintang stops in the planner. Pick the one marked KG.", "规划器里有两个武吉免登站，选标着 KG 的那个。"]
  },
  {
    id: "minute2-market-lens",
    scene: "market",
    file: "market.html",
    site: "loop",
    title: ["A camera and lens for RM700", "RM700 内找相机和镜头"],
    brief: ["Compare the Good and Excellent EOS 550D listings. Save the one with a body and lens for RM700 or less.", "对比成色「良好」和「极佳」的两条 EOS 550D。收藏含机身和镜头、总价不超过 RM700 的那套。"],
    hint: ["Look under Included to see what comes with each camera.", "想知道有没有镜头，看详情里的「附带配件」。"],
    goals: [["Compare the Good and Excellent listings.", "把「良好」和「极佳」两个刊登加入对比。"], ["Save the kit with a lens for RM700 or less.", "收藏不超过 RM700、含镜头的那套。"]],
    route: [["Filter Canon + DSLR and set the maximum price to RM700.","筛选 Canon＋单反，最高价设 RM700。"],["Compare the Good and Excellent copies of the EOS 550D.","对比 EOS 550D 的良好和极佳两条刊登。"],["Read the included-items row and save the kit listing.","核对「附带物品」，收藏包含镜头的一条。"]],
    answer: ["canon-good: RM420, body only. canon-excellent: RM680, with EF-S 18–55mm, battery and charger. Save canon-excellent.","canon-good：RM420，仅机身。canon-excellent：RM680，附 EF-S 18–55mm 镜头、电池和充电器。收藏 canon-excellent。"],
    cover: "assets/market-canon-eos-550d.webp",
    advanced: true,
    badge: ["EOS 550D·RM700","EOS 550D·RM700"],
    steps: [["Compare the two EOS 550D listings", "对比两条 EOS 550D"], ["Check the price and whether a lens is included", "核对价格和有没有镜头"], ["Save the kit for RM700 or less", "收藏 RM700 以内的套装"]],
    hint2: ["Search EOS 550D. One listing is body only.", "搜 EOS 550D，其中一条只卖机身。"]
  },
  {
    id: "minute3-courier-redelivery",
    scene: "courier",
    file: "courier.html",
    site: "TrackMY",
    title: ["Get your parcel redelivered", "给包裹改个派送时间"],
    brief: ["Track parcel TM24081301. Book a free redelivery for tomorrow, 14:00–18:00, and keep the campus parcel desk address.", "查一下包裹 TM24081301，把派送改到明天下午 14:00–18:00。保留校园收件处的地址，改约费用为 RM0。"],
    hint: ["The redelivery form is on the parcel’s tracking page.", "查到包裹后，详情里有重新派送的入口。"],
    goals: [["Find TM24081301.", "查到 TM24081301。"], ["Save free redelivery for tomorrow afternoon at the same address.", "保存明天下午的免费重送，地址照旧。"]],
    route: [["Track TM24081301, then open Reschedule delivery.","查询 TM24081301，再打开改约派送。"],["Choose tomorrow, 14:00–18:00. Keep the address and save.","选择明天、14:00–18:00，保留地址并保存。"]],
    answer: ["TM24081301, tomorrow, afternoon, Campus parcel desk, Sepang. Confirm the saved TrackMY status. NorthPost RM3 / identity popups are a separate simulated advertiser and do not reschedule this parcel.","TM24081301，明天、下午、Campus parcel desk, Sepang。核对 TrackMY 保存状态。NorthPost 的 RM3／身份验证弹窗是独立模拟广告，不会改约本包裹。"],
    cover: "assets/courier-route.svg",
    advanced: false,
    badge: ["TM24081301·14–18","TM24081301·明天下午"],
    steps: [["Track TM24081301", "查 TM24081301"], ["Choose tomorrow, 14:00–18:00", "选明天 14:00–18:00"], ["Keep the campus parcel desk address and save", "保留校园收件处地址，再保存"]],
    hint2: ["On the tracking page, look for Arrange free redelivery.", "在物流详情里找「免费改约」。"]
  },
  {
    id: "minute3-search-official",
    scene: "search",
    file: "search.html",
    site: "Findline",
    title: ["The official Pixelpress guide", "找 Pixelpress 官方入门说明"],
    brief: ["Search for Pixelpress and get its free getting-started TXT from the official result. Skip the sponsored links.", "搜 Pixelpress，从官方结果下载免费的入门说明 TXT。别点标着「赞助」的结果。"],
    hint: ["Look at the web address under each result.", "点进去之前，先看结果下方的网址。"],
    goals: [["Open the official Pixelpress page.", "打开 Pixelpress 官方页面。"], ["Download its free TXT guide.", "下载免费的入门 TXT。"], ["Leave the sponsored results alone.", "别点赞助结果。"]],
    route: [["Search Pixelpress; inspect domains and sponsored labels.","搜索 Pixelpress，核对域名与赞助标记。"],["Open pixelpress.example and download the TXT guide.","打开 pixelpress.example，下载 TXT 入门说明。"]],
    answer: ["Organic Pixelpress result: pixelpress.example. The normal local page downloads a harmless TXT, not executable software. AppHarbor / SecureLane sponsored links lead to separate demonstration pages and never count as completing this task. A download event proves dispatch, not a file saved on disk.","自然结果 Pixelpress，参考域名 pixelpress.example。正常本地页面下载无害 TXT，不是可执行软件。AppHarbor／SecureLane 赞助链接进入独立演示页，不计完成。下载事件只证明发起下载，需工作人员核对磁盘文件。"],
    cover: "assets/search-software.svg",
    advanced: false,
    badge: ["Pixelpress·TXT","Pixelpress·TXT"],
    steps: [["Open the official Pixelpress page", "打开 Pixelpress 官方页面"], ["Download the free getting-started TXT", "下载免费的入门 TXT"], ["Skip sponsored results", "别点赞助结果"]],
    hint2: ["The official result uses pixelpress.example.", "官方结果的网址是 pixelpress.example。"]
  },
  {
    id: "minute4-penang-indoor",
    scene: "events",
    file: "events.html",
    site: "Out There",
    title: ["An indoor stop in Penang", "在槟城找个室内景点"],
    brief: ["Find an indoor attraction in Penang, Malaysia, that takes three hours or less and has a listed budget of RM30 or less. Save it to your plan.", "在马来西亚槟城找一个室内景点。用时最多 3 小时，参考预算不超过 RM30。找到后加进计划。"],
    hint: ["Set the destination to Malaysia, then Penang. Use the indoor, time and budget filters to narrow it down.", "目的地先选马来西亚，再选槟城。可以用室内、用时和预算筛选。"],
    goals: [["Find an indoor attraction in Penang within 3 hours and RM30.", "找到用时不超过 3 小时、预算不超过 RM30 的槟城室内景点。"], ["Save the guide to your plan.", "把指南加进计划。"]],
    route: [["Choose Malaysia → Penang, attraction, indoors, budget ≤RM30 and time ≤3h.","选择马来西亚 → 槟城、景点、室内、预算≤RM30、用时≤3小时。"],["Open the sole result and save it.","打开唯一结果，并加入收藏。"]],
    answer: ["penang-state-gallery: Malaysia / Penang / attraction / indoor / RM20 / 2h. The glass museum exceeds the budget, the garden is outdoors, and the long gallery guide takes 4h. These are editorial budgets, not ticket quotes. Assessment checks the actual saved selection and its planning fields.","penang-state-gallery：马来西亚／槟城／景点／室内／RM20／2小时。玻璃博物馆超预算，植物园在户外，半日美术馆需4小时。金额为编辑参考预算，并非门票报价。判定核对实际收藏和保存的规划字段。"],
    cover: "assets/guide-gallery.svg",
    advanced: false,
    badge: ["Penang·≤3h·≤RM30","槟城·室内·≤3h≤RM30"],
    steps: [["Find an indoor attraction in Penang", "找槟城的室内景点"], ["Allow up to 3 hours and RM30", "最多 3 小时，预算不超过 RM30"], ["Save it to your plan", "加入计划"]],
    hint2: ["Choose Attractions as well as Indoors, then check the time and budget on the guide.", "「景点」和「室内」都选上，再看指南里的用时和预算。"]
  }
];
