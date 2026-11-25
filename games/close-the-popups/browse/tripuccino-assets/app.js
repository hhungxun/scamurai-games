/* Tripuccino booking practice. Shared by the standalone site and the Browse scene. */
(() => {
  'use strict';
  const directory = window.TRIPUCCINO_AIRPORT_DIRECTORY || {countries:[],airports:[]};
  const AIRPORTS = [
    {code:'KUL',city:['Kuala Lumpur','吉隆坡'],name:['Kuala Lumpur International','吉隆坡国际机场'],country:'MY'},
    {code:'SZB',city:['Kuala Lumpur','吉隆坡'],name:['Sultan Abdul Aziz Shah','梳邦苏丹阿都阿兹沙机场'],country:'MY'},
    {code:'TPE',city:['Taipei','台北'],name:['Taiwan Taoyuan International','台湾桃园国际机场'],country:'TW'},
    {code:'TSA',city:['Taipei','台北'],name:['Taipei Songshan','台北松山机场'],country:'TW'},
    ...directory.airports
  ];
  const DEFAULT_DATE = '2027-01-23';
  const INITIAL_DATE = '2027-01-26';
  const PROFILES = ['ALEX TAN','JAMIE LIM','ROBIN LEE','SAM WONG'];
  const FARE_ROWS = [
    ['od698','Batik Air Malaysia','OD','OD698','10:00','15:00',300,0,467,'T1','Boeing 737 MAX 8',''],
    ['ak138','AirAsia','AK','AK138','09:20','14:25',305,0,541,'T2','Airbus A320neo',''],
    ['ci722','China Airlines','CI','CI722','14:35','19:15',280,0,764,'T1','Airbus A330-300',''],
    ['jx726','STARLUX Airlines','JX','JX726','16:25','21:45',320,0,782,'T1','Airbus A321neo',''],
    ['br218','EVA Air','BR','BR218','15:25','20:05',280,0,884,'T1','Boeing 777-300ER',''],
    ['mh366','Malaysia Airlines','MH','MH366','09:20','14:10',290,0,1038,'T1','Boeing 737-800',''],
    ['tr471','Scoot','TR','TR471','09:10','17:00',470,1,469,'T2','Airbus A320','Singapore'],
    ['tr475','Scoot','TR','TR475','22:00','05:35',455,1,489,'T2','Airbus A320','Singapore'],
    ['tr485','Scoot','TR','TR485','19:15','05:35',620,1,489,'T2','Airbus A320','Singapore'],
    ['tr477','Scoot','TR','TR477','22:00','11:00',780,1,469,'T2','Airbus A320','Singapore'],
    ['tr473','Scoot','TR','TR473','14:00','17:00',1620,1,472,'T2','Airbus A320','Singapore'],
    ['mf898','Xiamen Airlines','MF','MF898','02:30','10:10',460,1,848,'T1','Boeing 737-800','Xiamen'],
    ['ci722cs','China Airlines','CI','CI722 / MH','09:20','14:10',290,0,1270,'T1','Boeing 737-800','Operated by Malaysia Airlines'],
    ['vn680','Vietnam Airlines','VN','VN680','19:50','21:10',1520,1,747,'T1','Airbus A321','Ho Chi Minh City'],
    ['tr487','Scoot','TR','TR487','19:15','11:00',945,1,469,'T2','Airbus A320','Singapore'],
    ['vn682','Vietnam Airlines','VN','VN682','20:10','11:55',945,1,747,'T1','Airbus A321','Hanoi'],
    ['tr479','Scoot','TR','TR479','22:00','13:10',910,1,469,'T2','Airbus A320','Singapore'],
    ['vj826','VietJet Air','VJ','VJ826','13:35','18:00',1705,1,875,'T2','Airbus A321','Ho Chi Minh City'],
    ['tr467','Scoot','TR','TR467','11:15','05:35',1100,1,489,'T2','Airbus A320','Singapore'],
    ['mf848','Xiamen Airlines','MF','MF848','17:45','10:00',975,1,732,'T1','Boeing 737-800','Fuzhou'],
    ['sq8633','Singapore Airlines','SQ','SQ8633','23:30','13:55',865,1,1325,'T1','Boeing 787','Singapore'],
    ['cz366','China Southern Airlines','CZ','CZ366','14:45','12:25',1300,1,970,'T2','Airbus A320','Shenzhen'],
    ['cx730','Cathay Pacific','CX','CX730','17:50','00:50',420,1,1087,'T1','Airbus A330','Hong Kong'],
    ['vzl21','Thai Vietjet Air','VZ','VZL21','21:30','06:30',540,1,969,'T2','Airbus A320','Bangkok'],
    ['sq125','Singapore Airlines','SQ','SQ125','21:50','11:00',790,1,1157,'T1','Airbus A350','Singapore'],
    ['et638','Ethiopian Airlines + EVA Air','ET','ET638 + BR','23:05','17:50',1125,1,1317,'T1','Boeing 787 / 777','Singapore']
  ];
  const FLIGHTS = FARE_ROWS.map(([id,airline,code,number,dep,arr,minutes,stops,price,terminal,plane,connection]) =>
    ({id,airline,code,number,dep,arr,minutes,stops,price,terminal,plane,connection}));
  const dateValid = value => /^202[67]-\d\d-\d\d$/.test(value || '') && value >= '2026-12-01' && value <= '2027-03-31' && Number.isFinite(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10) === value;
  const clampAdults = value => [1,2,3,4].includes(Number(value)) ? Number(value) : 1;
  const normalizeSearch = value => ({from:AIRPORTS.some(a=>a.code===value.from)?value.from:'SIN',to:AIRPORTS.some(a=>a.code===value.to)?value.to:'HKG',date:dateValid(value.date)?value.date:INITIAL_DATE,adults:clampAdults(value.adults)});
  const dayOffset = date => Math.round((Date.parse(date+'T12:00:00Z')-Date.parse(DEFAULT_DATE+'T12:00:00Z'))/86400000);
  const farePrice = (flight,date) => flight.price + (date===DEFAULT_DATE?0:30+Math.abs(dayOffset(date)*17)%140);
  const routeFlights = search => search.from==='KUL'&&search.to==='TPE'?FLIGHTS.filter(f=>f.id!=='tr473'):search.from==='SZB'&&search.to==='TPE'?FLIGHTS.filter(f=>f.id==='tr473').map(f=>({...f,terminal:''})):[];
  const normalExtras = value => ({bag:[0,20,25].includes(value?.bag)?value.bag:0,seat:value?.seat==='window'?'window':'auto',cover:value?.cover===true});
  const extraPrice = extras => ({0:0,20:85,25:115}[extras.bag])+(extras.seat==='window'?45:0)+(extras.cover?29:0);

  function validOrder(order) {
    if(!order || order.version!==1 || typeof order.id!=='string' || !/^TC-[A-Z0-9-]{6,60}$/.test(order.id) || !dateValid(order.date) || !Number.isInteger(order.adults) || order.adults<1 || order.adults>4 || order.payment!=='paid' || !Number.isFinite(order.at))return false;
    const flight=routeFlights(order).find(f=>f.id===order.flightId);
    if(!flight)return false;
    const extras=normalExtras(order.extras);
    return Boolean(order.extras && order.extras.bag===extras.bag && order.extras.seat===extras.seat && order.extras.cover===extras.cover && [0,1,2,3].includes(order.profile) && ['wallet','card'].includes(order.method) && order.unitPrice===farePrice(flight,order.date) && order.total===(order.unitPrice+extraPrice(extras))*order.adults);
  }
  window.TRIPUCCINO_BOOKING=Object.freeze({validOrder});

  function render(C) {
    const {root,params,t,esc,url,read,write} = C;
    const standalone = document.body.hasAttribute('data-trip-standalone');
    const asset = name => (standalone?'assets/':'tripuccino-assets/')+name;
    const lang = params.get('lang')==='zh'?'zh':'en';
    const locale = lang==='zh'?'zh-CN':'en-GB';
    const search = normalizeSearch(Object.fromEntries(params));
    let currency = read('tc-currency','MYR')==='TWD'?'TWD':'MYR';
    const cash = value => currency==='MYR'?'MYR '+value.toLocaleString('en-MY',{minimumFractionDigits:0,maximumFractionDigits:0}):'TWD '+Math.round(value*7.2).toLocaleString('en-US');
    const dateText = value => new Date(value+'T12:00:00').toLocaleDateString(locale,{weekday:'short',day:'numeric',month:'short',year:'numeric'});
    const shortDate = value => new Date(value+'T12:00:00').toLocaleDateString(locale,{day:'numeric',month:'short'});
    const airport = code => AIRPORTS.find(a=>a.code===code);
    const city = code => airport(code).city[lang==='zh'?1:0];
    const view = params.get('view') || document.body.dataset.tripPage || 'home';
    const href = (next,extra={}) => url('tripuccino.html',{...search,view:next,...extra});
    const canAct = () => window.BROWSE_BOOTH?.canAct()!==false;
    const selected = routeFlights(search).find(f=>f.id===(params.get('f')||params.get('id')));
    const allOrders = () => {
      const stored = read('tc-orders',[]);
      return Array.isArray(stored)?stored.filter(validOrder):[];
    };
    const draftKey = selected?'tc-draft:'+JSON.stringify([search.from,search.to,search.date,search.adults,selected.id,params.get('round')]):'';
    const storedDraft = read(draftKey,null);
    const profile=[0,1,2,3].includes(storedDraft?.profile)?storedDraft.profile:0;
    const draft = {confirmed:storedDraft?.confirmed===true,profile,extras:normalExtras(storedDraft?.extras),method:storedDraft?.method==='card'?'card':'wallet',
      passengerName:typeof storedDraft?.passengerName==='string'?storedDraft.passengerName.slice(0,80):PROFILES[profile],
      contactEmail:typeof storedDraft?.contactEmail==='string'?storedDraft.contactEmail.slice(0,120):'alex.tan@example.com',
      contactPhone:typeof storedDraft?.contactPhone==='string'?storedDraft.contactPhone.slice(0,30):'+60 12 345 6789'};
    const saveDraft = () => storeBooking(draftKey,draft);
    const total = () => (farePrice(selected,search.date)+extraPrice(draft.extras))*search.adults;
    const booked = allOrders().find(o=>o.id===params.get('order'));
    const icon = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;
    const logo = f => `<span class="tc-airline-logo"><img src="${asset('airlines/'+f.code.toLowerCase()+'.webp')}" alt="${esc(f.airline)}"></span>`;
    // Amenities illustrate the sample inventory and follow the supplied flight references.
    const amenitiesByAirline = {
      OD:['clapperboard'], AK:['zap'], CI:['zap','utensils','wifi','clapperboard'],
      JX:['zap','utensils','wifi','clapperboard'], BR:['zap','utensils','wifi','clapperboard'],
      TR:['zap','wifi'], MH:['zap','utensils','wifi','clapperboard']
    };
    const amenityNames = {zap:t('Power','电源'),utensils:t('Meals','餐食'),wifi:t('Wi-Fi','无线网络'),clapperboard:t('Entertainment','机上娱乐')};
    const amenities = f => (amenitiesByAirline[f.code] || []).map(name=>`<span title="${amenityNames[name]}" aria-label="${amenityNames[name]}">${icon(name)}</span>`).join('');
    const duration = f => `${Math.floor(f.minutes/60)}${t('h','小时')} ${f.minutes%60?f.minutes%60+t('m','分'):''}`;
    const nextDay = f => Number(f.arr.slice(0,2))*60+Number(f.arr.slice(3)) < Number(f.dep.slice(0,2))*60+Number(f.dep.slice(3)) || f.minutes>=1440;
    const stopText = f => f.stops?t('1 stop in ','经停 ')+esc(f.connection):t('Nonstop','直飞');
    let returnFocus = null;
    root.innerHTML = `<div class="tc-site">
      <div class="tc-practice">${t('Find your next journey','寻找下一段旅程')}<span>${t('Flights · Hotels · Travel','航班 · 酒店 · 旅行')}</span></div>
      <header class="tc-header"><a class="tc-brand" href="${href('home')}">Tripuccino<span class="tc-brand-dot">.</span></a><nav aria-label="${t('Main navigation','主导航')}"><a class="tc-nav-active" href="${href('home')}">${icon('plane')} ${t('Flights','机票')}</a><button data-action="guide">${t('Attractions & guides','景点与指南')}</button><button data-action="airports">${t('Airport transfers','机场交通')}</button></nav><div class="tc-utilities"><button data-action="currency">${icon('globe-2')} ${currency}</button><a href="${url('tripuccino.html',{...Object.fromEntries(params),lang:lang==='en'?'zh':'en',view})}">${lang==='en'?'中文':'English'}</a><button data-action="help">${t('Customer support','客户支持')}</button><a class="tc-header-bookings" href="${href('orders')}">${icon('ticket')} ${t('My bookings','我的订单')}</a></div></header>
      <div id="tc-content"></div>
      <footer class="tc-footer"><a class="tc-brand" href="${href('home')}">Tripuccino.</a><p>${t('A little planning. A great semester break.','好好计划，放个好假。')}</p><div><button data-action="about">${t('About Tripuccino','关于 Tripuccino')}</button><button data-action="terms">${t('Fare rules & privacy','票价规则与隐私')}</button><button data-action="sources">${t('Photo credits','照片来源')}</button></div><small>${t('Explore more with Tripuccino.','和 Tripuccino 一起探索更多旅程。')}</small></footer>
      <dialog class="tc-dialog"><div class="tc-dialog-heading"><h2 id="tc-dialog-title"></h2><button data-close aria-label="${t('Close','关闭')}">×</button></div><div id="tc-dialog-body"></div></dialog><div class="tc-toast" role="status" aria-live="polite"></div>
    </div>`;
    const site = root.firstElementChild;
    site.classList.add('tc-view-'+view);
    const $ = selector => site.querySelector(selector);
    const $$ = selector => [...site.querySelectorAll(selector)];
    const content = $('#tc-content');
    const dialog = $('.tc-dialog');
    dialog.setAttribute('aria-labelledby','tc-dialog-title');
    function showDialog(title,body) {
      returnFocus = document.activeElement;
      $('#tc-dialog-title').textContent=title;
      $('#tc-dialog-body').innerHTML=body;
      dialog.classList.remove('tc-fare-drawer','tc-airport-dialog');
      dialog.showModal();
      window.lucide?.createIcons({root:site});
    }
    const closeDialog = () => dialog.close();
    $('[data-close]').addEventListener('click',closeDialog);
    dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog();}});
    dialog.addEventListener('close',()=>{
      if(returnFocus?.hasAttribute('aria-expanded')) returnFocus.setAttribute('aria-expanded','false');
      if(returnFocus?.isConnected) returnFocus.focus();
    });
    let picker = null;
    function closePicker(restoreFocus=false) {
      if (!picker) {
        if (dialog.open) closeDialog();
        return;
      }
      const {panel,anchor,reposition,outside,onKey} = picker;
      picker = null;
      anchor.setAttribute('aria-expanded','false');
      panel.remove();
      document.removeEventListener('pointerdown',outside,true);
      document.removeEventListener('keydown',onKey,true);
      window.removeEventListener('scroll',reposition,true);
      window.removeEventListener('resize',reposition);
      if (restoreFocus && anchor.isConnected) anchor.focus();
    }
    function showPicker(anchor,title,body,type) {
      if (picker?.anchor===anchor) {closePicker(true);return false;}
      if (picker) closePicker();
      if (matchMedia('(max-width:760px)').matches) {
        showDialog(title,body);
        anchor.setAttribute('aria-expanded','true');
        if(type==='airport') dialog.classList.add('tc-airport-dialog');
        return true;
      }
      const panel=document.createElement('section');
      panel.className='tc-picker tc-picker-'+type;
      panel.id='tc-search-picker';
      panel.setAttribute('role','dialog');
      panel.setAttribute('aria-label',title);
      panel.innerHTML=`<div class="tc-picker-heading"><h2>${title}</h2><button type="button" data-picker-close aria-label="${t('Close','关闭')}">×</button></div><div class="tc-picker-body">${body}</div>`;
      site.appendChild(panel);
      anchor.setAttribute('aria-expanded','true');
      anchor.setAttribute('aria-controls',panel.id);
      const reposition=()=>{
        const rect=anchor.getBoundingClientRect();
        const width=Math.min(type==='airport'?520:370,window.innerWidth-24);
        panel.style.width=width+'px';
        panel.style.left=Math.max(12,Math.min(rect.left,window.innerWidth-width-12))+'px';
        panel.style.top=(rect.bottom+8)+'px';
        panel.style.maxHeight=Math.max(80,window.innerHeight-rect.bottom-20)+'px';
      };
      const outside=event=>{if(!panel.contains(event.target)&&!anchor.contains(event.target))closePicker();};
      const onKey=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closePicker(true);}};
      picker={panel,anchor,reposition,outside,onKey};
      panel.querySelector('[data-picker-close]').addEventListener('click',()=>closePicker(true));
      document.addEventListener('pointerdown',outside,true);
      document.addEventListener('keydown',onKey,true);
      window.addEventListener('scroll',reposition,true);
      window.addEventListener('resize',reposition);
      reposition();
      return true;
    }
    const toast = message => {const el=$('.tc-toast');el.textContent=message;el.classList.add('tc-visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('tc-visible'),3200);};
    function storeBooking(key,value) {
      try {
        sessionStorage.setItem('tc-storage-check','1');
        sessionStorage.removeItem('tc-storage-check');
        if(write(key,value)!==false && JSON.stringify(read(key,null))===JSON.stringify(value))return true;
      } catch {}
      toast(t('Booking could not be saved. Allow browser storage, then try again.','预订未能保存，请允许浏览器存储后重试。'));
      return false;
    }
    function searchForm(compact=false) {
      return `<form class="tc-search ${compact?'tc-search-compact':''}" id="tc-search"><div class="tc-search-meta"><b>${t('One-way','单程')}</b><span>${t('Economy','经济舱')}</span><span>${t('Taxes included','含税总价')}</span></div><div class="tc-search-fields"><button type="button" class="tc-field" data-airport="from" aria-haspopup="dialog" aria-expanded="false"><small>${t('From','出发地')}</small><strong data-from>${city(search.from)} <em>${search.from}</em></strong></button><button type="button" class="tc-swap" data-action="swap" aria-label="${t('Swap airports','交换机场')}">⇄</button><button type="button" class="tc-field" data-airport="to" aria-haspopup="dialog" aria-expanded="false"><small>${t('To','目的地')}</small><strong data-to>${city(search.to)} <em>${search.to}</em></strong></button><button type="button" class="tc-field" data-action="calendar" aria-haspopup="dialog" aria-expanded="false"><small>${t('Departure','出发日期')}</small><strong data-date>${shortDate(search.date)}<em> ${search.date.slice(0,4)}</em></strong></button><button type="button" class="tc-field" data-action="travellers"><small>${t('Travellers & cabin','乘客与舱位')}</small><strong data-adults>${search.adults} ${t(search.adults===1?'adult':'adults','位成人')}<em> ${t('Economy','经济舱')}</em></strong></button><button type="submit" class="tc-primary tc-search-submit">${t('Search flights','搜索航班')} <span aria-hidden="true">↗</span></button></div></form>`;
    }
    function flightLine(f,allowDetails=false) {
      return `<div class="tc-flight-route"><div><strong>${f.dep}</strong><span>${esc(search.from)} ${f.terminal}</span></div><div class="tc-flight-path"><span>${duration(f)}</span><div>✈</div><small>${stopText(f)}</small></div><div><strong>${f.arr}${nextDay(f)?'<sup>+1</sup>':''}</strong><span>${esc(search.to)} T1</span></div></div>${allowDetails?`<details class="tc-flight-details"><summary>${t('Flight details & baggage','航班详情与行李')}</summary><p>${esc(f.number)} · ${esc(f.plane)} · ${t('Economy','经济舱')}</p><p>${esc(airport(search.from).name[lang==='zh'?1:0])} ${f.terminal} → ${esc(airport(search.to).name[lang==='zh'?1:0])} T1</p><p>${t('All times are local (UTC+8). Cabin baggage 7 kg included. Checked baggage optional. Basic fare is non-refundable.','均为当地时间（UTC+8）。包含 7 kg 手提行李，托运行李可选。基础票价不可退。')}</p></details>`:''}`;
    }
    function home() {
      const services=[['plane','Flights','机票','flights'],['hotel','Hotels & homes','酒店与民宿','stays'],['train-front','Trains','铁路','rail'],['car-front','Cars','租车','cars'],['ferris-wheel','Attractions & tours','景点与游览','guide'],['luggage','Flight + hotel','机票与住宿','stays']];
      const navigation=services.map(([image,en,zh,action])=>`<button data-action="${action}" class="${action==='flights'?'tc-service-selected':''}">${icon(image)}<span>${t(en,zh)}</span></button>`).join('');
      const offers=['ci722','tr471','ak138','od698'].map(id=>FLIGHTS.find(f=>f.id===id));
      content.innerHTML=`<div class="tc-home-layout"><aside class="tc-home-nav"><div>${navigation}</div><hr><button data-action="guide">${icon('map')} ${t('Taiwan travel guide','台湾旅行指南')}</button><button data-action="baggage">${icon('briefcase')} ${t('Baggage allowance','行李额度')}</button><a href="${href('orders')}">${icon('tickets')} ${t('My bookings','我的订单')}</a><button data-action="help">${icon('headset')} ${t('Support centre','帮助中心')}</button></aside><div class="tc-home-body"><section class="tc-flight-hero"><div class="tc-hero-heading"><h1>${t('Your Taiwan break starts here','从这里，出发去台湾')}</h1><p><span>${icon('badge-check')}${t('Taxes included','票价含税')}</span><span>${icon('plane-takeoff')}${t('Compare flights to Taipei','比较飞往台北的航班')}</span><span>${icon('headphones')}${t('Plan your trip with confidence','安心安排你的旅程')}</span></p></div><div class="tc-portal-search"><div class="tc-service-tabs">${navigation}</div>${searchForm()}<div class="tc-search-bottom"><span>${icon('shield-check')}${t('Clear prices, optional extras and a booking you can review.','清楚的票价、可选的附加服务，预订前轻松核对。')}</span><button data-action="fare-note">${t('Fare information','票价说明')} ›</button></div></div></section><main class="tc-home-main"><section><div class="tc-section-heading"><h2>${t('Popular flights to Taipei','飞往台北的热门航班')}</h2><a href="${href('flights',{from:'KUL',to:'TPE',date:INITIAL_DATE})}">${t('View all flights','查看全部航班')} ›</a></div><div class="tc-offer-grid">${offers.map(f=>`<a href="${href('details',{from:'KUL',to:'TPE',f:f.id,date:INITIAL_DATE})}" class="tc-offer"><div>${logo(f)}<span>${esc(f.airline)}</span></div><h3>${t('Kuala Lumpur','吉隆坡')} <span>→</span> ${t('Taipei','台北')}</h3><p>${shortDate(INITIAL_DATE)} · ${stopText(f)}</p><strong>${cash(farePrice(f,INITIAL_DATE))} <small>${t('from','起')}</small></strong><span class="tc-offer-link">${t('View flight','查看航班')} ›</span></a>`).join('')}</div></section><section class="tc-taiwan-section"><div class="tc-section-heading"><h2>${t('A little Taiwan inspiration','台湾旅行灵感')}</h2><button class="tc-text-button" data-action="guide">${t('Explore Taipei','探索台北')} ›</button></div><div class="tc-inspiration-grid"><button data-action="guide"><img src="${asset('taipei.jpg')}" alt="${t('Liberty Square, Taipei','台北自由广场')}"><div><h3>${t('An afternoon in Taipei','台北的一个午后')}</h3><p>${t('Liberty Square, local streets and a slower start.','自由广场、街巷与慢慢展开的旅行。')}</p></div></button><button data-action="guide"><img src="${asset('market.jpg')}" alt="${t('Shilin Night Market','士林夜市')}"><div><h3>${t('Save some room for the night market','给夜市留点胃口')}</h3><p>${t('Make your first evening a food adventure.','用一趟小吃之旅开启台北的第一晚。')}</p></div></button></div></section></main></div></div>`;
      bindSearch();
    }
    function bindSearch() {
      $('#tc-search').addEventListener('submit',event=>{event.preventDefault();if(search.from===search.to){toast(t('Choose different departure and arrival airports.','出发和抵达机场需不同。'));return;}location.href=href('flights');});
      $$('[data-airport]').forEach(button=>button.addEventListener('click',()=>chooseAirport(button.dataset.airport)));
    }
    function refreshSearch() {
      $('[data-from]').innerHTML=`${city(search.from)} <em>${search.from}</em>`;
      $('[data-to]').innerHTML=`${city(search.to)} <em>${search.to}</em>`;
      $('[data-date]').innerHTML=`${shortDate(search.date)}<em> ${search.date.slice(0,4)}</em>`;
      $('[data-adults]').innerHTML=`${search.adults} ${t('adult'+(search.adults>1?'s':''),'位成人')}<em> ${t('Economy','经济舱')}</em>`;
    }
    function chooseAirport(field) {
      const regions = [
        ['AS',t('Asia','亚洲')], ['EU',t('Europe','欧洲')], ['NA',t('North America','北美洲')],
        ['SA',t('South America','南美洲')], ['AF',t('Africa','非洲')], ['OC',t('Oceania','大洋洲')]
      ];
      let region='AS', selectedCountry=null;
      const countryName = country => country.name[lang==='zh'?1:0];
      const airportButton = a => `<button type="button" class="tc-airport-option" data-code="${esc(a.code)}"><span><b>${esc(a.city[lang==='zh'?1:0])}</b><small>${esc(a.name[lang==='zh'?1:0])}</small></span><strong>${esc(a.code)}</strong></button>`;
      const anchor=$(`[data-airport="${field}"]`);
      if (!showPicker(anchor,t(field==='from'?'Where are you flying from?':'Where are you going?',field==='from'?'从哪里出发？':'要去哪里？'),`<label class="tc-airport-search"><span>${t('City, airport or country','城市、机场或国家和地区')}</span><input type="search" id="tc-airport-query" placeholder="${t('Search city, airport or country','搜索城市、机场或国家和地区')}" autocomplete="off"></label><div id="tc-airport-browser"></div>`,'airport')) return;
      const query=$('#tc-airport-query'),browser=$('#tc-airport-browser');
      function paint() {
        const term=query.value.trim().toLocaleLowerCase();
        if(term) {
          const matches=AIRPORTS.filter(a=>{const country=directory.countries.find(c=>c.code===a.country);return [a.code,...a.city,...a.name,...(country?.name||[])].some(value=>value.toLocaleLowerCase().includes(term));});
          browser.innerHTML=`<p class="tc-airport-caption">${matches.length} ${t('airports found','个机场')}</p><div class="tc-airport-results">${matches.map(airportButton).join('') || `<p class="tc-airport-empty">${t('No airports found. Try another city or airport code.','没有找到机场，请尝试其他城市或机场代码。')}</p>`}</div>`;
          return;
        }
        const country=directory.countries.find(c=>c.code===selectedCountry);
        const tabs=`<div class="tc-region-tabs" role="group" aria-label="${t('Browse by continent','按大洲浏览')}">${regions.map(([id,label])=>`<button type="button" data-region="${id}" aria-pressed="${region===id}">${label}</button>`).join('')}</div>`;
        if(country) {
          const airports=AIRPORTS.filter(a=>a.country===country.code);
          browser.innerHTML=tabs+`<div class="tc-airport-country-head"><button type="button" data-country-back>← ${t('Countries and regions','国家和地区')}</button><h3>${esc(countryName(country))}</h3></div><div class="tc-airport-results">${airports.map(airportButton).join('')}</div>`;
        } else {
          const countries=directory.countries.filter(c=>c.region===region).sort((a,b)=>countryName(a).localeCompare(countryName(b),locale));
          browser.innerHTML=tabs+`<p class="tc-airport-caption">${t('Countries and regions','国家和地区')} <span>${countries.length}</span></p><div class="tc-country-grid">${countries.map(c=>`<button type="button" data-country="${esc(c.code)}"><span>${esc(countryName(c))}</span><span aria-hidden="true">›</span></button>`).join('')}</div>`;
        }
      }
      paint();
      query.addEventListener('input',paint);
      browser.addEventListener('click',event=>{
        const code=event.target.closest('[data-code]');
        if(code){search[field]=code.dataset.code;refreshSearch();closePicker(true);return;}
        const tab=event.target.closest('[data-region]');
        if(tab){region=tab.dataset.region;selectedCountry=null;paint();return;}
        const country=event.target.closest('[data-country]');
        if(country){selectedCountry=country.dataset.country;paint();return;}
        if(event.target.closest('[data-country-back]')){selectedCountry=null;paint();}
      });
      if(picker) query.focus({preventScroll:true});
    }
    function calendar() {
      let month=search.date.slice(0,7);
      if (!showPicker($('[data-action="calendar"]'),t('Choose departure date','选择出发日期'),'<div id="tc-calendar"></div>','calendar')) return;
      function paint() {
        const first=new Date(month+'-01T12:00:00'),count=new Date(first.getFullYear(),first.getMonth()+1,0).getDate(),padding=(first.getDay()+6)%7;
        const weekdays=t(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],['一','二','三','四','五','六','日']);
        $('#tc-calendar').innerHTML=`<div class="tc-calendar-head"><button data-month="-1" aria-label="${t('Previous month','上个月')}" ${month==='2026-12'?'disabled':''}>‹</button><b>${first.toLocaleDateString(locale,{month:'long',year:'numeric'})}</b><button data-month="1" aria-label="${t('Next month','下个月')}" ${month==='2027-03'?'disabled':''}>›</button></div><div class="tc-calendar-grid">${weekdays.map(d=>`<small>${d}</small>`).join('')}${'<span></span>'.repeat(padding)}${Array.from({length:count},(_,i)=>{const date=month+'-'+String(i+1).padStart(2,'0');return `<button data-date="${date}" class="${date===search.date?'tc-date-selected':''}" aria-label="${dateText(date)}" aria-pressed="${date===search.date}">${i+1}<small>${routeFlights(search).length?cash(Math.min(...routeFlights(search).map(f=>farePrice(f,date)))).replace(/MYR |TWD /,''):'—'}</small></button>`;}).join('')}</div><p class="tc-muted">${routeFlights(search).length?t('Fares per adult, including taxes.','每位成人的含税票价。'):t('Select an available route to see fares.','选择有航班的路线后可查看票价。')}</p>`;
      }
      paint();
      if(picker) $('#tc-calendar .tc-date-selected')?.focus({preventScroll:true});
      $('#tc-calendar').addEventListener('click',event=>{const date=event.target.closest('[data-date]');if(date){search.date=date.dataset.date;refreshSearch();closePicker(true);return;}const button=event.target.closest('[data-month]');if(button){const date=new Date(month+'-01T12:00:00');date.setMonth(date.getMonth()+Number(button.dataset.month));month=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0');paint();}});
    }
    function travellers() {
      let count=search.adults;
      showDialog(t('Travellers & cabin','乘客与舱位'),`<p>${t('Adults, age 12 and over','成人，12 岁及以上')}</p><div class="tc-stepper"><button data-count="-1" aria-label="${t('Remove adult','减少成人')}">−</button><b id="tc-pax-count">${count}</b><button data-count="1" aria-label="${t('Add adult','增加成人')}">+</button></div><p>${t('Cabin','舱位')} <b>${t('Economy','经济舱')}</b></p><button class="tc-primary" data-pax-done>${t('Done','完成')}</button>`);
      const paint=()=>{$('#tc-pax-count').textContent=count;$('[data-count="-1"]').disabled=count===1;$('[data-count="1"]').disabled=count===4;};paint();
      $$('[data-count]').forEach(button=>button.addEventListener('click',()=>{count=Math.max(1,Math.min(4,count+Number(button.dataset.count)));paint();}));
      $('[data-pax-done]').addEventListener('click',()=>{search.adults=count;refreshSearch();closeDialog();});
    }
    function flights() {
      const available=routeFlights(search),saved=read('tc-filters:'+JSON.stringify(search),{});
      let filters={sort:['best','price','fast','early'].includes(params.get('sort'))?params.get('sort'):['best','price','fast','early'].includes(saved?.sort)?saved.sort:'best',nonstop:saved?.nonstop===true,max:Number.isFinite(saved?.max)?Math.max(400,Math.min(1600,saved.max)):1600,airline:typeof saved?.airline==='string'?saved.airline:'all',time:['all','morning','afternoon','evening'].includes(saved?.time)?saved.time:'all'};
      content.innerHTML=`<div class="tc-search-band"><div class="tc-container">${searchForm(true)}</div></div><main class="tc-container tc-results"><div class="tc-results-heading"><div><p class="tc-eyebrow">${t('ONE-WAY FLIGHTS','单程航班')}</p><h1>${city(search.from)} <span>→</span> ${city(search.to)}</h1><p>${dateText(search.date)} · ${search.adults} ${t('adult'+(search.adults>1?'s':''),'位成人')} · ${t('Economy','经济舱')}</p></div><button class="tc-text-button" data-action="fare-note">${t('How prices work','票价说明')} ⓘ</button></div><div class="tc-results-layout"><aside><details class="tc-filter-panel" open><summary>${t('Filters','筛选')} <span>☷</span></summary><button class="tc-text-button" data-reset>${t('Reset all','重置全部')}</button><fieldset><legend>${t('Stops','中转次数')}</legend><label class="tc-check"><input type="checkbox" id="tc-nonstop" ${filters.nonstop?'checked':''}>${t('Nonstop only','仅直飞')}</label></fieldset><fieldset><legend>${t('Price per adult','每位成人价格')}</legend><label for="tc-budget">${t('Up to','最高')} <b id="tc-budget-value">${cash(filters.max)}</b></label><input id="tc-budget" type="range" min="400" max="1600" step="1" value="${filters.max}"></fieldset><fieldset><legend>${t('Airline','航空公司')}</legend><select id="tc-airline"><option value="all">${t('All airlines','全部航空公司')}</option>${[...new Set(available.map(f=>f.airline))].map(a=>`<option ${filters.airline===a?'selected':''}>${esc(a)}</option>`).join('')}</select></fieldset><fieldset><legend>${t('Departure time','起飞时段')}</legend><select id="tc-time">${[['all',t('Any time','不限时间')],['morning','00:00 – 11:59'],['afternoon','12:00 – 17:59'],['evening','18:00 – 23:59']].map(([value,label])=>`<option value="${value}" ${filters.time===value?'selected':''}>${label}</option>`).join('')}</select></fieldset></details><div class="tc-filter-help"><b>${t('Compare the whole journey','看看完整旅程')}</b><p>${t('A lower fare can include a long connection. Check the airports, duration and baggage before choosing.','便宜机票可能需要长时间中转，选择前核对机场、总时长与行李。')}</p></div></aside><section class="tc-result-main"><div class="tc-date-strip">${Array.from({length:7},(_,i)=>{const date=new Date(search.date+'T12:00:00');date.setDate(date.getDate()+i-3);const value=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');return dateValid(value)?`<a class="${i===3?'tc-date-active':''}" href="${href('flights',{date:value})}">${shortDate(value)}<strong>${available.length?cash(farePrice(available[0],value)):'·'}</strong></a>`:`<span class="tc-date-unavailable">${shortDate(value)}<strong>·</strong></span>`;}).join('')}</div><div class="tc-sortbar" role="group" aria-label="${t('Sort flights','航班排序')}">${[['best',t('Recommended','推荐')],['price',t('Cheapest','最低价')],['fast',t('Fastest','最快')],['early',t('Earliest','最早起飞')]].map(([sort,label])=>`<button data-sort="${sort}" aria-pressed="${filters.sort===sort}"><b>${label}</b><small>${sort==='price'?t('Total fare, low to high','按含税总价从低到高'):sort==='fast'?t('Shortest journey','总用时最短'):sort==='early'?t('Departure time','按起飞时间'):t('Direct flights first','优先直飞')}</small></button>`).join('')}</div><p class="tc-result-count" id="tc-flight-count" aria-live="polite"></p><div id="tc-flight-list"></div><p class="tc-list-note">${t('All fares include taxes and fees for one adult. The total for your group is shown before checkout.','每位成人的票价均含税费。结算前会显示同行乘客的总价。')}</p></section></div></main>`;
      bindSearch();
      function paint() {
        const list=available.filter(f=>(!filters.nonstop||f.stops===0)&&farePrice(f,search.date)<=filters.max&&(filters.airline==='all'||f.airline===filters.airline)&&(filters.time==='all'||(Number(f.dep.slice(0,2))<12?'morning':Number(f.dep.slice(0,2))<18?'afternoon':'evening')===filters.time));
        const compare={price:(a,b)=>farePrice(a,search.date)-farePrice(b,search.date)||a.minutes-b.minutes,fast:(a,b)=>a.minutes-b.minutes||a.price-b.price,early:(a,b)=>a.dep.localeCompare(b.dep),best:(a,b)=>a.stops-b.stops||a.dep.localeCompare(b.dep)||a.price-b.price};list.sort(compare[filters.sort]);
        $('#tc-flight-count').textContent=`${list.length} ${t('flights found','个航班')} · ${t('Prices include taxes','价格已含税')}`;
        $('#tc-flight-list').innerHTML=list.map(f=>`<article class="tc-flight-card" data-flight="${f.id}"><div class="tc-airline">${logo(f)}<div><b>${esc(f.airline)}</b><small>${esc(f.number)} · ${t('Economy','经济舱')}</small><span class="tc-amenities" aria-label="${t('Onboard facilities','机上设施')}">${amenities(f)}</span></div>${f.id==='od698'&&filters.sort==='price'?`<span class="tc-lowest">${t('Lowest fare','最低票价')}</span>`:''}</div><div class="tc-flight-body"><div>${flightLine(f,true)}</div><div class="tc-flight-price"><small>${t('Per adult, incl. taxes','每位成人，含税')}</small><strong>${cash(farePrice(f,search.date))}</strong>${search.adults>1?`<small>${t('Group total','同行总价')} ${cash(farePrice(f,search.date)*search.adults)}</small>`:''}<a class="tc-primary" href="${href('details',{f:f.id})}" data-select="${f.id}">${t('Select','选择')} ›</a></div></div></article>`).join('')||`<div class="tc-empty"><h2>${t('No flights match this search','没有符合条件的航班')}</h2><p>${available.length?t('Try a higher budget or clear your filters.','试试提高预算或清除筛选条件。'):t('No flights are available for this route. Try Kuala Lumpur (KUL or SZB) to Taoyuan (TPE).','此路线暂无航班。试试吉隆坡 KUL／梳邦 SZB 至桃园 TPE。')}</p><button class="tc-secondary" data-clear>${t('Clear filters','清除筛选')}</button></div>`;
        window.lucide?.createIcons({root:site});
        $$('[data-sort]').forEach(button=>button.setAttribute('aria-pressed',String(filters.sort===button.dataset.sort)));
        write('tc-filters:'+JSON.stringify(search),filters);
        $('[data-clear]')?.addEventListener('click',reset);
      }
      function reset(){filters={sort:'best',nonstop:false,max:1600,airline:'all',time:'all'};$('#tc-nonstop').checked=false;$('#tc-budget').value=1600;$('#tc-budget-value').textContent=cash(1600);$('#tc-airline').value='all';$('#tc-time').value='all';paint();}
      $('[data-reset]').addEventListener('click',reset);
      $('#tc-nonstop').addEventListener('change',event=>{filters.nonstop=event.target.checked;paint();});
      $('#tc-budget').addEventListener('input',event=>{filters.max=Number(event.target.value);$('#tc-budget-value').textContent=cash(filters.max);paint();});
      $('#tc-airline').addEventListener('change',event=>{filters.airline=event.target.value;paint();});
      $('#tc-time').addEventListener('change',event=>{filters.time=event.target.value;paint();});
      $$('[data-sort]').forEach(button=>button.addEventListener('click',()=>{filters.sort=button.dataset.sort;paint();}));paint();
    }
    function chooseFare(id) {
      const f=routeFlights(search).find(f=>f.id===id);
      if(!f)return;
      const bundles=[{id:'basic',name:t('Economy Basic','基础经济舱'),bag:0,seat:'auto',price:0},{id:'baggage',name:t('Economy + baggage','经济舱与托运行李'),bag:20,seat:'auto',price:85},{id:'comfort',name:t('Baggage + preferred seat','行李与座位偏好'),bag:20,seat:'window',price:130}];
      showDialog(t('Choose your fare','选择票价'),`<div class="tc-fare-route">${logo(f)}<div><b>${city(search.from)} (${search.from}) → ${city(search.to)} (${search.to})</b><p>${dateText(search.date)} · ${f.dep}–${f.arr} · ${stopText(f)}</p></div></div><div class="tc-fare-area"><h3>${t('Select a fare','选择票价')}</h3><p>${t('Compare baggage and seat options before continuing.','继续前比较行李及座位选项。')}</p><div class="tc-fare-options">${bundles.map(bundle=>`<article class="tc-fare-option"><h3>${bundle.name}</h3><strong>${cash(farePrice(f,search.date)+bundle.price)}</strong><small>${t('Per adult, taxes included','每位成人，含税')}</small>${bundle.price?`<span class="tc-bundle-extra">${t('Includes extras','包含附加服务')} +${cash(bundle.price)}</span>`:`<span class="tc-bundle-extra">${t('Lowest total fare','最低总价')}</span>`}<dl><dt>${t('Baggage','行李')}</dt><dd>${icon('check')} ${t('Personal item and 7 kg cabin bag','随身物品与 7 kg 手提行李')}</dd><dd>${bundle.bag?icon('check')+'20 kg '+t('checked baggage','托运行李'):icon('x')+t('No checked baggage','无托运行李')}</dd><dt>${t('Seat','座位')}</dt><dd>${bundle.seat==='window'?t('Window preference','靠窗偏好'):t('Allocated automatically','自动分配')}</dd><dt>${t('Fare rules','票价规则')}</dt><dd>${t('Non-refundable basic ticket','基础机票不可退')}</dd></dl><button class="tc-primary" data-bundle="${bundle.id}">${t('Select','选择')} ›</button></article>`).join('')}</div></div>`);
      dialog.classList.add('tc-fare-drawer');
      $$('[data-bundle]').forEach(button=>button.addEventListener('click',()=>{
        if(!canAct())return;
        const bundle=bundles.find(b=>b.id===button.dataset.bundle),key='tc-draft:'+JSON.stringify([search.from,search.to,search.date,search.adults,f.id,params.get('round')]);
        if(storeBooking(key,{confirmed:false,profile:0,extras:{bag:bundle.bag,seat:bundle.seat,cover:false},method:'wallet'}))location.href=href('details',{f:f.id});
      }));
    }
    function summary(f=selected,extras=draft.extras,adults=search.adults) {
      const price=farePrice(f,search.date),addon=extraPrice(extras)*adults;
      return `<aside class="tc-booking-summary"><h2>${t('Price details','费用明细')}</h2><div><span>${t('Base fare','基础票价')} × ${adults}</span><b>${cash((price-92)*adults)}</b></div><div><span>${t('Taxes & airport fees','税费与机场费')}</span><b>${cash(92*adults)}</b></div><div><span>${t('Optional extras','可选附加服务')}</span><b>${cash(addon)}</b></div><div class="tc-summary-baggage"><span>${t('Cabin baggage','手提行李')}</span><b>7 kg ${t('included','已包含')}</b></div><div class="tc-summary-baggage"><span>${t('Checked baggage','托运行李')}</span><b>${extras.bag?extras.bag+' kg':t('Not included','未包含')}</b></div><div class="tc-summary-total"><span>${t('Total','总价')} <small>${adults} ${t('adult'+(adults>1?'s':''),'位成人')}</small></span><strong data-total>${cash((price+extraPrice(extras))*adults)}</strong></div><p>${t('All taxes included. Optional extras are added only when you select them.','已包含全部税费，仅在你主动选择时增加附加服务费。')}</p><span class="tc-simulation-note">${t('Game booking · no real payment','游戏订单 · 无实际付款')}</span></aside>`;
    }
    function checkout() {
      if(!selected){content.innerHTML=`<main class="tc-container tc-empty"><h1>${t('Choose a flight first','请先选择航班')}</h1><p>${t('This flight is unavailable for the selected route.','此航班不适用于所选路线。')}</p><a class="tc-primary" href="${href('flights')}">${t('Back to results','返回搜索结果')}</a></main>`;return;}
      let step = ['details','extras','payment'].includes(view)?view:'details';
      if(step!=='details'&&!draft.confirmed)step='details';
      const steps=[['details',t('Travellers','乘客')],['extras',t('Extras','附加服务')],['payment',t('Payment','付款')]];
      content.innerHTML=`<main class="tc-container tc-booking"><a class="tc-back" href="${href('flights')}">← ${t('All flights','全部航班')}</a><nav class="tc-progress" aria-label="${t('Booking steps','预订步骤')}">${steps.map(([name,label],i)=>`<a href="${href(name,{f:selected.id})}" class="${name===step?'tc-step-current':''}" ${name===step?'aria-current="step"':''}><span>${i+1}</span>${label}</a>`).join('')}</nav><div class="tc-booking-flight"><div class="tc-airline">${logo(selected)}<b>${esc(selected.airline)}</b><span>${esc(selected.number)}</span></div><div class="tc-booking-route"><div><h1>${city(search.from)} → ${city(search.to)}</h1><p>${dateText(search.date)} · ${t('One-way','单程')} · ${search.adults} ${t('adult'+(search.adults>1?'s':''),'位成人')}</p></div>${flightLine(selected)}</div></div><div class="tc-booking-grid"><div id="tc-booking-form"></div><div id="tc-summary">${summary()}</div></div></main>`;
      const form=$('#tc-booking-form');
      if(step==='details') {
        form.innerHTML=`<form id="tc-traveller-form" class="tc-panel"><p class="tc-eyebrow">${t('TRAVELLER DETAILS','乘客资料')}</p><h2>${t('Who’s travelling?','谁将出行？')}</h2><p class="tc-muted">${t('Check the passenger and contact details before continuing.','继续之前，请核对乘客和联系资料。')}</p><div class="tc-traveller-fields"><label class="tc-input-label" for="tc-passenger-name">${t('Passenger name','乘客姓名')}<input id="tc-passenger-name" maxlength="80" value="${esc(draft.passengerName)}" required autocomplete="off"></label><label class="tc-input-label" for="tc-contact-email">${t('Email address','电子邮箱')}<input id="tc-contact-email" type="email" maxlength="120" value="${esc(draft.contactEmail)}" required autocomplete="off"></label><label class="tc-input-label" for="tc-contact-phone">${t('Phone number','联系电话')}<input id="tc-contact-phone" type="tel" maxlength="30" value="${esc(draft.contactPhone)}" required autocomplete="off"></label></div><p class="tc-contact-note">${t('Contact details are stored in this browser tab.','联系资料保存在当前浏览器标签页中。')}</p>${search.adults>1?`<p class="tc-contact-note">${t('Additional passengers','其他乘客')} · ${PROFILES.filter((_,i)=>i!==draft.profile).slice(0,search.adults-1).join(', ')}</p>`:''}<label class="tc-check tc-consent"><input type="checkbox" id="tc-passenger-confirm" required ${draft.confirmed?'checked':''}>${t('I confirm the passenger and contact details.','我已确认乘客和联系资料。')}</label><button type="submit" class="tc-primary tc-wide">${t('Continue to extras','继续选择附加服务')} →</button></form>`;
        $('#tc-traveller-form').addEventListener('input',event=>{
          if(event.target.id==='tc-passenger-confirm')return;
          draft.passengerName=$('#tc-passenger-name').value;
          draft.contactEmail=$('#tc-contact-email').value;
          draft.contactPhone=$('#tc-contact-phone').value;
          draft.confirmed=false;
          $('#tc-passenger-confirm').checked=false;
          saveDraft();
        });
        $('#tc-traveller-form').addEventListener('submit',event=>{
          event.preventDefault();if(!canAct())return;
          draft.passengerName=$('#tc-passenger-name').value.trim();
          draft.contactEmail=$('#tc-contact-email').value.trim();
          draft.contactPhone=$('#tc-contact-phone').value.trim();
          if(!draft.passengerName || !draft.contactEmail || !draft.contactPhone){toast(t('Please complete the passenger and contact details.','请填写乘客与联系资料。'));return;}
          draft.confirmed=true;if(saveDraft())location.href=href('extras',{f:selected.id});
        });
      } else if(step==='extras') {
        form.innerHTML=`<form id="tc-extras-form"><section class="tc-panel"><p class="tc-eyebrow">${t('MAKE IT YOUR TRIP','按你的需要出发')}</p><h2>${t('Just the extras you need.','只选你需要的服务。')}</h2><p class="tc-muted">${t('Your ticket includes 7 kg cabin baggage. All choices below are optional, priced per adult.','机票包含 7 kg 手提行李。以下服务均为可选，价格按每位成人计算。')}</p><fieldset class="tc-extra-options"><legend>${t('Checked baggage','托运行李')}</legend>${[[0,t('Travel light','轻装出发'),0],[20,'20 kg',85],[25,'25 kg',115]].map(([kg,label,price])=>`<label class="tc-extra-choice"><input type="radio" name="bag" value="${kg}" ${draft.extras.bag===kg?'checked':''}><span><b>${label}</b><small>${kg?t('Checked bag per adult','每位成人托运行李'):t('Cabin baggage only','仅手提行李')}</small></span><strong>${price?'+'+cash(price):t('Included','已包含')}</strong></label>`).join('')}</fieldset><fieldset class="tc-extra-options"><legend>${t('Seat preference','座位偏好')}</legend>${[['auto',t('Automatic allocation','自动分配座位'),0],['window',t('Window preference','靠窗偏好'),45]].map(([value,label,price])=>`<label class="tc-extra-choice"><input type="radio" name="seat" value="${value}" ${draft.extras.seat===value?'checked':''}><span><b>${label}</b></span><strong>${price?'+'+cash(price):t('Free','免费')}</strong></label>`).join('')}</fieldset><label class="tc-extra-choice"><input type="checkbox" name="cover" ${draft.extras.cover?'checked':''}><span><b>${t('Travel cover','旅行保障')}</b><small>${t('View the coverage summary','查看保障摘要')}</small></span><strong>+${cash(29)}</strong></label><button type="button" class="tc-text-button" data-action="cover">${t('View coverage','查看保障内容')}</button></section><button type="submit" class="tc-primary tc-wide">${t('Continue to payment','继续付款')} →</button></form>`;
        $('#tc-extras-form').addEventListener('change',()=>{if(!canAct())return;draft.extras=normalExtras({bag:Number($('input[name="bag"]:checked').value),seat:$('input[name="seat"]:checked').value,cover:$('input[name="cover"]').checked});saveDraft();$('#tc-summary').innerHTML=summary();});
        $('#tc-extras-form').addEventListener('submit',event=>{event.preventDefault();if(canAct()&&saveDraft())location.href=href('payment',{f:selected.id});});
      } else {
        const checkoutRecord={...search,flightId:selected.id,unitPrice:farePrice(selected,search.date),total:total(),extras:draft.extras,roundId:params.get('round')||null,at:Date.now()};
        write('tc-checkout',checkoutRecord);
        form.innerHTML=`<form id="tc-payment-form" class="tc-panel"><p class="tc-eyebrow">${t('ONE LAST THING','最后一步')}</p><h2>${t('Review and pay.','核对订单并付款。')}</h2><div class="tc-payment-review"><b>${esc(draft.passengerName)}${search.adults>1?' + '+(search.adults-1):''}</b><p>${search.from} → ${search.to} · ${dateText(search.date)}</p><p>${selected.dep} → ${selected.arr}${nextDay(selected)?' (+1)':''} · ${esc(selected.number)}</p><a href="${href('details',{f:selected.id})}">${t('Edit travellers','修改乘客')}</a> · <a href="${href('extras',{f:selected.id})}">${t('Edit extras','修改附加服务')}</a></div><fieldset class="tc-extra-options"><legend>${t('Payment method','付款方式')}</legend><label class="tc-extra-choice"><input type="radio" name="method" value="wallet" ${draft.method==='wallet'?'checked':''}><span><b>${t('Game wallet','游戏钱包')}</b><small>${t('Available balance','可用余额')} ${cash(10000)}</small></span><strong>TC</strong></label><label class="tc-extra-choice"><input type="radio" name="method" value="card" ${draft.method==='card'?'checked':''}><span><b>${t('Game card','游戏卡')}</b><small>•••• 0000 · ${t('Game funds','游戏资金')}</small></span><strong>TC</strong></label></fieldset><label class="tc-check tc-consent"><input type="checkbox" id="tc-terms" required>${t('I have reviewed the fare rules and agree to complete this game booking.','我已核对票价规则，同意完成游戏订单。')}</label><button type="button" class="tc-text-button" data-action="terms">${t('Read fare rules','阅读票价规则')}</button><p id="tc-payment-error" class="tc-error" role="alert"></p><button type="submit" class="tc-primary tc-wide" id="tc-pay">${t('Pay','支付')} ${cash(total())} <small>${t('Game funds','游戏资金')}</small> →</button></form>`;
        $('#tc-payment-form').addEventListener('submit',event=>{
          event.preventDefault();if(!canAct())return;
          draft.method=$('input[name="method"]:checked').value;
          if(!saveDraft())return;
          const roundId=params.get('round')||null;
          const existing=allOrders().find(o=>o.flightId===selected.id&&o.from===search.from&&o.to===search.to&&o.date===search.date&&o.adults===search.adults&&o.roundId===roundId&&o.profile===draft.profile&&(o.passengerName || PROFILES[o.profile])===draft.passengerName&&o.method===draft.method&&o.total===total()&&o.extras.bag===draft.extras.bag&&o.extras.seat===draft.extras.seat&&o.extras.cover===draft.extras.cover);
          if(existing){
            try { sessionStorage.setItem('tc-celebrate',existing.id); } catch {}
            location.replace(href('confirmation',{order:existing.id}));return;
          }
          const order={version:1,id:'TC-'+crypto.randomUUID().toUpperCase().slice(0,18),...search,flightId:selected.id,unitPrice:farePrice(selected,search.date),extras:{...draft.extras},total:total(),profile:draft.profile,passengerName:draft.passengerName,method:draft.method,payment:'paid',roundId,at:Date.now()};
          if(!storeBooking('tc-orders',[order,...allOrders()].slice(0,30))){$('#tc-payment-error').textContent=t('Your booking could not be saved. Please try again.','预订未能保存，请重试。');return;}
          $('#tc-pay').disabled=true;
          try { sessionStorage.setItem('tc-celebrate',order.id); } catch {}
          location.replace(href('confirmation',{order:order.id}));
        });
      }
    }
    function confirmation() {
      if(!booked){content.innerHTML=`<main class="tc-container tc-empty"><h1>${t('Booking not found','未找到订单')}</h1><p>${t('Open My bookings in the browser tab where you booked.','请在预订所用的浏览器标签页打开「我的订单」。')}</p><a class="tc-primary" href="${href('orders')}">${t('My bookings','我的订单')}</a></main>`;return;}
      const f=routeFlights(booked).find(f=>f.id===booked.flightId);
      content.innerHTML=`<main class="tc-container tc-confirmation"><div class="tc-confirmation-heading"><span class="tc-success-icon">✓</span><p class="tc-eyebrow">${t('BOOKING CONFIRMED','预订已确认')}</p><h1>${t('You’re going to Taipei!','台北，我们来啦！')}</h1><p>${t('Your booking is complete. Your itinerary is ready.','预订已完成，你的行程单准备好了。')}</p></div><section class="tc-ticket"><div class="tc-ticket-head"><span>Tripuccino.</span><b>${t('Paid','已付款')} · ${cash(booked.total)}</b></div><div class="tc-ticket-route"><div><small>${city(booked.from)}</small><strong>${booked.from}</strong><span>${f.dep} · ${f.terminal}</span></div><span class="tc-ticket-plane">✈</span><div><small>${city(booked.to)}</small><strong>${booked.to}</strong><span>${f.arr}${nextDay(f)?' (+1)':''} · T1</span></div></div><div class="tc-ticket-meta"><div><small>${t('DEPARTURE','出发')}</small><b>${dateText(booked.date)}</b></div><div><small>${t('FLIGHT','航班')}</small><b>${f.number} · ${f.airline}</b></div><div><small>${t('TRAVELLERS','乘客')}</small><b>${esc(booked.passengerName || PROFILES[booked.profile])}${booked.adults>1?' + '+(booked.adults-1):''}</b></div><div><small>${t('BOOKING REFERENCE','预订编号')}</small><b>${esc(booked.id)}</b></div></div><div class="tc-ticket-foot">${t('Cabin baggage 7 kg','手提行李 7 kg')} · ${booked.extras.bag?booked.extras.bag+' kg '+t('checked','托运'):t('No checked baggage','无托运行李')} · ${t('E-ticket','电子机票')}</div></section><div class="tc-confirmation-actions"><button class="tc-primary" data-action="download">${t('Download itinerary','下载行程单')} ↓</button><a class="tc-secondary" href="${href('orders')}">${t('View my bookings','查看我的订单')}</a></div>${params.has('round')?`<p class="tc-complete-reminder">${t('Your booking is recorded. Use the game’s Submit button when you are ready.','预订已记录，准备好后可点击游戏栏的「提交」。')}</p>`:''}<p class="tc-muted tc-center">${t('Game booking · no real payment','游戏订单 · 无实际付款')}</p></main>`;
      try {
        if(sessionStorage.getItem('tc-celebrate')===booked.id) {
          sessionStorage.removeItem('tc-celebrate');
          if(!matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const confetti=document.createElement('div');
            confetti.className='tc-confetti';
            confetti.setAttribute('aria-hidden','true');
            for(let i=0;i<80;i++) {
              const piece=document.createElement('span');
              piece.style.setProperty('--x',Math.random()*100+'vw');
              piece.style.setProperty('--drift',(Math.random()*180-90)+'px');
              piece.style.setProperty('--delay',Math.random()*0.9+'s');
              piece.style.setProperty('--duration',(2.8+Math.random()*1.7)+'s');
              piece.style.setProperty('--colour',['#2563eb','#ffd141','#f76378','#19b5a5','#a977e6'][i%5]);
              confetti.appendChild(piece);
            }
            document.body.appendChild(confetti);
            setTimeout(()=>confetti.remove(),6000);
          }
        }
      } catch {}
    }
    function orders() {
      const items=allOrders();
      content.innerHTML=`<main class="tc-container tc-orders"><p class="tc-eyebrow">${t('YOUR TRIPS','你的旅行')}</p><h1>${t('My bookings','我的订单')}</h1><p class="tc-muted">${t('Bookings made in this browser tab.','在当前浏览器标签页完成的订单。')}</p>${items.map(o=>{const f=FLIGHTS.find(f=>f.id===o.flightId);return `<article class="tc-order-card"><div><span class="tc-order-status">${t('Confirmed','已确认')}</span><h2>${city(o.from)} → ${city(o.to)}</h2><p>${dateText(o.date)} · ${f.number} · ${o.adults} ${t('adult'+(o.adults>1?'s':''),'位成人')}</p><small>${esc(o.id)}</small></div><div><strong>${cash(o.total)}</strong><a class="tc-secondary" href="${href('confirmation',{order:o.id,from:o.from,to:o.to,date:o.date,adults:o.adults})}">${t('View booking','查看订单')} →</a></div></article>`;}).join('')||`<div class="tc-empty"><h2>${t('Your next trip starts with a search.','下一段旅程，从搜索开始。')}</h2><a class="tc-primary" href="${href('home')}">${t('Find a flight','找一张机票')}</a></div>`}</main>`;
    }
    function info(action) {
      const travelPhoto = (file,en,zh,credit,source,license,licenseURL) => `<figure class="tc-travel-photo"><img src="${asset(file)}" alt="${esc(t(en,zh))}"><figcaption>${esc(t(en,zh))}<small>${esc(credit)} · <a href="${source}" target="_blank" rel="noopener">${t('Photo source','照片来源')}</a> · <a href="${licenseURL}" target="_blank" rel="noopener">${license}</a></small></figcaption></figure>`;
      const messages={
        stays:[t('Staying in Taipei','在台北住宿'),travelPhoto("hotel.jpg","Grand Hotel, Taipei","台北圆山大饭店","Jiazheng0609","https://commons.wikimedia.org/wiki/File:Grand_Hotel_Taipei_in_rainy_day.jpg","CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0")+"<p>"+t('Compare the district, airport-rail access, check-in time and cancellation terms before choosing a stay. Taipei Main Station is convenient for airport arrivals, while Shilin is close to the night market. This activity books the flight only.','选择住宿时比较街区、机场铁路交通、入住时间与取消条款。台北车站附近方便机场抵达，士林附近方便逛夜市。本次活动办理机票预订。')+"</p>"],
        rail:[t('Airport rail to Taipei','机场铁路到台北'),travelPhoto("rail.jpg","Taoyuan Airport MRT near Guishan","桃园机场捷运，龟山段","玄史生","https://commons.wikimedia.org/wiki/File:Taoyuan_Airport_MRT_Train_at_Guishan,_Taoyuan_20171220.jpg","CC0","http://creativecommons.org/publicdomain/zero/1.0/deed.en")+"<p>"+t('From Taoyuan Airport, look for the Airport MRT to Taipei Main Station. Check the service type and last departure before travelling. Keep your arrival terminal and onward address handy.','在桃园机场寻找机场捷运前往台北车站。出发前核对车种与末班车时间，备好抵达航站楼和后续目的地地址。')+"</p>"],
        cars:[t('Getting around Taiwan','台湾当地交通'),travelPhoto("cars.jpg","Rental vehicle in Taiwan · illustrative vehicle, not a bookable offer","台湾租赁车辆 · 车型示意，非可预订报价","Solomon203","https://commons.wikimedia.org/wiki/File:Hyundai_Starex_of_IWS_Rent-a-car_rented_by_Gala_TV_3803-UU_20100607.jpg","CC BY 3.0","https://creativecommons.org/licenses/by/3.0")+"<p>"+t('For a city break, compare the MRT, buses, airport rail and licensed taxis. If considering a rental car, check licence requirements, insurance and the total rental price before booking.','城市旅行可比较捷运、公车、机场铁路与合法出租车。若考虑租车，预订前应核对驾照要求、保险与租金总价。')+"</p>"],
        help:[t('How can we help?','需要什么帮助？'),`<h3>${t('Find the cheapest flight','找到最便宜的机票')}</h3><p>${t('Search your route and date, then select Cheapest above the results. Compare the total fare, airports and baggage.','搜索路线与日期后，点击列表上方的「最低价」，并核对含税价、机场与行李。')}</p><h3>${t('Continue a booking','继续预订')}</h3><p>${t('Select a flight, confirm passenger details, choose any extras, then complete payment. Your booking appears in My bookings.','选择航班，确认乘客资料，选择附加服务并完成付款。预订会出现在「我的订单」。')}</p>`],
        about:[t('About Tripuccino','关于 Tripuccino'),t('Tripuccino is a flight booking experience in Scamurai. Flight availability and payments are part of the game.','Tripuccino 是 Scamurai 的机票预订体验，航班与付款属于游戏内容。')],
        terms:[t('Fare rules & privacy','票价规则与隐私'),t('Economy Basic includes taxes and 7 kg cabin baggage. Checked baggage, seat preference and travel cover are optional. Basic fares are non-refundable. Passenger and contact details stay in this browser tab. Currency conversion uses MYR 1 = TWD 7.2. This is a game booking with no real payment.','经济舱基础票价包含税费与 7 kg 手提行李。托运行李、座位偏好与旅行保障均可选。基础票价不可退。乘客与联系资料保存在当前浏览器标签页。汇率为 MYR 1 = TWD 7.2。这是游戏订单，不会实际付款。')],
        'fare-note':[t('Clear, all-in prices','清楚的含税总价'),t('Each listed fare is per adult and includes MYR 92 in taxes and airport fees. The group total follows your traveller count. Extras are added only if selected.','列表价格按每位成人计算，已含 MYR 92 税费与机场费。同行总价根据乘客人数计算。附加服务选中后才会加入。')],
        baggage:[t('Pack for your fare','按票价安排行李'),t('Tickets include 7 kg cabin baggage including your personal item. Optional checked baggage costs MYR 85 for 20 kg or MYR 115 for 25 kg per adult.','机票包含共 7 kg 手提行李（含随身物品）。每位成人可加购 20 kg 托运 MYR 85，或 25 kg 托运 MYR 115。')],
        airports:[t('Know your airports','核对机场'),t('KUL is Kuala Lumpur International Airport. SZB is Subang, a different airport. TPE is Taiwan Taoyuan International, serving Taipei. TSA is Taipei Songshan. Your task’s KL International → Taoyuan route is KUL → TPE. Malaysia and Taiwan both use UTC+8.','KUL 是吉隆坡国际机场，SZB 是另一个机场梳邦机场。TPE 是服务台北的台湾桃园国际机场，TSA 是台北松山机场。题目中的吉隆坡国际机场至桃园路线为 KUL → TPE。马来西亚与台湾均使用 UTC+8。')],
        cover:[t('Travel cover summary','旅行保障摘要'),t('Travel cover costs MYR 29 per adult and includes baggage-delay and trip-disruption cover. It is optional.','旅行保障每位成人 MYR 29，包含行李延误与行程中断保障，为可选服务。')],
        guide:[t('Your first day in Taipei','抵达台北的第一天'),`<img class="tc-guide-image" src="${asset('taipei.jpg')}" alt="${t('Liberty Square, Taipei','台北自由广场')}"><img class="tc-guide-image" src="${asset('market.jpg')}" alt="${t('Shilin Night Market','士林夜市')}"><h3>${t('Arrive, settle in, find dinner.','抵达，安顿，去找晚餐。')}</h3><p>${t('Start at Taoyuan Airport (TPE). Check airport rail services toward Taipei Main Station, leave time for immigration, then explore Liberty Square or Shilin Night Market. January can be cool and rainy, so pack a light jacket.','从桃园机场（TPE）出发，可查询往台北车站的机场铁路，预留入境时间。安顿后可以逛自由广场或士林夜市。一月可能湿冷，带件轻便外套。')}</p>`],
        sources:[t('Photo credits','照片来源'),'<p>Taipei Liberty Square · AngMoKio · resized image.</p><p><a href="https://commons.wikimedia.org/wiki/File:ChiangKai-shek_memorial2009_amk.jpg" target="_blank" rel="noopener">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a></p><p>Shilin Night Market · Exec8 · resized image.</p><p><a href="https://commons.wikimedia.org/wiki/File:Shilin_Night_Market_02.jpg" target="_blank" rel="noopener">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a></p>' ]
      };
      if(messages[action])showDialog(messages[action][0],`<div class="tc-info">${messages[action][1]}</div>`);
    }
    site.addEventListener('click',event=>{
      const select=event.target.closest('[data-select]');if(select){if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();chooseFare(select.dataset.select);return;}
      const button=event.target.closest('[data-action]');if(!button)return;
      const action=button.dataset.action;
      if(action==='flights'){if(view==='home')document.getElementById('tc-search').scrollIntoView({block:'center',behavior:'smooth'});else location.href=href('home');}
      else if(action==='swap'){[search.from,search.to]=[search.to,search.from];refreshSearch();}
      else if(action==='calendar')calendar();
      else if(action==='travellers')travellers();
      else if(action==='currency'){
        showDialog(t('Display currency','显示货币'),`<p>${t('Payments and game assessment use MYR. TWD amounts are approximate.','付款与任务判定使用 MYR，TWD 金额为估算。')}</p><div class="tc-currency-options"><button class="tc-secondary" data-currency="MYR">MYR · Malaysian ringgit</button><button class="tc-secondary" data-currency="TWD">TWD · 新台币</button></div>`);
        $$('[data-currency]').forEach(option=>option.addEventListener('click',()=>{write('tc-currency',option.dataset.currency);location.reload();}));
      } else if(action==='download'&&booked){
        const f=FLIGHTS.find(f=>f.id===booked.flightId),blob=new Blob([['TRIPUCCINO / GAME ITINERARY',booked.id,'Game booking - no real payment',`${booked.from} -> ${booked.to}`,booked.date,`${f.dep} -> ${f.arr}${nextDay(f)?' (+1 day)':''}`,`${f.airline} / ${f.number}`,`Passenger ${booked.passengerName || PROFILES[booked.profile]}`,`Adults ${booked.adults}`,`Cabin baggage 7 kg / checked ${booked.extras.bag} kg`,`Total MYR ${booked.total}`,'Game booking - no real payment'].join('\n')],{type:'text/plain;charset=utf-8'});
        const objectURL=URL.createObjectURL(blob),link=document.createElement('a');link.href=objectURL;link.download=booked.id+'-itinerary.txt';link.click();setTimeout(()=>URL.revokeObjectURL(objectURL),1000);toast(t('Itinerary download started.','已发起行程单下载。'));
      } else info(action);
    });
    if(view==='home')home();
    else if(view==='flights')flights();
    else if(['details','extras','payment'].includes(view))checkout();
    else if(view==='confirmation')confirmation();
    else if(view==='orders')orders();
    else home();
    window.lucide?.createIcons({root:site});
    if(view==='flights'&&matchMedia('(max-width:760px)').matches)$('.tc-filter-panel').open=false;
    document.title='Tripuccino · '+t('Flights to your next chapter','飞往下一段旅程');
  }

  window.BROWSE_SCENES=window.BROWSE_SCENES||{};
  window.BROWSE_SCENES.tripuccino=render;
  if(document.body.hasAttribute('data-trip-standalone')) {
    const params=new URLSearchParams(location.search),lang=params.get('lang')==='zh'?'zh':'en';
    document.documentElement.lang=lang==='zh'?'zh-Hans':'en';
    const memory={};
    const read=(key,fallback)=>{try{const raw=sessionStorage.getItem('tripuccino-v2:'+key);return raw===null?fallback:JSON.parse(raw);}catch{return Object.hasOwn(memory,key)?memory[key]:fallback;}};
    const write=(key,value)=>{try{sessionStorage.setItem('tripuccino-v2:'+key,JSON.stringify(value));memory[key]=value;return true;}catch{memory[key]=value;return false;}};
    const url=(file,query={})=>{const view=query.view||'home',routes={home:'index.html',flights:'flights.html',details:'details.html',extras:'details.html',payment:'details.html',confirmation:'confirmation.html',orders:'orders.html'},u=new URL(routes[view]||'index.html',location.href);u.searchParams.set('lang',lang);Object.entries(query).forEach(([key,value])=>{if(value!==null&&value!==undefined&&value!=='')u.searchParams.set(key,String(value));});return u.href;};
    render({root:document.getElementById('site-root'),params,t:(en,zh)=>lang==='zh'?zh:en,esc:value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),url,read,write});
  }
})();
