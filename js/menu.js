// menu.js — loads content/food.json + content/drink.json + content/info.json
// Renders the menu list, the floating arrow, the desktop + mobile preview
// (both follow the active item), and populates the footer photo + info block.
 
(async function () {
  const list = document.getElementById('menu-list');
  const wrap = list ? list.closest('.menu-wrap') : null;
  const desktopPreview = document.getElementById('desktop-preview');
  const desktopImg = document.getElementById('desktop-preview-img');
  const desktopCap = document.getElementById('desktop-preview-caption');
  const mobilePreview = document.getElementById('mobile-preview');
  const mobileImg = document.getElementById('mobile-preview-img');
  const mobileCap = document.getElementById('mobile-preview-caption');
  if (!list || !wrap) return;
 
  const arrow = document.createElement('span');
  arrow.className = 'menu-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';
  wrap.appendChild(arrow);
 
  const normalizeSrc = s => (s || '').replace(/^\//, '');
 
  async function loadJSON(p) {
    try { return await (await fetch(p, { cache: 'no-cache' })).json(); }
    catch (e) { console.error('load', p, e); return {}; }
  }
 
  const [food, drink, info] = await Promise.all([
    loadJSON('content/food.json'),
    loadJSON('content/drink.json'),
    loadJSON('content/info.json')
  ]);
 
  // ---------- footer ----------
  const footerImg = document.getElementById('footer-image');
  const footerHours = document.getElementById('footer-hours');
  const footerAddr = document.getElementById('footer-address');
  const footerHandle = document.getElementById('footer-handle');
  if (footerImg && info && Array.isArray(info.hero_images) && info.hero_images.length) {
    footerImg.src = normalizeSrc(info.hero_images[0].image);
    footerImg.alt = info.hero_images[0].alt || '';
  }
  if (footerHours)  footerHours.textContent  = (info && info.hours) || '';
  if (footerAddr)   footerAddr.textContent   = (info && info.address) || '';
  if (footerHandle) footerHandle.textContent = (info && info.instagram_handle) || '';
 
  // ---------- list ----------
  function renderItem(item) {
    const li = document.createElement('li');
    li.dataset.image = normalizeSrc(item.image);
    li.dataset.caption = item.caption || item.name || '';
    li.dataset.alt = item.name || '';
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = item.name || '';
    const price = document.createElement('span');
    price.className = 'price';
    if (item.price !== undefined && item.price !== null && item.price !== '') {
      price.textContent = '$' + item.price;
    }
    li.append(name, ' ', price);
    return li;
  }
 
  const mkAnchor = id => {
    const a = document.createElement('li');
    a.id = id;
    a.style.listStyle = 'none';
    a.style.height = '0';
    a.setAttribute('aria-hidden', 'true');
    return a;
  };
  list.appendChild(mkAnchor('food'));
  (food.items || []).forEach(it => list.appendChild(renderItem(it)));
  list.appendChild(mkAnchor('drink'));
  (drink.items || []).forEach(it => list.appendChild(renderItem(it)));
 
  // ---------- active state ----------
  function setActive(li) {
    document.querySelectorAll('.menu-list li.is-active').forEach(el => el.classList.remove('is-active'));
    if (!li || !li.dataset.image) {
      arrow.classList.remove('is-shown');
      desktopPreview.classList.remove('is-shown');
      return;
    }
    li.classList.add('is-active');
 
    const liRect = li.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const yTop = liRect.top - wrapRect.top;
    const yCenter = yTop + liRect.height / 2;
 
    arrow.style.top = yCenter + 'px';
    arrow.classList.add('is-shown');
 
    desktopPreview.style.top = yTop + 'px';
    if (mobilePreview) mobilePreview.style.top = yTop + 'px';
 
    const src = li.dataset.image, cap = li.dataset.caption, alt = li.dataset.alt;
    if (desktopImg.getAttribute('src') !== src) desktopImg.src = src;
    desktopImg.alt = alt;
    desktopCap.textContent = cap;
    desktopPreview.classList.add('is-shown');
 
    if (mobileImg && mobileImg.getAttribute('src') !== src) mobileImg.src = src;
    if (mobileImg) mobileImg.alt = alt;
    if (mobileCap) mobileCap.textContent = cap;
  }
 
  // hover (desktop)
  list.addEventListener('mouseover', e => {
    const li = e.target.closest('li');
    if (li && li.dataset.image) setActive(li);
  });
 
  // scroll updates active on BOTH desktop and mobile now
  function updateScrollActive() {
    const items = Array.from(list.querySelectorAll('li')).filter(li => li.dataset.image);
    if (!items.length) return;
    const targetY = window.innerHeight * 0.45;
    let best = items[0], bestDist = Infinity;
    items.forEach(li => {
      const r = li.getBoundingClientRect();
      const d = Math.abs((r.top + r.height / 2) - targetY);
      if (d < bestDist) { bestDist = d; best = li; }
    });
    setActive(best);
  }
  window.addEventListener('scroll', updateScrollActive, { passive: true });
  window.addEventListener('resize', () => {
    updateScrollActive();
    const active = list.querySelector('li.is-active');
    if (active) setActive(active);
  });
 
  // initial state
  const all = list.querySelectorAll('li[data-image]');
  if (all.length) setActive(all[Math.min(2, all.length - 1)]);
  setTimeout(updateScrollActive, 200);
  setTimeout(() => {
    const a = list.querySelector('li.is-active');
    if (a) setActive(a);
  }, 400);
})();
