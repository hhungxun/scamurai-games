/* English / 简体中文 for Phishing Fishing.
   Loaded after the data scripts and before app.js. In Chinese mode it overlays emails.zh.js onto
   EMAIL_BANK and translates the rendered interface (text and labels) from the tables below, so
   app.js and site-popups.js stay English-only. Scoring, answers and URLs are never touched.
   Language: ?lang=zh / ?lang=en, remembered per browser in localStorage("pf-lang"). */
(function (root) {
  "use strict";
  const KEY = "pf-lang";
  let lang = "en";
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "zh" || q === "en") localStorage.setItem(KEY, q);
    lang = localStorage.getItem(KEY) === "zh" ? "zh" : "en";
  } catch (e) {
    lang = new URLSearchParams(location.search).get("lang") === "zh" ? "zh" : "en";
  }
  root.PF_LANG = lang;

  /* Exact interface strings (trimmed text nodes and aria-label/title/placeholder/alt values). */
  const DICT = {
    // Page frame, welcome screen and reference dialog
    "Skip to game": "跳到游戏",
    "Phishing Fishing home": "Phishing Fishing 首页",
    "Think before": "点击之前，",
    "you click.": "先想一想。",
    "Community Service": "社区服务",
    "Scam Awareness Initiative": "防诈意识计划",
    "How to verify": "如何核实",
    "Enter full screen": "进入全屏",
    "Exit full screen": "退出全屏",
    "Full screen (or press F11)": "全屏（或按 F11）",
    "Full screen is unavailable. Use your browser's F11 shortcut instead.": "无法进入全屏。请改用浏览器的 F11 快捷键。",
    "STATION 03 / SAFE SIMULATED INBOX": "第 03 站 / 安全模拟收件箱",
    "Practice here. Stay safer out there.": "在这里练习，在外面更安全。",
    "XMUM Community Service": "XMUM 社区服务",
    "OPTIONAL REFERENCE": "参考资料（可选）",
    "Close reference": "关闭参考资料",
    "These are the services' real reference domains. A message that claims to be from a service should lead to that domain — compare the actual destination against the one listed here. Check the requested action and the actual destination, then choose Legitimate or Phishing.":
      "以下是各项服务的真实参考域名。声称来自某项服务的邮件，应该链接到该服务的域名——请把实际目的地与这里列出的域名对照。检查邮件要求的操作和实际目的地，然后选择“正常”或“钓鱼”。",
    "Sender addresses can be spoofed and legitimate accounts can be compromised. A matching domain, HTTPS or polished formatting does not prove authenticity. A deadline or payment amount does not prove phishing. Check the request and use a known app, bookmark or contact to verify it independently.":
      "发件人地址可以伪造，正规账户也可能被盗用。域名相符、有 HTTPS 或排版精美，都不能证明邮件是真的；有截止期限或付款金额，也不能证明它是钓鱼。请检查邮件提出的要求，并通过你熟悉的 App、书签或联系方式自行核实。",
    "During a round, the shared timer keeps running while this reference is open.": "游戏进行中，即使打开这份参考资料，共用计时器也会继续倒数。",
    "XMUM / University": "XMUM / 大学",
    "Check announcements, bookings and registrations in your usual student portal or at the campus service counter.": "在你常用的学生门户或校园服务柜台查看公告、预约和报名。",
    "Check card activity in the bank app. Use the number printed on your card for support.": "在银行 App 中查看银行卡交易。如需协助，请拨打印在卡背面的电话号码。",
    "Compare the tracking reference, delivery arrangements and charges with your original order and courier app.": "把追踪编号、派送安排和收费与你的原始订单及快递 App 对照。",
    "Confirm purchases, receipts and payment status in My Purchases in your existing shopping account.": "在你原有购物账户的“我的购买”中确认订单、收据和付款状态。",
    "Check tax notices in MyTax using a saved bookmark or an independently verified address.": "通过已保存的书签或自行核实过的网址进入 MyTax，查看税务通知。",
    "Review recovery details and security activity through Account → Security in your normal student portal.": "在你平时使用的学生门户中，通过“账户 → 安全”查看账户找回资料和安全活动。",
    "THE INBOX CHALLENGE": "收件箱挑战",
    "Catch the scams.": "揪出诈骗，",
    "Let safe mail swim.": "放走安全邮件。",
    "Triage your XMUM Outlook inbox. Inspect the sender, hover or click links & attachments safely, then decide whether each email is legitimate or phishing.":
      "整理你的 XMUM Outlook 收件箱。检查发件人，安全地悬停或点击链接和附件，然后判断每封邮件是正常邮件还是钓鱼邮件。",
    "Start Game": "开始游戏",
    "THE INBOX IS THE POND.": "收件箱就是池塘。",
    "TAKE": "你会",
    "THE BAIT?": "上钩吗？",
    "01 / READ": "01 / 阅读",
    "02 / INSPECT": "02 / 检查",
    "03 / REEL": "03 / 收线",
    "A quick game.": "一个小游戏，",
    "A useful habit.": "一个好习惯。",
    "Read the email": "阅读邮件",
    "Check the sender, the message": "查看发件人、邮件内容，",
    "and what it asks you to do.": "以及它要你做什么。",
    "Make your call": "做出判断",
    "Choose Legitimate or Phishing.": "选择“正常”或“钓鱼”。",
    "Your choice records the answer.": "选择即作答。",
    "Check your catch": "查看渔获",
    "Reveal your fish and field badges,": "揭晓你的渔获和实战徽章，",
    "then learn from every email.": "再从每封邮件中学习。",
    "This exercise has been updated.": "此练习已更新。",
    "This tab contains an earlier Round. Its saved score stays unchanged. Use Next participant if it is saved, or ask the Game Master to cancel an unfinished Round before starting the new exercise.":
      "此分页里是较早的一轮游戏，已保存的得分不会改变。如果已保存，请点击 Next participant（下一位）；如果尚未完成，请游戏主持人先取消该轮，再开始新的练习。",
    "This round draws emails missing from this build. Ask the Game Master to cancel the Round.": "本轮抽到的邮件不在当前版本中。请游戏主持人取消这一轮。",
    "Let's check the game files.": "我们来检查一下游戏文件。",
    "Keep this tab open.": "请保持此分页开启。",
    "Ready for a new player. Previous answers and timer cleared.": "已准备好迎接新玩家。之前的答案和计时已清除。",
    "How to play": "玩法说明",
    // Outlook mailbox
    "Outlook mailbox bar": "Outlook 邮箱栏",
    "XMUM Mail": "XMUM 邮箱",
    "Search mail": "搜索邮件",
    "Time remaining": "剩余时间",
    "Turn sound off": "关闭音效",
    "Turn sound on": "开启音效",
    "Sound effects": "音效",
    "Home": "开始",
    "View": "视图",
    "Help": "帮助",
    "Mail actions": "邮件操作",
    "New mail": "新邮件",
    "Delete": "删除",
    "Archive": "存档",
    "Move to": "移动到",
    "Mark Safe": "标记为安全",
    "Report Phishing": "举报钓鱼邮件",
    "Answers revealed at end of round": "答案将在本轮结束后公布",
    "Timer pauses after each call for instant feedback": "每次判断后暂停计时，立即显示结果",
    "Correct · +10 pts": "判断正确 · +10 分",
    "Incorrect · +0 pts": "判断错误 · +0 分",
    "Answer recorded": "已记录答案",
    "Timer paused": "计时已暂停",
    "This email is": "这封邮件属于",
    "Fake / Phishing": "诈骗 / 钓鱼邮件",
    "Verdict pending": "等待结果",
    "Next Email": "下一封邮件",
    "See Results": "查看成绩",
    "Final email complete": "最后一封已完成",
    "Mail": "邮件",
    "Calendar": "日历",
    "People": "联系人",
    "To Do": "待办",
    "Apps": "应用",
    "Mail folders": "邮件文件夹",
    "Favorites": "收藏夹",
    "Inbox": "收件箱",
    "Sent Items": "已发送邮件",
    "Junk Email": "垃圾邮件",
    "Drafts": "草稿",
    "Deleted Items": "已删除邮件",
    "Safe training mailbox": "安全训练邮箱",
    "Inbox messages": "收件箱邮件",
    "Inbox message list": "收件箱邮件列表",
    "Focused": "重点",
    "Other": "其他",
    "Today": "今天",
    "Reported": "已举报",
    "Marked Safe": "已标记为安全",
    "Reading pane": "阅读窗格",
    "Email": "邮件",
    "Easy": "简单",
    "Medium": "中等",
    "Hard": "困难",
    "Email message; scroll to read the full text": "邮件正文；滚动可阅读全文",
    "Scroll to read more": "向下滚动阅读更多",
    "Details ▾": "详情 ▾",
    "Hide details ▴": "隐藏详情 ▴",
    "View domain & header details": "查看域名和邮件头详情",
    "From": "发件人",
    "Domain": "域名",
    "Inspect URL": "检查网址",
    "Hide URL": "隐藏网址",
    "ACTUAL DESTINATION": "实际目的地",
    "ACTUAL SIMULATED DESTINATION": "实际目的地（模拟）",
    "Safe inspection only — or click the button/link to preview the site in a safe sandbox.": "仅作安全检查——也可以点击按钮或链接，在安全沙盒中预览网站。",
    "Open safe simulated website preview": "打开安全的模拟网站预览",
    "Open Preview ↗": "打开预览 ↗",
    "App consent preview:": "应用授权预览：",
    "Requested scopes:": "请求的权限范围：",
    "File info ▾": "文件信息 ▾",
    "Hide info ▴": "隐藏信息 ▴",
    "SAFE FILE INFO": "安全文件信息",
    "Type:": "类型：",
    "When opened:": "打开后：",
    "Safe inspection only — file will not execute or download.": "仅作安全检查——文件不会运行或下载。",
    "Preview attachment in safe sandbox": "在安全沙盒中预览附件",
    "Click Details, hover/click links, or click attachments to inspect safely.": "点击“详情”、悬停或点击链接，或点击附件，都可以安全检查。",
    "Keep in Inbox · Legitimate": "保留在收件箱（正常邮件）",
    "Reported · moved to Junk Email": "已举报 · 移至垃圾邮件",
    "Marked safe · kept in Inbox": "已标记为安全 · 保留在收件箱",
    "Inbox cleared!": "收件箱已清空！",
    "Answer recorded.": "已记录答案。",
    "Could not reach the server. Your answer will be re-sent before the round finishes.": "无法连接服务器。你的答案会在本轮结束前重新发送。",
    // Check Yourself pane
    "Check Yourself": "自行核实",
    "Check It Yourself": "自行核实",
    "Check yourself record": "自行核实记录",
    "Hide Check Yourself pane": "隐藏自行核实面板",
    "Not sure? Open your own app or portal directly to double-check this email.": "拿不准？直接打开你自己的 App 或门户，再核实一下这封邮件。",
    "Free to check (no score penalty) · timer keeps running.": "核实不扣分 · 计时器会继续倒数。",
    "YOUR OWN APP / PORTAL": "你自己的 App / 门户",
    "What shows up in your own app or portal — compare it against the sender, links, and request.": "这是你自己的 App 或门户里显示的内容——拿来和发件人、链接及要求对照。",
    "Your app or portal record loaded.": "已载入你的 App 或门户记录。",
    "Checked ✓": "已核实 ✓",
    // Results
    "THE INBOX CHALLENGE / ROUND COMPLETE": "收件箱挑战 / 本轮结束",
    "YOUR SCORE": "你的得分",
    "YOUR ANGLER RANK": "你的钓手等级",
    "Scamurai Master Angler": "Scamurai 钓鱼大师",
    "A perfect net. Not one scam slipped through.": "一网打尽，没有一封诈骗邮件漏网。",
    "Shark Spotter": "鲨鱼侦察员",
    "You read the water like a pro.": "你像行家一样看透了水面。",
    "Seasoned Angler": "老练钓手",
    "Solid catch. A couple of crafty ones got away.": "收获不错，只有几条狡猾的溜走了。",
    "Deckhand": "见习水手",
    "You're learning the tides. Check the clues below.": "你正在摸清潮汐，看看下面的线索吧。",
    "Bait Taker": "上钩的鱼",
    "The scammers had a good day. Read the clues and cast again!": "今天骗子收获颇丰。看看线索，再来一竿！",
    "Time's up. Let's find the clues.": "时间到！一起来找线索吧。",
    "Inbox checked. A little more awareness.": "收件箱检查完毕，警觉又多了一分。",
    "Ready to give it a go?": "准备好试一试了吗？",
    "No answers were recorded. Review the clues, then try a new round.": "没有记录到任何答案。看看线索，再来一轮吧。",
    "A sharp eye. Keep it going.": "眼光很准，继续保持！",
    "An inbox detective in the making.": "未来的收件箱侦探！",
    "Every email you answered was correct. Try keeping that accuracy while checking more messages.": "你答的每一封都对了。试着在保持准确的同时，检查更多邮件。",
    "You spotted every email correctly. Keep checking the details beyond the game.": "每封邮件你都判断正确。离开游戏后，也要继续留意这些细节。",
    "A good place to start.": "好的开始。",
    "Explore the review below and practise spotting the risky requests.": "看看下面的解析，练习识别有风险的请求。",
    "You're building your radar.": "你的雷达正在成形。",
    "Every clue you learn makes the next suspicious email easier to recognise.": "每学会一条线索，下一封可疑邮件就更容易识破。",
    "Your instincts are taking shape.": "你的直觉越来越准了。",
    "A few small details made the difference. Take a look at the clues below.": "几个小细节决定了结果。看看下面的线索吧。",
    "You've got a sharp eye.": "你的眼光很敏锐。",
    "Good accuracy. Review the details that slipped through and try again.": "准确率不错。看看漏掉的细节，再试一次。",
    "Round complete.": "本轮结束。",
    "Your answers were submitted, but the server review could not be loaded yet. Retry below to see your score breakdown and verdicts.": "你的答案已提交，但暂时无法载入服务器的批改结果。请点击下方重试，查看得分明细和判定。",
    "Verdicts and score breakdown are waiting on the server review.": "判定和得分明细正在等待服务器批改。",
    "Label accuracy (pending review)": "判断准确率（等待批改）",
    "Practice score only.": "仅为练习得分。",
    "The displayed score counts toward your event result.": "显示的得分将计入你的活动成绩。",
    "Could not load the verdicts from the server.": "无法从服务器载入判定结果。",
    "Retry loading review": "重新载入批改结果",
    "Round complete. Could not load the review from the server. Use Retry loading review.": "本轮结束。无法从服务器载入批改结果，请点击“重新载入批改结果”。",
    "THE DAY'S FISHING REPORT": "今日渔获报告",
    "Your catch.": "你的渔获。",
    "Choose a card to open its email explanation.": "点选卡片，查看该邮件的解析。",
    "Email catches": "邮件渔获",
    "Scam caught": "抓到诈骗",
    "Safe mail released": "放走安全邮件",
    "Scam escaped": "诈骗溜走",
    "Safe mail miscast": "误抓安全邮件",
    "Not checked": "未检查",
    "Field badges": "实战徽章",
    "Earned field badges": "获得的实战徽章",
    "No badges this round. Catch a scam to earn a badge for the trick you spotted.": "本轮没有获得徽章。抓到一封诈骗邮件，就能凭你识破的手法赢得徽章。",
    "Badges celebrate what you spotted. Your score is shown above.": "徽章是对你识破手法的肯定，得分显示在上方。",
    "Secret Keeper": "守密人",
    "Spotted a request for a password, code or recovery phrase.": "识破了索取密码、验证码或恢复短语的请求。",
    "Card Guard": "银行卡守卫",
    "Spotted unnecessary collection of payment-card details.": "识破了不必要的银行卡资料收集。",
    "Attachment Angler": "附件猎手",
    "Spotted an unsafe attachment or security override.": "识破了不安全的附件或绕过安全保护的要求。",
    "Permission Detective": "权限侦探",
    "Spotted access that the task does not need.": "识破了超出实际需要的访问权限。",
    "Fee Finder": "费用侦探",
    "Spotted a pay-first recruitment trap.": "识破了先付款的招聘陷阱。",
    "Transfer Tracker": "转账追踪者",
    "Spotted a supposed safe-account transfer.": "识破了所谓的“安全账户”转账。",
    "Remote Access Watch": "远程控制哨兵",
    "Spotted a refund that asks for control of your device.": "识破了要求控制你设备的退款。",
    "THE DETAILS MAKE THE DIFFERENCE": "细节决定成败",
    "Review Answers": "答案解析",
    "Open an email to see the clues": "打开邮件查看线索",
    "Your answer:": "你的答案：",
    "· Correct:": "· 正确答案：",
    "Correct": "正确",
    "Incorrect": "错误",
    "Unanswered": "未作答",
    "Unavailable": "不可用",
    "Verdict unavailable": "暂无判定",
    "Legitimate": "正常邮件",
    "Phishing": "钓鱼邮件",
    "Review details": "查看详情",
    "Why this request is phishing": "为什么这是钓鱼请求",
    "Why this request is legitimate in this case": "为什么在这种情况下这是正常请求",
    "Counterpoint": "反方观点",
    "Why not Legitimate?": "为什么不是正常邮件？",
    "Why not Phishing?": "为什么不是钓鱼邮件？",
    "Decisive clues": "关键线索",
    "Safe next step": "安全的下一步",
    "Decisive clue": "关键线索",
    "Contextual clue: not sufficient alone": "背景线索：单凭这一点不足以判断",
    "A familiar look is a clue. It isn't a guarantee.": "看起来眼熟只是线索，不是保证。",
    "Sender addresses can be spoofed and genuine accounts compromised. Urgency, payment amounts and attachments do not automatically mean phishing. Inspect actual destinations, check permission requests, and verify through a known app, bookmark or contact. Never share passwords, PINs or one-time codes. Match every actual destination against the institution's real domain: a lookalike such as maybank2u-verify.com is not maybank2u.com.my.":
      "发件人地址可以伪造，真实账户也可能被盗用。紧迫感、付款金额和附件并不一定代表钓鱼。请检查实际目的地和权限请求，并通过你熟悉的 App、书签或联系方式核实。绝不要透露密码、PIN 或一次性验证码。把每个实际目的地与机构的真实域名对照：像 maybank2u-verify.com 这样的仿冒域名，并不是 maybank2u.com.my。",
    "One smarter click can make a difference.": "每一次谨慎点击，都能带来改变。",
    "New Player": "新玩家",
    // Simulated browser and file popups
    "SAFE SANDBOX": "安全沙盒",
    "Close (Esc) ✕": "关闭 (Esc) ✕",
    "Close simulated browser": "关闭模拟浏览器",
    "Close file preview": "关闭文件预览",
    "Safe simulated website preview": "安全的模拟网站预览",
    "Check HTTPS & domain": "检查 HTTPS 和域名",
    "Sandbox simulation — nothing was submitted, installed, or sent. Close this popup to classify the email in Outlook.": "沙盒模拟——没有提交、安装或发送任何内容。关闭此弹窗后，回到 Outlook 为这封邮件做出判断。",
    "Maybank2u · Device Security Review": "Maybank2u · 设备安全检查",
    "Digital Banking Security": "数字银行安全",
    "New device detected · Windows / Chrome · Kuala Lumpur · Ref MB-841209": "检测到新设备 · Windows / Chrome · 吉隆坡 · 编号 MB-841209",
    "Remove Unrecognised Device": "移除无法识别的设备",
    "Outgoing transfers are temporarily paused. Sign in and enter the SMS authorisation code sent to your phone to confirm device removal (no transfer will be made).": "转出交易已暂时冻结。请登录并输入发送到你手机的短信授权码，以确认移除设备（不会进行任何转账）。",
    "Online Banking Username": "网上银行用户名",
    "Online Banking Login ID": "网上银行登录 ID",
    "Online Banking Password": "网上银行密码",
    "Banking Password": "网银密码",
    "6-Digit SMS Authorisation Code (OTP)": "6 位数短信授权码（OTP）",
    "6-Digit SMS TAC": "6 位数短信 TAC 验证码",
    "Confirm & Remove Device": "确认并移除设备",
    "e.g. aisha.student": "例如 aisha.student",
    "e.g. D3-04-12, XMUM Sepang": "例如 D3-04-12, XMUM Sepang",
    "Enter 6-digit code": "输入 6 位数验证码",
    "Enter banking login ID": "输入网银登录 ID",
    "Enter bank username": "输入网银用户名",
    "Enter SMS TAC": "输入短信 TAC 验证码",
    "Pos Malaysia · Sepang Hub Redelivery": "Pos Malaysia · Sepang 转运中心重新派送",
    "Delivery Exception Desk": "派送异常服务台",
    "Parcel held at Sepang Hub · Truncated unit number": "包裹滞留在 Sepang 转运中心 · 单位号不完整",
    "Address Correction & Surcharge (RM 2.40)": "地址更正及附加费（RM 2.40）",
    "Confirm your campus block/unit and settle the RM 2.40 re-labelling surcharge for tomorrow’s dispatch.": "请确认你的校园座号/单位号，并缴付 RM 2.40 重新贴标附加费，以便明天发货。",
    "Block / Unit Number": "座号 / 单位号",
    "Card Number (Visa / Mastercard)": "卡号（Visa / Mastercard）",
    "Expiry (MM/YY)": "有效期（MM/YY）",
    "Pay RM 2.40 & Release Parcel": "支付 RM 2.40 并放行包裹",
    "ParcelPath Tracking": "ParcelPath 包裹追踪",
    "ParcelPath Tracking · PP-MY-612483": "ParcelPath 包裹追踪 · PP-MY-612483",
    "XMUM Campus Parcel Counter": "XMUM 校园包裹柜台",
    "Ready for Pickup": "可取件",
    "Hours:": "时间：",
    "10:00 am – 6:00 pm (collect by Friday 6:00 pm)": "上午 10:00 – 下午 6:00（请于周五下午 6:00 前领取）",
    "Delivery fee:": "运费：",
    "Standard campus delivery": "校园标准派送",
    "Bring your student card and quote PP-MY-612483 at the staffed counter. Balance due: RM 0.00.": "请携带学生证到有职员值班的柜台，并报上编号 PP-MY-612483。应付余额：RM 0.00。",
    "MyTax · Surplus Tax Credit Disbursement": "MyTax · 溢缴税款退还",
    "MyKad / IC Number": "MyKad / 身份证号码",
    "Refund Amount": "退款金额",
    "Select Bank": "选择银行",
    "Bank": "银行",
    "Bank Name": "银行名称",
    "Account Holder": "账户持有人",
    "Account No.": "账号",
    "Instant Bank Verification (FPX Verify)": "即时银行验证（FPX Verify）",
    "Instant FPX Bank Ownership Check": "FPX 即时银行账户持有人核查",
    "Log in to your online banking account and enter the 6-digit SMS TAC to confirm ownership before Friday 17:00.": "请在周五 17:00 前登录你的网上银行账户，并输入 6 位数短信 TAC 验证码以确认账户归属。",
    "Complete FPX Verify (RM 0.00)": "完成 FPX 验证（RM 0.00）",
    "Verify via FPX (RM 0.00)": "通过 FPX 验证（RM 0.00）",
    "RM 0.00 will be debited.": "将扣款 RM 0.00。",
    "Direct Credit Verification": "直接入账验证",
    "XMUM Finance Portal": "XMUM 财务门户",
    "XMUM Finance Portal · Allowance AL-26118": "XMUM 财务门户 · 津贴 AL-26118",
    "Allowance": "津贴",
    "Allowance Batch AL-26118": "津贴批次 AL-26118",
    "Allowance AL-26118 · FPX Instant Verification": "津贴 AL-26118 · FPX 即时验证",
    "Scheduled (Friday batch)": "已排期（周五批次）",
    "Confirm Receiving Account": "确认收款账户",
    "Confirm Receiving Bank Details": "确认收款银行资料",
    "Verify the bank name and receiving account number on file for your placement allowance disbursement.": "请核对档案中用于发放实习津贴的银行名称和收款账号。",
    "Verify your receiving bank account via our FPX partner before Friday’s cut-off.": "请在周五截止前，通过我们的 FPX 合作伙伴验证你的收款银行账户。",
    "XMUM Student Finance": "XMUM 学生财务",
    "Status": "状态",
    "Active": "有效",
    "Permissions requested": "请求的权限",
    "Permissions requested · Microsoft 365": "请求的权限 · Microsoft 365",
    "Document Sync Viewer": "文件同步查看器",
    "Unverified publisher": "未验证的发布者",
    "This app would like to:": "此应用希望：",
    "Read, update, create, and delete all emails in your mailbox": "读取、更新、创建和删除你邮箱中的所有邮件",
    "Send mail as you to any internal or external recipient": "以你的名义向任何内部或外部收件人发送邮件",
    "Sign in and read your basic campus profile": "登录并读取你的基本校园资料",
    "Files.Read (this file only)": "Files.Read（仅限此文件）",
    "Accept": "接受",
    "Cancel": "取消",
    "Scope": "权限范围",
    "AG1-2 Shared Folder · Read-Only": "AG1-2 共享文件夹 · 只读",
    "AG1-2 Community Event Budget (View Only)": "AG1-2 社区活动预算（仅供查看）",
    "Signed in via XMUM SSO (student@xmum.edu.my). No additional mailbox permissions requested.": "已通过 XMUM SSO 登录（student@xmum.edu.my）。没有请求额外的邮箱权限。",
    "Item": "项目",
    "Qty": "数量",
    "Estimate": "估价",
    "Booth Standee Banners": "摊位立牌横幅",
    "Printed QR Station Cards": "打印的二维码站点卡",
    "Volunteer Refreshments": "志愿者茶点",
    "Campus ID · Account Security": "Campus ID · 账户安全",
    "Account → Security → Recovery": "账户 → 安全 → 找回",
    "Window": "时段",
    "Friday 6:00–8:00 pm": "周五晚上 6:00–8:00",
    "Recovery Phone Number": "找回手机号码",
    "Current Phone": "当前手机号码",
    "Confirm Current Number": "确认当前号码",
    "XMUM Events · First Aid Workshop FA-1124": "XMUM 活动 · 急救工作坊 FA-1124",
    "XMUM Student Activities": "XMUM 学生活动",
    "My Registrations": "我的报名",
    "Registration": "报名",
    "First Aid Workshop · Sat 10:00 am–12:00 pm": "急救工作坊 · 周六上午 10:00–中午 12:00",
    "Venue:": "地点：",
    "Student Activity Centre, Room 2": "学生活动中心 2 号室",
    "Refundable Seat Deposit:": "可退还座位押金：",
    "RM 10.00 (returned to Student Billing after attendance check-in)": "RM 10.00（签到出席后退回学生账单）",
    "Pay RM 10.00 via Student Portal Billing": "通过学生门户账单支付 RM 10.00",
    "Pay via your logged-in university billing account. An official portal receipt is issued immediately.": "通过已登录的大学账单账户付款，门户会立即开出正式收据。",
    "XMUM Career Services": "XMUM 就业服务处",
    "XMUM Career Services · CS-26104": "XMUM 就业服务处 · CS-26104",
    "Careers → My Applications": "就业 → 我的申请",
    "Placement": "实习安排",
    "Shortlisted": "已入选",
    "Provisional (Confirm by Fri 5 pm)": "暂定（请于周五下午 5 点前确认）",
    "Select Interview Slot · Data Internship": "选择面试时段 · 数据实习",
    "Thu 10:00 AM · Room A2-204": "周四上午 10:00 · A2-204 室",
    "Thu 2:30 PM · Room A2-204": "周四下午 2:30 · A2-204 室",
    "Fri 11:00 AM · Online (Teams)": "周五上午 11:00 · 线上（Teams）",
    "Confirm Interview Slot": "确认面试时段",
    "XMUM Financial Aid": "XMUM 助学金处",
    "XMUM Financial Aid · SCH-26118": "XMUM 助学金处 · SCH-26118",
    "My Applications · SCH-26118": "我的申请 · SCH-26118",
    "Application": "申请",
    "Document": "文件",
    "Household Income Verification Checklist": "家庭收入核实清单",
    "Upload only the requested household income slip with unrelated account numbers and transactions redacted.": "只上传所要求的家庭收入证明，并遮盖无关的账号和交易记录。",
    "Upload Redacted Document": "上传已遮盖的文件",
    "XMUM Library": "XMUM 图书馆",
    "XMUM Library · Account LB-20418": "XMUM 图书馆 · 账户 LB-20418",
    "My Account · LB-20418": "我的账户 · LB-20418",
    "Library Account": "图书馆账户",
    "Outstanding Fine": "未缴罚款",
    "Settle Overdue Balance": "缴清逾期欠款",
    "Pay RM 8.00 via Student Billing": "通过学生账单支付 RM 8.00",
    "RM 4.50 — Paid with BookNest order BN-22814": "RM 4.50 — 已随 BookNest 订单 BN-22814 付款",
    "Order BN-22814": "订单 BN-22814",
    "Order SL-582714": "订单 SL-582714",
    "ShopLane Official Receipt": "ShopLane 正式收据",
    "Total Paid (Card ending 4821)": "已付总额（尾号 4821 的卡）",
    "A5 notebook set × 1": "A5 笔记本套装 × 1",
    "Tracking": "追踪",
    "Maintenance": "维护",
    "File": "文件",
    "SECURITY WARNING": "安全警告",
    "Macros have been disabled. This file originated from an email attachment.": "宏已被禁用。此文件来自邮件附件。",
    "Enable Content": "启用内容",
    "Microsoft Word — Assessment-SCH-26118.docm (Protected View)": "Microsoft Word — Assessment-SCH-26118.docm（受保护的视图）",
    "XMUM Scholarship Assessment — SCH-26118": "XMUM 奖学金评估 — SCH-26118",
    "Read-only PDF document · No scripts, macros, or external sign-in prompts.": "只读 PDF 文件 · 没有脚本或宏，也不会弹出外部登录提示。",
    "Reference": "参考编号"
  };
  /* Strings with numbers or names in them. */
  const DIFF = { Easy: "简单", Medium: "中等", Hard: "困难" };
  const RULES = [
    [/^(\d+) unread$/, "$1 封未读"],
    [/^(\d+) emails? left$/, "还剩 $1 封邮件"],
    [/^(\d+) emails? left to triage$/, "还有 $1 封邮件待处理"],
    [/^(\d+) seconds remaining, shared across all (\d+) emails$/, "剩余 $1 秒，$2 封邮件共用"],
    [/^(\d+) seconds remaining\.$/, "剩余 $1 秒。"],
    [/^EMAIL (\d+) · (Easy|Medium|Hard)$/, (_, n, d) => `第 ${n} 封 · ${DIFF[d]}`],
    [/^Email (\d+) with highlighted clues$/, "第 $1 封邮件（已标出线索）"],
    [/^(\d+) caught\.$/, "识破 $1 次。"],
    [/^Label accuracy \((\d+) right, (\d+) wrong\)$/, "判断准确率（对 $1 封，错 $2 封）"],
    [/^Time used of (\d+)s$/, "用时（上限 $1 秒）"],
    [/^Emails answered \/ (\d+)$/, "已作答邮件 / $1"],
    [/^(\d+) correct × (\d+) =$/, "答对 $1 封 × $2 分 ="],
    [/^\. Wrong and unanswered emails earn 0 points\. ?(.*)$/, (_, rest) => "。答错或未作答的邮件得 0 分。" + (DICT[rest] || rest)],
    [/^Round complete\. Score (\d+) out of (\d+)\. (\d+) answered, (\d+) correct, (\d+) incorrect, (\d+) unanswered\. Accuracy ([\d.]+) percent\. Review answers below\.$/,
      "本轮结束。得分 $1 / $2。作答 $3 封，答对 $4 封，答错 $5 封，未作答 $6 封。准确率 $7%。答案解析在下方。"],
    [/^To: (.+)$/, "收件人：$1"],
    [/^to (\S+@\S+)$/, "收件人：$1"],
    [/^Signed in: (.+)$/, "已登录：$1"],
    [/^PDF Viewer — (.+)$/, "PDF 查看器 — $1"],
    [/^([A-Z]{2,5}) Attachment$/, "$1 附件"],
    [/^Inspect destination for (.+)$/, "检查“$1”的实际目的地"],
    [/^Email (\d+) of (\d+)\. (.+)$/, "第 $1 封，共 $2 封。$3"],
    [/^Email (\d+): (.+)\. (Scam caught|Safe mail released|Scam escaped|Safe mail miscast|Not checked)\. Open explanation\.$/,
      (_, n, subject, outcome) => `第 ${n} 封：${subject}。${DICT[outcome]}。打开解析。`]
  ];
  /* Sentences split around inline <code>/<strong>: matched on the element's whole text. */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const BLOCKS = [
    [/^Check the whole destination\. A subdomain such as portal\.xmum\.edu\.my belongs under xmum\.edu\.my\. A name such as xmum\.edu\.my\.verify\.com belongs under verify\.com, not the university\. Watch for lookalikes such as maybank2u-verify\.com instead of maybank2u\.com\.my\.$/,
      () => "<strong>检查完整的目的地网址。</strong>像 <code>portal.xmum.edu.my</code> 这样的子域名属于 <code>xmum.edu.my</code>；而 <code>xmum.edu.my.verify.com</code> 这样的网址属于 <code>verify.com</code>，并不属于大学。还要留意仿冒域名，例如用 <code>maybank2u-verify.com</code> 冒充 <code>maybank2u.com.my</code>。"],
    [/^HTTPS encrypted connection — Check the bold root domain in the address bar above\. Both real sites and phishing sites use HTTPS padlocks\.$/,
      () => "<strong>HTTPS 加密连接</strong>——请查看上方地址栏中<strong>加粗的根域名</strong>。真网站和钓鱼网站都会显示 HTTPS 锁头图标。"],
    [/^This rubric document is protected\. Click Enable Content in the yellow bar above to run the embedded macro and decrypt panel remarks\.$/,
      () => "此评分文件受保护。请点击上方黄色栏中的<strong>启用内容</strong>，运行内嵌的宏并解密评审意见。"],
    [/^Simulated page for (\S+)\.$/, (_, url) => `模拟页面：<code>${esc(url)}</code>`],
    [/^Registered recovery number for (\S+):$/, (_, who) => `<strong>${esc(who)}</strong> 已登记的找回手机号码：`]
  ];
  const BLOCK_TAGS = /^(P|DIV|SPAN|LI|DD|SMALL|LABEL)$/;

  function tr(raw) {
    if (!raw || !/[A-Za-z]/.test(raw)) return null;
    const s = raw.replace(/\s+/g, " ").trim();
    if (Object.prototype.hasOwnProperty.call(DICT, s)) return DICT[s];
    for (const [re, to] of RULES) if (re.test(s)) return s.replace(re, to);
    return null;
  }
  function trBlock(el) {
    if (!BLOCK_TAGS.test(el.nodeName) || !el.firstElementChild || el.childElementCount > 12) return false;
    const text = el.textContent;
    if (text.length > 600 || !/[A-Za-z]/.test(text)) return false;
    const s = text.replace(/\s+/g, " ").trim();
    for (const [re, to] of BLOCKS) if (re.test(s)) { const html = s.replace(re, to); if (el.innerHTML !== html) el.innerHTML = html; return true; }
    return false;
  }
  root.PF_T = (en) => (lang === "zh" ? tr(en) || en : en);

  function toggleButton() {
    const header = document.querySelector(".site-header");
    if (!header || document.querySelector("#lang-toggle")) return;
    const btn = document.createElement("button");
    btn.id = "lang-toggle";
    btn.type = "button";
    btn.className = "reference-button lang-toggle";
    btn.lang = lang === "zh" ? "en" : "zh-Hans";
    btn.textContent = lang === "zh" ? "English" : "中文";
    btn.setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切换到中文");
    btn.addEventListener("click", () => {
      // Switching reloads the page; only offer it outside a running round so no answers are lost.
      if (document.body.dataset.screen === "playing") return;
      try { localStorage.setItem(KEY, lang === "zh" ? "en" : "zh"); } catch (e) {}
      const url = new URL(location.href);
      url.searchParams.set("lang", lang === "zh" ? "en" : "zh");
      location.replace(url.href);
    });
    header.insertBefore(btn, header.querySelector("#open-reference"));
    const sync = () => { btn.hidden = document.body.dataset.screen === "playing"; };
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["data-screen"] });
    sync();
  }

  if (lang !== "zh") {
    document.addEventListener("DOMContentLoaded", toggleButton);
    return;
  }

  document.documentElement.lang = "zh-Hans";
  // Short CJK badges must not break mid-word in the narrow popup header.
  const style = document.createElement("style");
  style.textContent = ".ol-pop-sandbox,.ol-pop-close{white-space:nowrap}";
  document.head.append(style);
  if (root.EMAIL_BANK && root.EMAIL_BANK_ZH) root.EMAIL_BANK_ZH.apply(root.EMAIL_BANK);

  const ATTRS = ["aria-label", "title", "placeholder", "alt"];
  const isGameTitle = node => /^PhishingFishing\.?$/.test((node.parentElement?.closest("h1")?.textContent || "").replace(/\s/g, ""));
  function translateText(node) {
    if (isGameTitle(node)) return; // the "Phishing Fishing" title is the game's name
    const v = node.nodeValue;
    const t = tr(v);
    if (t == null || t === v.trim()) return;
    const lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0];
    node.nodeValue = lead + t + trail;
  }
  function translateEl(el) {
    for (const a of ATTRS) {
      if (!el.hasAttribute(a)) continue;
      const t = tr(el.getAttribute(a));
      if (t != null && t !== el.getAttribute(a)) el.setAttribute(a, t);
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return translateText(root);
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(root.nodeName)) return;
    translateEl(root);
    trBlock(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { if (!/^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.parentNode.nodeName)) translateText(n); }
      else { translateEl(n); trBlock(n); }
    }
  }
  const observer = new MutationObserver(list => {
    for (const m of list) {
      if (m.type === "characterData") translateText(m.target);
      else if (m.type === "attributes") translateEl(m.target);
      else m.addedNodes.forEach(walk);
    }
  });
  function start() {
    const t = tr(document.title);
    if (t) document.title = t;
    toggleButton();
    walk(document.body);
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})(typeof window !== "undefined" ? window : globalThis);
