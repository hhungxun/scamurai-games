/* Presentation only: emphasize existing task words without changing plain-text records. */
(() => {
  const actions = [
    ['search', 'find', 'compare', 'choose', 'select', 'set', 'tick', 'save', 'download', 'add', 'keep', 'check', 'open', 'avoid', 'track', 'plan'],
    ['搜索', '搜', '找到', '查询', '对比', '比较', '选择', '设为', '勾选', '勾', '收藏', '下载', '加入', '保存', '保留', '核对', '检查', '打开', '避开', '不要从赞助结果进入']
  ];
  const keywords = {
    'minute2-wall-earthrise': [
      ['Earthrise', '1968', '1972', '3840 × 2160', 'JPG', 'Favorites', 'Download wallpaper'],
      ['Earthrise', '1968 年', '1972 年', '3840 × 2160', 'JPG', '爱心', '下载壁纸']
    ],
    'minute2-recipe-budget': [
      ['Red lentil & tomato soup', 'RM5 per serving', 'Servings to 6', 'Red lentils', 'Ingredients', 'Jump to recipe', 'Save recipe'],
      ['红扁豆番茄汤', 'RM5', '6 人份', '红扁豆', '直接看食谱', '份量', '食材', '收藏食谱']
    ],
    'minute2-tool-webp': [
      ['La Trobe reading room', 'Open example', 'WebP', '800 px', '70%', 'Download image'],
      ['拉筹伯阅览室', '打开示例', 'WebP', '800 px', '70%', '下载图片']
    ],
    'minute2-movie-animation': [
      ['Sintel', 'Elephants Dream', 'watchlist', 'only those two'],
      ['辛特尔', '大象之梦', '想看片单', '只留这两部']
    ],
    'minute2-outing-craft': [
      ['Central Market', 'RM20', 'departure checklist', 'Save this outing', 'return journey', 'indoor alternative'],
      ['中央艺术坊', 'RM20', '出发检查清单', '收藏这条路线', '安排返程', '室内备选去处']
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
      ['Downy', 'Red-bellied Woodpecker', 'Compare woodpeckers', 'Length', 'shorter', 'Add to list'],
      ['绒啄木鸟', '红腹啄木鸟', '比较两种啄木鸟', '身长', '较短', '加入清单']
    ],
    'minute2-travel-interchange': [
      ['KLCC', 'KJ', 'Bukit Bintang', '17:20', 'Less walking', 'KG'],
      ['KLCC', 'KJ', '武吉免登', '17:20', '较少步行', 'KG']
    ],
    'minute2-market-lens': [
      ['RM700', 'EOS 550D', 'Good', 'Excellent', 'Compare +', 'Compare gear', 'body and lens', 'Included', 'Save'],
      ['RM700', 'EOS 550D', '良好', '极佳', '对比 +', '相机对比', '机身和镜头', '附带配件', '收藏']
    ],
    'minute3-courier-redelivery': [
      ['TM24081301', 'tomorrow afternoon', 'Tomorrow', '14:00–18:00', 'campus parcel desk address', 'free redelivery'],
      ['TM24081301', '明天下午', '明天', '14:00–18:00', '校园收件处', '免费改约']
    ],
    'minute3-search-official': [
      ['Photo Tools', 'official', 'free', 'getting-started TXT', 'TXT', 'sponsored results', 'sponsored links', 'phototools.example'],
      ['Photo Tools', '官方站点', '官方结果', '免费', '入门说明 TXT', 'TXT', '赞助结果', 'phototools.example']
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
    id: 'minute-wall-aurora', scene: 'wallpapers', file: 'wallpaper.html',
    title: ['Green light from orbit', '绿色轨道壁纸'],
    brief: ['Find a NASA photograph of a green aurora taken from orbit in 2012. Save it and download a 2560 × 1440 wallpaper.', '找一张2012年从轨道拍摄的NASA绿色极光照片，收藏，并下载2560 × 1440壁纸。'],
    goals: [['Save the correct photograph.', '收藏正确的照片。'], ['Export its wallpaper at 2560 × 1440.', '为它导出2560 × 1440壁纸。']],
    route: [['Search “aurora”, or filter NASA + green.', '搜索 aurora 或“极光”，也可筛选NASA＋绿色。'], ['Open “Orbital aurora” and check the date: 2012-03-03.', '打开“轨道极光”，核对日期2012-03-03。'], ['Save it, select 2560 × 1440 and download.', '加入收藏，选2560 × 1440，再下载壁纸。']],
    answer: ['Orbital aurora · orbital-aurora · NASA iss030e119777. Check the export record and, where possible, the downloaded file; a button click alone does not prove a file was saved.', '轨道极光 · orbital-aurora · NASA iss030e119777。核对导出记录；可行时检查下载文件。只点下载按钮不代表文件已保存。'],
    cover: 'assets/nasa-iss030e119777-thumb.webp', advanced: false
  },
  {
    id: 'minute-recipe-lunch', scene: 'recipes', file: 'recipe.html',
    title: ['Lunch for four', '四人份午餐'],
    brief: ['Find a no-cook vegan chickpea lunch ready within 15 minutes. Set it to four servings and save the recipe.', '找一道不用开火、15分钟内能做好的鹰嘴豆纯素午餐，将份量改为4人，并收藏。'],
    goals: [['Save the correct recipe.', '收藏正确的食谱。'], ['Set the servings to 4.', '把份量设为4人。']],
    route: [['Search “chickpea”.', '搜索 chickpea 或“鹰嘴豆”。'], ['Open “Lemon chickpea & cucumber salad”; check vegan, no-cook and 10 minutes.', '打开“柠檬鹰嘴豆黄瓜沙拉”，核对纯素、无需烹饪和10分钟。'], ['Set 4 servings and save.', '选择4人份，再收藏。']],
    answer: ['chickpea-salad. The two-serving recipe uses 240 g chickpeas; four servings show 480 g. Asking this is an optional spoken check.', 'chickpea-salad。原配方2人份用240 g鹰嘴豆，4人份显示480 g；可口头询问，作为额外核对。'],
    cover: 'assets/real-food-chickpea-salad-thumb.webp', advanced: false
  },
  {
    id: 'minute-tool-webp', scene: 'tools', file: 'tools.html',
    title: ['An image made for the web', '导出网页图片'],
    brief: ['Use the “Chinatown after dark” sample to export a WebP image, 1280 pixels wide, at 75% quality.', '使用“唐人街入夜”示例，导出宽1280像素、质量75%的WebP图片。'],
    goals: [['Use “Chinatown after dark”.', '使用“唐人街入夜”示例。'], ['Choose WebP, width 1280 and quality 75%.', '选择WebP、宽1280、质量75%。'], ['Generate the result and download it.', '生成结果，并下载图片。']],
    route: [['Load “Chinatown after dark”.', '加载“唐人街入夜 / Chinatown after dark”。'], ['Choose WebP, width 1280, quality 75%.', '格式选WebP、宽1280、质量75%。'], ['Generate, inspect the result and download.', '生成并检查结果，再下载。']],
    answer: ['Sample city · blue-hour-street. The 2400 × 1600 source becomes 1280 × 853 with its aspect ratio kept. Output bytes vary by browser.', '示例city，对应blue-hour-street。源图2400 × 1600，保持比例后为1280 × 853。不同浏览器的文件字节数可能不同。'],
    cover: 'assets/real-wall-blue-hour-street-thumb.webp', advanced: false
  },
  {
    id: 'minute-movie-steel', scene: 'movies', file: 'movie.html',
    title: ['A short science-fiction find', '找到科幻短片'],
    brief: ['Find an English-language science-fiction short released in 2012, directed by Ian Hubert and under 15 minutes. Add it to your watchlist.', '找一部2012年、Ian Hubert执导、片长不到15分钟的英语科幻短片，并加入想看片单。'],
    goals: [['Add the correct film to your watchlist.', '把正确电影加入想看片单。']],
    route: [['Filter by year, language and running time, or search “Ian Hubert”.', '使用年份、语言、片长筛选，或搜索 Ian Hubert。'], ['Open “Tears of Steel”; check 2012, Ian Hubert and about 12 minutes.', '打开“Tears of Steel”，核对2012、Ian Hubert和约12分钟。'], ['Add it to your watchlist.', '加入想看片单。']],
    answer: ['steel · Tears of Steel. Watching the whole film or local preview is not required; their running times differ.', 'steel · Tears of Steel。无需看完整影片或当地预览片段；两者时长不同。'],
    cover: 'assets/video-steel.jpg', advanced: false
  },
  {
    id: 'minute-outing-museum', scene: 'events', file: 'events.html',
    title: ['A museum for a rainy day', '雨天去博物馆'],
    brief: ['Find an indoor history-museum outing in Kuala Lumpur, reachable by rail, taking at most 3 hours with a planning budget no higher than RM30. Add it to your weekend plan.', '寻找吉隆坡一条室内历史博物馆路线，能够搭轨道交通到达、最多3小时、参考预算不超过RM30，并加入周末计划。'],
    goals: [['Add the correct outing to your weekend plan.', '把正确路线加入周末计划。']],
    route: [['Search “museum”.', '搜索 museum 或“博物馆”。'], ['Check indoor, rail access, 3 hours and RM30.', '核对室内、轨道交通、3小时和RM30。'], ['Open “A slow walk through the museum timeline”, check the National Museum and add it to your plan.', '打开“沿博物馆时间线慢慢看”，核对国家博物馆，再加入周末计划。']],
    answer: ['museum-four-galleries. RM30 is a planning allowance in the practice website, not a live ticket quote.', 'museum-four-galleries。RM30是练习网页的规划预留，并非实时门票报价。'],
    cover: 'assets/real-outing-museum-four-galleries-thumb.webp', advanced: false
  },
  {
    id: 'minute-book-alice', scene: 'books', file: 'book.html',
    title: ['Follow the White Rabbit', '追随白兔'],
    brief: ['Find an English fantasy first published in 1865, in which a girl follows a white rabbit. Save the book and download its opening excerpt as a TXT file.', '找一本1865年首次出版、女孩追随白兔的英语奇幻作品，加入阅读清单，并下载开篇片段TXT。'],
    goals: [['Add the correct book to your reading list.', '把正确书籍加入阅读清单。'], ['Download its opening excerpt as TXT.', '下载它的开篇片段TXT。']],
    route: [['Filter Fantasy + English, or search “rabbit”.', '筛选奇幻＋英语，或搜索 rabbit。'], ['Open “Alice’s Adventures in Wonderland”; check Lewis Carroll and 1865, then save.', '打开“Alice’s Adventures in Wonderland”，核对Lewis Carroll和1865，再加入清单。'], ['Open the reading excerpt and choose “Download this excerpt”.', '打开阅读片段，点击“下载此片段”。']],
    answer: ['alice · Alice’s Adventures in Wonderland. Reading view: book.html?id=alice&view=read. File: folio-alice-excerpt.txt. Marking it read is not required.', 'alice ·《爱丽丝梦游仙境》。片段路由book.html?id=alice&view=read；文件folio-alice-excerpt.txt。无需标记已读。'],
    cover: 'assets/culture-book-alice-thumb.webp', advanced: false
  },
  {
    id: 'minute-museum-wave', scene: 'museum', file: 'museum.html',
    title: ['A great wave, a distant mountain', '寻找巨浪与富士山'],
    brief: ['Find a Japanese woodblock print from about 1830–1832, with a great wave surrounding a small mountain in the distance. Add it to “My exhibition”.', '找一幅约1830—1832年的日本木版画，画中巨浪围绕远处的小山，将它加入“我的展览”。'],
    goals: [['Add the correct artwork to “My exhibition”.', '把正确作品加入“我的展览”。']],
    route: [['Filter Woodblock print + Japan, or use search.', '筛选木版画＋Japan，也可使用搜索。'], ['Open “Under the Wave off Kanagawa / The Great Wave”; check Katsushika Hokusai and about 1830–32.', '打开“Under the Wave off Kanagawa / The Great Wave”，核对Katsushika Hokusai和约1830–32。'], ['Add it to “My exhibition”.', '加入“我的展览”。']],
    answer: ['56353 · Katsushika Hokusai, Under the Wave off Kanagawa (The Great Wave). Other valid search and browsing routes are equally acceptable.', '56353 · 葛饰北斋《神奈川冲浪里》。其他有效的搜索或目录路线同样可以。'],
    cover: 'assets/culture-art-56353-thumb.webp', advanced: false
  },
  {
    id: 'minute-nature-cardinal', scene: 'nature', file: 'nature.html',
    title: ['Name the red garden bird', '识别花园红鸟'],
    brief: ['In the North American bird guide, identify a red garden bird with a pointed crest and a thick orange-red bill. Add it to your observation list.', '在北美鸟类资料中，找出花园里有尖羽冠、橙红色粗喙的红色鸟，并加入观察清单。'],
    goals: [['Add the correct bird to your observation list.', '把正确鸟类加入观察清单。'], ['Show the crest and bill field marks to the staff.', '向工作人员核对尖羽冠和喙的特征。']],
    route: [['Filter Red + Garden.', '筛选红色＋花园。'], ['Open “Northern Cardinal”; check the pointed crest and thick bill.', '打开“Northern Cardinal / 北美红雀”，核对尖羽冠和粗喙。'], ['Add it using the existing default observation fields.', '使用页面已有默认观察字段加入清单。']],
    answer: ['cardinal · Northern Cardinal. Red colour alone is not enough: House Finch is not the target. Field-mark recognition is a staff check.', 'cardinal · 北美红雀。不能只凭红色选House Finch；外观特征由工作人员核对。'],
    cover: 'assets/journey-cardinal-0-thumb.webp', advanced: false
  },
  {
    id: 'minute-travel-klcc', scene: 'travel', file: 'travel.html',
    title: ['From Sentral to KLCC', '从中央车站去KLCC'],
    brief: ['Plan and save a journey leaving at 10:00 from KL Sentral on the Kelana Jaya line to KLCC.', '规划10:00从KL Sentral的Kelana Jaya线站点到KLCC的行程，并保存路线。'],
    goals: [['Set KL Sentral (KJ) → KLCC (KJ), at 10:00.', '设置KL Sentral（KJ）→ KLCC（KJ），时间10:00。'], ['Save the journey with 0 interchanges.', '保存0次换乘的行程。']],
    route: [['Set departure to KL Sentral (KJ), arrival to KLCC (KJ).', '出发选KL Sentral（KJ），到达选KLCC（KJ）。'], ['Keep the default date, set 10:00 and plan the journey.', '保留默认日期，时间设10:00，再规划。'], ['Inspect the recommendation and save it.', '查看推荐路线，再保存行程。']],
    answer: ['From sentral-kj to klcc, 10:00, 0 interchanges. The practice timetable gives boarding 10:06, arrival 10:19 and exit 10:21. No ICS export is required.', 'sentral-kj → klcc，10:00，0次换乘。练习时刻表为10:06上车、10:19到站、10:21出站。无需导出ICS。'],
    cover: 'assets/journey-rail-train-0-thumb.webp', advanced: true
  },
  {
    id: 'minute-market-starter', scene: 'market', file: 'market.html',
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
{"id": "minute5-taipei-flight", "scene": "tripuccino", "file": "tripuccino.html", "site": "Tripuccino", "title": ["Semester break in Taiwan", "Sembreak 去台湾玩"], "brief": ["You're an XMUM student heading to Taiwan for sem break on 23 January 2027. Book the cheapest one-way flight from KUL to Taipei Taoyuan (TPE) for one adult, including taxes. Skip paid extras and complete the simulated payment.", "你是 XMUM 学生，打算在 2027 年 1 月 23 日趁 sem break 去台湾玩。预算有限，请订一张 KUL 飞台北桃园（TPE）、1 位成人的最低含税价单程机票，不加购付费服务，并完成模拟付款。"], "hint": ["Check the airport codes and date, then compare the all-in fares.", "核对机场代码与日期，再比较含税总价。"], "goals": [["Search KUL → TPE for 23 January 2027, one adult.", "搜索 2027 年 1 月 23 日 KUL → TPE，1 位成人。"], ["Choose the lowest all-in fare.", "选择最低含税票价。"], ["Complete the simulated payment.", "完成模拟付款。"]], "route": [["Search KUL → TPE, 23 January 2027, one adult, then choose Cheapest.", "搜索 KUL → TPE，2027 年 1 月 23 日，1 人，再按最低价排序。"], ["Select Batik Air OD698 for MYR 467. Confirm the passenger details and keep the free baggage and seat options.", "选择 Batik Air OD698，MYR 467。确认乘客资料，保留免费行李与座位选项。"], ["Continue to payment, accept the fare rules and complete the game payment.", "进入付款页，同意票价规则，完成游戏付款。"]], "answer": ["OD698, KUL → TPE, 2027-01-23, one adult, MYR 467 total including taxes, no paid extras. A paid tc-orders record must belong to this round and be created before its deadline. A search or payment-page visit alone does not complete the purchase.", "OD698，KUL → TPE，2027-01-23，1 人，含税总价 MYR 467，无付费附加服务。tc-orders 已付款订单须属于本轮并在截止时间前生成。仅搜索或进入付款页无法完成购买。"], "cover": "tripuccino-assets/taipei.jpg", "advanced": false, "badge": ["KUL → TPE · 23 Jan", "KUL → TPE · 1月23日"], "steps": [["Set KUL → TPE, 23 Jan 2027, one adult", "选择 KUL → TPE，2027年1月23日，1人"], ["Select the cheapest all-in fare with no paid extras", "选择最低含税票价，保留零元附加服务"], ["Complete simulated payment", "完成模拟付款"]], "hint2": ["Cheapest sorts the total fare from low to high. Basic includes taxes and 7 kg cabin baggage.", "最低价按含税价由低到高排列。基础票价包含税费和 7 kg 手提行李。"], "briefFormat": "story"},
  {
    "id": "minute4-shoppee-buy",
    "scene": "shoppee",
    "file": "shoppee.html",
    "site": "ShopPee",
    "title": [
      "Buy an iPhone 18 Pro Max",
      "买到 iPhone 18 Pro Max"
    ],
    "brief": [
      "Buy an iPhone 18 Pro Max on ShopPee, from choosing a listing through to the payment-success receipt. Any storage capacity and colour are fine. Delivery details are prefilled for this simulation.",
      "在 ShopPee 买到 iPhone 18 Pro Max，从挑选商品一直完成到模拟付款成功。容量和颜色任选，模拟收货资料已预填。"
    ],
    "hint": [
      "Browse Mobile Phones or search the exact model name. Open Seller details if you are unsure about a listing.",
      "可以进入手机区，也可以搜索完整型号。拿不准某个商品时，打开「查看卖家」核对资料。"
    ],
    "goals": [
      [
        "Find an iPhone 18 Pro Max on ShopPee. Check the model, price and seller before choosing a listing.",
        "在 ShopPee 找到 iPhone 18 Pro Max，选购前核对手机型号、价格和卖家资料。"
      ],
      [
        "Choose any storage capacity and colour. Use Buy Now, or add the phone to your cart and proceed to checkout.",
        "容量和颜色任选。可以点击「立即购买」，也可以先加入购物车，再进入结算。"
      ],
      [
        "Confirm the prefilled delivery details, choose a payment method and complete the simulated payment in the marketplace.",
        "确认已预填的模拟收货资料，选择付款方式，并在商城内完成模拟付款。"
      ],
      [
        "Once the payment-success receipt appears, close it and click Submit in the game bar to finish your round.",
        "看到模拟付款成功的收据后，将它关闭，再点击游戏顶部的「交卷」完成本轮。"
      ]
    ],
    "route": [
      [
        "Open Mobile Phones, then the verified store’s iPhone 18 Pro Max.",
        "打开手机区，找到认证店的 iPhone 18 Pro Max。"
      ],
      [
        "Choose a variant, buy now or use the cart, then confirm the demo payment.",
        "选择规格，立即购买或加入购物车，最后确认模拟付款。"
      ]
    ],
    "answer": [
      "pmax from apple-my-verified. Confirm checkout and a paid local order for this round. Outlet deposits and the Storee seller cannot complete this purchase.",
      "认证店 apple-my-verified 的 pmax。本轮须有结算记录及正确的模拟已付款订单。清仓定金和 Storee 店的付款不算完成购买。"
    ],
    "cover": "shoppee-assets/img/pmax.png",
    "advanced": false,
    "badge": [
      "iPhone 18 Pro Max",
      "iPhone 18 Pro Max"
    ],
    "steps": [
      [
        "Find iPhone 18 Pro Max",
        "找到 iPhone 18 Pro Max"
      ],
      [
        "Proceed to checkout",
        "进入结算"
      ],
      [
        "Complete simulated payment",
        "完成模拟付款"
      ]
    ],
    "hint2": [
      "A shop can draw a MALL label itself. Open its platform verification details.",
      "店铺可以自行画上 MALL 字样，点开平台认证详情核对。"
    ]
  },
  {
    id: "minute2-wall-earthrise",
    scene: "wallpapers",
    file: "wallpaper.html",
    title: ["Save two Earthrise photos and download the 1972 one","收藏两张「地出」照片，下载 1972 年那张"],
    brief: ["Find both Earthrise photos in Photo Library and save them to Favorites. Download the 1972 photo as a 3840 × 2160 JPG.", "在 Photo Library 照片网站找到两张「地出」照片并收藏。把 1972 年那张下载为 3840 × 2160 的 JPG。"],
    goals: [["In Photo Library, search for Earthrise. Click the heart (♡) on the 1968 and 1972 photos to save both to Favorites.","在照片库搜索 Earthrise。点击 1968 年和 1972 年两张照片各自的爱心，把它们加入收藏。"],["Open the 1972 photo, select 3840 × 2160, and click Download wallpaper. The JPG appears in the game’s downloads at the top right.","打开 1972 年那张，选择 3840 × 2160，再点「下载壁纸」。JPG 会出现在游戏右上角的下载列表里。"]],
    route: [["Search for Earthrise and click the heart on both photos.","搜索 Earthrise，点击两张照片上的爱心。"],["Open Earthrise · 1972 and download the 3840 × 2160 wallpaper.","打开「地出 · 1972」，下载 3840 × 2160 的壁纸。"]],
    answer: ["Both Earthrise photos should be in Favorites. The downloaded JPG should be the 1972 photo at 3840 × 2160.","收藏应包含 1968 年和 1972 年两张「地出」照片。下载的 JPG 应为 1972 年那张，尺寸为 3840 × 2160。"],
    cover: "assets/nasa-as08-14-2383-thumb.webp",
    briefImages: [
      {src: "assets/nasa-as08-14-2383-thumb.webp", caption: ["Earthrise · 1968", "地出 · 1968"]},
      {src: "assets/nasa-as16-120-19187-thumb.webp", caption: ["Earthrise · 1972", "地出 · 1972"]}
    ],
    advanced: false,
    badge: ["Earthrise·1972","Earthrise·1972"],
    steps: [["Add both Earthrise photos", "加入两张「地出」照片"], ["Download the 1972 photo as a 3840 × 2160 JPG", "下载 1972 年照片的 3840 × 2160 JPG"]]
  },
  {
    id: "minute2-outing-craft",
    scene: "events",
    file: "events.html",
    title: ["Save a Central Market outing and finish its checklist","收藏中央艺术坊手作路线并勾选出发清单"],
    brief: ["In Trip Guide, save the RM20 Central Market craft outing. On its departure checklist, tick the items for getting home and planning for rain.","在出游指南收藏中央艺术坊那条 RM20 的手作路线，再勾选出发清单里关于返程和雨天备选的两项。"],
    hint: ["Look for the indoor craft guide. You can skip the outdoor stretch if it rains.", "找可以在室内逛手作摊的那条。下雨的话，室外那段可以跳过。"],
    goals: [["In Trip Guide, open Search & more options and search for Central Market with Find guides. Open the RM20 craft guide, then click Save this outing.","在出游指南展开「搜索与更多条件」，输入「中央艺术坊」，点「找指南」。打开 RM20 的手作路线，点「收藏这条路线」。"],["Open Departure checklist. Tick Save a meeting point and plan your return journey, and Check the forecast and choose an indoor alternative.","点「出发检查清单」，勾选「保存集合点并安排返程」和「查看天气并选好室内备选去处」。"]],
    route: [["Open Search & more options, search for Central Market, and open the RM20 craft guide.","展开「搜索与更多条件」，搜索「中央艺术坊」，打开 RM20 的手作路线。"],["Save the outing and tick the return journey and weather entries in Departure checklist.","收藏路线，并在「出发检查清单」勾好返程和天气两项。"]],
    answer: ["market-craft · Central Market & Kasturi Walk, RM20, 2.5 hours. The outdoor strip is optional. Record the two specified checklist entries.","market-craft · 中央艺术坊与 Kasturi Walk，RM20，2.5 小时。室外步行街可跳过，核对指定两项出发检查。"],
    cover: "assets/real-outing-market-craft-thumb.webp",
    advanced: false,
    badge: ["RM20·indoor","中央艺术坊·室内·RM20"],
    steps: [["Open the RM20 Central Market craft guide","打开中央艺术坊 RM20 手作路线"],["Save the outing to your plan","把路线加入计划"],["Tick the return journey and weather items","勾选返程和天气两项"]],
    hint2: ["Search Central Market and open “Batik, baskets & a sheltered craft browse”.", "搜「中央艺术坊」，打开「蜡染、编篮与室内手作慢逛」。"]
  },
  {
    id: "minute2-nature-woodpeckers",
    scene: "nature",
    file: "nature.html",
    title: ["Find and record the shorter woodpecker","找出身长较短的啄木鸟并记录"],
    brief: ["In Bird Guide, put the Downy and Red-bellied Woodpeckers side by side. Check their lengths and add the shorter bird to your list.","在鸟类图鉴并排查看绒啄木鸟和红腹啄木鸟的身长，把较短的那种加入观察清单。"],
    hint: ["Length is shown in centimetres next to each bird’s name and photo.","每种鸟的资料里都列了身长，单位是厘米。"],
    goals: [["In Bird Guide, open Compare and click Compare woodpeckers to see the Downy and Red-bellied Woodpeckers side by side.","在鸟类图鉴打开「对比」，点「比较两种啄木鸟」，就能并排看绒啄木鸟和红腹啄木鸟的资料。"],["Look at Length under each bird. Click Add to list on the shorter one.","看每种鸟下面的「身长」，在较短的那种下面点「加入清单」。"]],
    route: [["Open Compare and click Compare woodpeckers to display both birds.","打开「对比」，点「比较两种啄木鸟」，并排查看两种鸟。"],["Check Length and click Add to list for the shorter bird.","查看「身长」，把较短的一种加入清单。"]],
    answer: ["downy (14–17 cm, broad white stripe) and red-bellied (23–27 cm, barred back). Observe downy.","downy 绒啄木鸟（14–17 cm，宽白纵纹）与 red-bellied 红腹啄木鸟（23–27 cm，背部横纹）。记录绒啄木鸟。"],
    cover: "assets/journey-red-bellied-0-thumb.webp",
    briefCover: "assets/journey-red-bellied-0.webp",
    advanced: false,
    badge: ["woodpecker","woodpecker·较短者"],
    steps: [["Put both woodpeckers in the side-by-side view","把两种啄木鸟加入对比"],["Add the shorter woodpecker to your list","把身长较短的啄木鸟加入清单"]],
    hint2: ["On the Compare tab, the Compare woodpeckers button brings up both birds at once.","在「对比」页点「比较两种啄木鸟」，就能一次看两种鸟。"]
  },
  {
    id: "minute2-travel-interchange",
    scene: "travel",
    file: "travel.html",
    title: ["Save a 17:20 train trip to Bukit Bintang","保存 17:20 去武吉免登的列车路线"],
    brief: ["In Rail Planner, plan a 17:20 trip from KLCC (KJ) to Bukit Bintang (KG). Choose Less walking and save the trip.","在列车路线网站规划 17:20 从 KLCC（KJ 线）到武吉免登（KG 线）的行程。选「较少步行」，再保存。"],
    hint: ["In the planner, check the line code next to each station name.", "在路线规划里选站时，留意站名旁的线路代号。"],
    goals: [["In Rail Planner, set From to KLCC (KJ), To to Bukit Bintang (KG), and Depart after to 17:20.","在列车路线网站，「出发」选 KLCC（KJ），「到达」选武吉免登（KG），「不早于」设为 17:20。"],["Set Preference to Less walking and click Find a route. On the Less walking result, click View every leg.","「规划偏好」选「较少步行」，点「查找路线」。在标有「较少步行」的结果里点「查看每段详情」。"],["Click Save trip and check that it says Saved.","点「保存行程」，确认按钮显示「已保存」。"]],
    route: [["Choose KLCC (KJ) and Bukit Bintang (KG). Keep the date and set 17:20.","选 KLCC（KJ）和武吉免登（KG），保留日期并设为 17:20。"],["Select Less walking, click Find a route, and open the Less walking result.","选「较少步行」，点「查找路线」，再打开对应结果。"],["Click Save trip.","点「保存行程」。"]],
    answer: ["klcc → bukit-kg, 17:20, Less walking. The practice route switches from KJ to KG at Pasar Seni and shows 9 minutes total walking.","klcc → bukit-kg，17:20，较少步行。练习路线在中央艺术坊站由 KJ 换乘 KG，全程步行 9 分钟。"],
    cover: "assets/journey-rail-train-0-thumb.webp",
    advanced: true,
    badge: ["17:20","17:20·较少步行·保存行程"],
    steps: [["Plan from KLCC (KJ) to Bukit Bintang (KG)","选择 KLCC（KJ）到武吉免登（KG）"],["Set departure to 17:20","出发时间设为 17:20"],["Choose Less walking","选「较少步行」"],["Save the trip","保存行程"]],
    hint2: ["There are two Bukit Bintang stops in the planner. Pick the one marked KG.", "规划器里有两个武吉免登站，选标着 KG 的那个。"]
  },
  {
    id: "minute3-courier-redelivery",
    scene: "courier",
    file: "courier.html",
    title: ["Move your parcel delivery to tomorrow afternoon","把包裹改约到明天下午"],
    brief: ["In Parcel Tracker, reschedule TM24081301 for tomorrow, 14:00–18:00. Keep the campus parcel desk address and save the free redelivery.","在包裹查询网站把 TM24081301 改到明天 14:00–18:00 派送，保留校园收件处地址并免费保存改约。"],
    hint: ["The redelivery form is on the parcel’s tracking page.", "查到包裹后，详情里有重新派送的入口。"],
    goals: [["In Parcel Tracker, enter TM24081301 and click Track parcel. On the tracking page, click Arrange free redelivery.","在包裹查询网站输入 TM24081301，点「查询包裹」。在物流详情页点「免费改约」。"],["Set Delivery date to tomorrow and Delivery window to 14:00–18:00.","把「派送日期」设为明天，「派送时段」选 14:00–18:00。"],["Keep Campus parcel desk, Sepang in the address field. Check that the fee is RM0, then click Save redelivery.","地址保留 Campus parcel desk, Sepang。确认费用为 RM0 后，点「保存改约」。"]],
    route: [["Track TM24081301 and open Arrange free redelivery.","查询 TM24081301，打开「免费改约」。"],["Choose tomorrow, 14:00–18:00. Keep the address and click Save redelivery.","选择明天、14:00–18:00，保留地址并点「保存改约」。"]],
    answer: ["TM24081301, tomorrow, afternoon, Campus parcel desk, Sepang. Confirm the saved Parcel Tracker status. NorthPost RM3 / identity popups are a separate simulated advertiser and do not reschedule this parcel.","TM24081301，明天、下午、Campus parcel desk, Sepang。核对 Parcel Tracker 保存状态。NorthPost 的 RM3／身份验证弹窗是独立模拟广告，不会改约本包裹。"],
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
    title: ["Download the official Photo Tools guide","下载图片工具的官方入门说明"],
    brief: ["Use Web Search to find the official Photo Tools page. Skip sponsored results and download the free TXT guide from the official page.","用网页搜索找到图片工具的官方页面。跳过赞助结果，从官方页面下载免费的 TXT 入门说明。"],
    hint: ["The site address appears above the result title.","每条结果标题上方会显示网址。"],
    goals: [["In Web Search, enter Photo Tools. Skip results marked Sponsored and open the Photo Tools result with phototools.example as its web address.","在网页搜索输入 Photo Tools。跳过标有「赞助」的结果，打开网址是 phototools.example 的图片工具结果。"],["On the official page, click Download free TXT guide. The TXT appears in the game’s downloads at the top right.","在官方页面点「免费下载 TXT 入门说明」。TXT 会出现在游戏右上角的下载列表里。"]],
    route: [["Search Photo Tools; inspect domains and sponsored labels.","搜索 Photo Tools，核对域名与赞助标记。"],["Open phototools.example and download the TXT guide.","打开 phototools.example，下载 TXT 入门说明。"]],
    answer: ["Organic Photo Tools result: phototools.example. The game’s download list shows phototools-getting-started.txt after the official download action. AppHarbor and SecureLane are separate sponsored results.","自然结果 Photo Tools 的参考域名是 phototools.example。在官方页面点击下载后，游戏内的列表会显示 phototools-getting-started.txt。AppHarbor 和 SecureLane 是另外两条赞助结果。"],
    cover: "assets/search-software.svg",
    advanced: false,
    badge: ["Photo Tools·TXT","Photo Tools·TXT"],
    steps: [["Open the official Photo Tools page", "打开 Photo Tools 官方页面"], ["Download the free getting-started TXT", "下载免费的入门 TXT"], ["Skip sponsored results", "别点赞助结果"]],
    hint2: ["The official result uses phototools.example.", "官方结果的网址是 phototools.example。"]
  },
  {
    id: "minute4-penang-indoor",
    scene: "events",
    file: "events.html",
    title: ["Save an indoor Penang attraction within RM30","保存预算不超过 RM30 的槟城室内景点"],
    brief: ["In Trip Guide, find an indoor attraction in Penang that fits RM30 or less and takes no more than three hours. Add it to your plan.","在出游指南找一个槟城室内景点，参考预算不超过 RM30、用时不超过 3 小时，再加入计划。"],
    hint: ["Set the destination to Malaysia, then Penang. Use the indoor, time and budget filters to narrow it down.", "目的地先选马来西亚，再选槟城。可以用室内、用时和预算筛选。"],
    goals: [["In Trip Guide, set Destination to Penang, Malaysia. Set Setting to Indoors, Time to ≤ 3 h, and Budget to ≤ RM30.","在出游指南的「目的地」选马来西亚的槟城。「场地」选「室内」，「用时」选 ≤ 3 h，「预算」选 ≤ RM30。"],["Under Search & more options, set Guide type to Attractions and click Find guides. Open a matching guide and click Save this outing.","展开「搜索与更多条件」，把「指南类型」设为「景点」，点「找指南」。打开符合条件的一条，点「收藏这条路线」。"]],
    route: [["Set Destination to Penang, Malaysia. Set Attractions, Indoors, Time ≤ 3 h and Budget ≤ RM30.","目的地选马来西亚槟城，选择景点、室内、用时 ≤ 3 小时、预算 ≤ RM30。"],["Open a matching guide and click Save this outing.","打开符合条件的指南，点击「收藏这条路线」。"]],
    answer: ["penang-state-gallery: Malaysia / Penang / attraction / indoor / RM20 / 2h. The glass museum exceeds the budget, the garden is outdoors, and the long gallery guide takes 4h. These are editorial budgets, not ticket quotes. Assessment checks the actual saved selection and its planning fields.","penang-state-gallery：马来西亚／槟城／景点／室内／RM20／2小时。玻璃博物馆超预算，植物园在户外，半日美术馆需4小时。金额为编辑参考预算，并非门票报价。判定核对实际收藏和保存的规划字段。"],
    cover: "assets/guide-gallery.svg",
    advanced: false,
    badge: ["Penang·≤3h·≤RM30","槟城·室内·≤3h≤RM30"],
    steps: [["Save an indoor Penang attraction within RM30 and 3 hours","收藏预算不超过 RM30、用时不超过 3 小时的槟城室内景点"]],
    hint2: ["Choose Attractions as well as Indoors, then check the time and budget on the guide.", "「景点」和「室内」都选上，再看指南里的用时和预算。"]
  }
];

// Previously started rounds and results still resolve these tasks.
window.BROWSE_BOOTH_LEGACY_TASKS.push(
  {
    id: "minute2-recipe-budget",
    retired: true,
    scene: "recipes",
    file: "recipe.html",
    title: ["Save a lentil soup recipe for six","收藏六人份的红扁豆番茄汤"],
    brief: ["In Recipe Book, find the RM5-per-serving red lentil and tomato soup. Set it to six servings, tick off the red lentils, then save the recipe.","在食谱大全找到每份 RM5 的红扁豆番茄汤。设为 6 人份，勾选红扁豆，再收藏食谱。"],
    hint: ["Jump to recipe takes you to the serving selector and the ingredient list.","点「直接看食谱」就能找到份量选项和食材清单。"],
    goals: [["In Recipe Book, search for lentil and open Red lentil & tomato soup (RM5 per serving).","在食谱大全搜索「扁豆」，打开每份 RM5 的红扁豆番茄汤。"],["Click Jump to recipe, set Servings to 6, and tick Red lentils under Ingredients.","点「直接看食谱」，把「份量」设为 6，在「食材」里勾选红扁豆。"],["Click Save recipe.","点「收藏食谱」。"]],
    route: [["Search for lentil and open the red lentil and tomato soup.","搜索「扁豆」，打开红扁豆番茄汤。"],["Jump to recipe, set six servings, tick the red lentils, and save the recipe.","点「直接看食谱」，选 6 人份，勾选红扁豆并收藏食谱。"]],
    answer: ["red-lentil-soup · RM5 per serving, 35 minutes, vegan, one pot. At six servings the checklist shows 420 g of red lentils.","red-lentil-soup · 每份 RM5，35 分钟，纯素，一口锅。六人份的食材清单显示 420 g 红扁豆。"],
    cover: "assets/real-food-red-lentil-soup-thumb.webp",
    advanced: false,
    badge: ["6 servings·RM5","红扁豆汤·6人·RM5/份"],
    steps: [["Open the RM5-per-serving red lentil and tomato soup","打开每份 RM5 的红扁豆番茄汤"],["Set it to six servings","改成 6 人份"],["Tick Red lentils in Ingredients","在食材清单勾上红扁豆"],["Save the recipe","收藏食谱"]],
    hint2: ["Search “lentil” and use Jump to recipe on the soup page.", "搜「扁豆」。打开汤的详情后，点「直接看食谱」。"]
  },
  {
    id: "minute2-tool-webp",
    retired: true,
    scene: "tools",
    file: "tools.html",
    title: ["Download an 800 px WebP from Photo Tools","用图片工具下载宽 800 px 的 WebP"],
    brief: ["Open the La Trobe reading room example in Photo Tools. Download it as a WebP, 800 px wide at 70% quality.","在图片工具打开「拉筹伯阅览室」示例图，下载为宽 800 px、画质 70% 的 WebP。"],
    hint: ["Pick the photo from the example image library. The preview updates as you change the settings.", "从「示例图片库」选图。改完设置，预览会自动更新。"],
    goals: [["In Photo Tools, scroll to Example image library. Find La Trobe reading room and click Open example.","在图片工具下滑到「示例图片库」，找到「拉筹伯阅览室」，点「打开示例」。"],["In Compression settings, choose WebP. Set Maximum width to 800 px and Image quality to 70%.","在「压缩设置」里选 WebP，把「最大宽度」设为 800 px，把「画质」设为 70%。"],["Click Download image. The WebP appears in the game’s downloads at the top right.","点「下载图片」。WebP 会出现在游戏右上角的下载列表里。"]],
    route: [["Look through the example photos and load the La Trobe Reading Room.","浏览示例照片，载入拉筹伯阅览室。"],["Select WebP, width 800 and quality 70%. The settings update the preview automatically.","设为 WebP、宽 800、画质 70%，预览会自动更新。"],["Check the result and download it.","核对结果后下载。"]],
    answer: ["sunroom (sunroom-study). The 1558 × 2048 source scales to 800 × 1052. Use custom settings.","sunroom（拉筹伯阅览室）。原图 1558 × 2048，按比例生成 800 × 1052。使用自定义设置。"],
    cover: "assets/real-wall-sunroom-study-thumb.webp",
    advanced: false,
    badge: ["WebP·800px·70%","WebP·800px·70%"],
    steps: [["Download the La Trobe reading room example","下载「拉筹伯阅览室」示例图"],["Download it as an 800 px WebP at 70% quality","下载宽 800 px、画质 70% 的 WebP"]],
    hint2: ["Find the photo below the upload box and click Open example.", "在上传区下方找到那张照片，点「打开示例」。"]
  },
  {
    id: "minute2-market-lens",
    retired: true,
    scene: "market",
    file: "market.html",
    title: ["Save an EOS 550D with a lens for up to RM700","收藏 RM700 以内带镜头的 EOS 550D"],
    brief: ["In Used Cameras, check the two EOS 550D listings. Save the one that includes both a camera body and a lens for RM700 or less.","在二手相机网站看两条 EOS 550D 商品，收藏含机身和镜头、总价不超过 RM700 的那套。"],
    hint: ["Look under Included to see what comes with each camera.", "想知道有没有镜头，看详情里的「附带配件」。"],
    goals: [["In Used Cameras, search for EOS 550D. Click Compare + on the Good and Excellent listings to put both on one page.","在二手相机网站搜索 EOS 550D。分别点成色「良好」和「极佳」商品上的「对比 +」，把两条商品放在一起看。"],["Open Compare gear. Look at the price and the Included row to find the body and lens kit for RM700 or less.","打开「相机对比」。看价格和「附带配件」，找出含机身和镜头、总价不超过 RM700 的那套。"],["Click that kit’s name, then click ♡ Save on its detail page.","点那套相机的商品名称，再在详情页点「♡ 收藏」。"]],
    route: [["Search for EOS 550D and click Compare + on the Good and Excellent listings.","搜索 EOS 550D，在成色「良好」和「极佳」商品上分别点「对比 +」。"],["Open Compare gear. Find the kit by price and the Included row, open its listing, and click Save.","打开「相机对比」。看价格和「附带配件」，打开符合条件的商品并点「收藏」。"]],
    answer: ["canon-good: RM420, body only. canon-excellent: RM680, with EF-S 18–55mm, battery and charger. Save canon-excellent.","canon-good：RM420，仅机身。canon-excellent：RM680，附 EF-S 18–55mm 镜头、电池和充电器。收藏 canon-excellent。"],
    cover: "assets/market-canon-eos-550d.webp",
    advanced: true,
    badge: ["EOS 550D·RM700","EOS 550D·RM700"],
    steps: [["Put both EOS 550D listings in the side-by-side view","把两条 EOS 550D 商品加入对比"],["Save the kit with a lens for RM700 or less","收藏 RM700 以内带镜头的那套"]],
    hint2: ["Search EOS 550D. One listing is body only.", "搜 EOS 550D，其中一条只卖机身。"]
  },
  {
    id: "minute2-movie-animation",
    retired: true,
    scene: "movies",
    file: "movie.html",
    title: ["Make a watchlist with exactly two animated films","建一张只含两部动画的片单"],
    brief: ["Save Sintel and Elephants Dream to your watchlist. Leave only those two in the list.", "把《辛特尔》和《大象之梦》加进想看片单，最后只留这两部。"],
    hint: ["Search for each film by title. You can save it from the results.", "直接搜片名，在搜索结果里就能加入想看。"],
    goals: [["Search for Sintel and Elephants Dream and add both to your Watchlist.","分别搜 Sintel 和 Elephants Dream，把两部都加入「想看」。"],["Open your Watchlist and remove any other films so only those two remain.","打开「想看片单」，移除其他影片，确认只剩这两部。"]],
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
    id: "minute2-book-verne",
    retired: true,
    scene: "books",
    file: "book.html",
    title: ["Save the English and French editions of Around the World in Eighty Days","收藏《八十天环游地球》的英法两版"],
    brief: ["Save the English and French editions of Around the World in Eighty Days. Download the opening of the French edition as a TXT file.", "收藏《八十天环游地球》的英文版和法文版，再把法文开篇下载成 TXT。"],
    hint: ["Check the language on each book page. The excerpt is under Read.", "打开书目确认语言。点「阅读」就能看到开篇。"],
    goals: [["Find Around the World in Eighty Days and save both the English and French editions.","找到《八十天环游地球》，分别收藏英文版和法文版。"],["Open Read on the French edition and download the opening excerpt as a TXT file.","打开法文版的「阅读」，把开篇片段下载为 TXT。"]],
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
    retired: true,
    scene: "museum",
    file: "museum.html",
    title: ["Pick the Manet painting under 100 cm wide","从两幅马奈画作中选一幅宽不到 100 cm 的"],
    brief: ["Compare Manet’s Boating and The Monet Family in Their Garden at Argenteuil. Add the one under 100 cm wide to My Exhibition.", "对比马奈的《划船》和《莫奈一家在阿让特伊的花园里》，把宽度不到 100 cm 的那幅加进「我的展览」。"],
    hint: ["Search for Manet, then open Compare to see both sets of dimensions.", "搜「马奈」，把两幅都加进对比，就能并排看尺寸。"],
    goals: [["Add Boating and The Monet Family in Their Garden at Argenteuil to Compare.","把《划船》和《莫奈一家在阿让特伊的花园里》加入「对比」。"],["Check their widths and add the painting under 100 cm wide to My Exhibition.","核对宽度，把宽度不到 100 cm 的那幅加入「我的展览」。"]],
    route: [["Search Manet and check the date and subject.","搜索 Manet 或马奈，核对年份与题材。"],["Add Boating and The Monet Family in Their Garden at Argenteuil to Compare.","把《划船》和《莫奈一家在阿让特伊的花园里》加入对比。"],["Compare the second measurement in the dimensions and save the narrower work.","对比尺寸的第二个数值，收藏较窄的作品。"]],
    answer: ["436947 Boating: 130.2 cm wide. 436965 The Monet Family in Their Garden at Argenteuil: 99.7 cm wide. Save 436965.","436947《划船》宽 130.2 cm，436965《莫奈一家在阿让特伊的花园里》宽 99.7 cm。收藏 436965。"],
    cover: "assets/culture-art-436947-thumb.webp",
    advanced: false,
    badge: ["Manet·<100cm","Manet·对比·<100cm"],
    steps: [["Compare Boating and The Monet Family in Their Garden at Argenteuil", "对比《划船》和《莫奈一家在阿让特伊的花园里》"], ["Check which one is under 100 cm wide", "看哪幅宽不到 100 cm"], ["Add the narrower painting to My Exhibition", "把较窄的那幅加进「我的展览」"]],
    hint2: ["Dimensions are listed height first, then width.", "尺寸先写高度，后写宽度。"]
  }
);
