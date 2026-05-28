// home.js — pulls content/info.json and renders a fixed-size hero scroll
// (3 sets of images). The page silently loops by snapping the scroll
// position back by one set when the user crosses into the third set —
// the DOM never grows. Scroll snaps with a 30% threshold: less than
// 30% past the current photo → snap back, more than 30% → advance.

(async function () {
  const scroll = document.getElementById('hero-scroll');
  if (!scroll) return;

  let info;
  try {
    const res = await fetch('content/info.json', { cache: 'no-cache' });
    info = await res.json();
  } catch (err) {
    console.error('Could not load content/info.json', err);
    info = { hero_images: [] };
  }

  const images = (info.hero_images || []).filter(Boolean);
  if (images.length === 0) {
    scroll.innerHTML = '<figure><div class="placeholder">add hero photos in the cms</div></figure>';
    return;
  }

  const escapeAttr = s => String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const mapsUrl = info.address
    ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(info.address)
    : '#';
  const igUrl = info.instagram_url
    || (info.instagram_handle ? 'https://instagram.com/' + info.instagram_handle.replace(/^@/, '') : '#');

  const overlayHTML = `
    <div class="info-overlay">
      <span>${info.hours || ''}</span>
      <span><a href="${escapeAttr(mapsUrl)}" target="_blank" rel="noopener">${info.address || ''}</a></span>
      <span><a href="${escapeAttr(igUrl)}" target="_blank" rel="noopener">${info.instagram_handle || ''}</a></span>
    </div>
  `;

  const normalizeSrc = s => (s || '').replace(/^\//, '');

  function renderBlock(withOverlay) {
    const frag = document.createDocumentFragment();
    images.forEach((img, i) => {
      const fig = document.createElement('figure');
      const el = document.createElement('img');
      el.src = normalizeSrc(img.image);
      el.alt = img.alt || '';
      el.loading = 'lazy';
      el.onerror = () => {
        fig.innerHTML = '<div class="placeholder">' + (img.alt || 'photo') + '</div>';
        if (withOverlay && i === 1) fig.insertAdjacentHTML('beforeend', overlayHTML);
      };
      fig.appendChild(el);
      if (withOverlay && i === 1) fig.insertAdjacentHTML('beforeend', overlayHTML);
      frag.appendChild(fig);
    });
    scroll.appendChild(frag);
  }

  // Three sets — DOM is fixed size, scroll loops via JS
  renderBlock(true);   // set 1 (carries the info overlay)
  renderBlock(false);  // set 2
  renderBlock(false);  // set 3

  // ---------- 30% snap threshold + seamless loop ----------
  const N = images.length;
  const vh = () => window.innerHeight;
  const setH = () => N * vh();

  let snapAnchorY = 0;
  let isScrolling = false;
  let snapTimer = null;
  let lockWrap = false;

  function wrapIfNeeded() {
    if (lockWrap) return;
    const y = window.scrollY;
    // When the user has crossed into the third set, jump back by one set.
    // Visually identical (same image at same offset), DOM unchanged.
    if (y >= setH() * 2) {
      lockWrap = true;
      window.scrollTo({ top: y - setH(), behavior: 'instant' });
      snapAnchorY -= setH();
      requestAnimationFrame(() => { lockWrap = false; });
    }
  }

  function onScroll() {
    if (lockWrap) return;
    if (!isScrolling) {
      // Lock in the starting position at the beginning of a gesture
      snapAnchorY = Math.round(window.scrollY / vh()) * vh();
      isScrolling = true;
    }
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      isScrolling = false;
      wrapIfNeeded();
      const y = window.scrollY;
      const delta = y - snapAnchorY;
      const threshold = vh() * 0.3;  // 30%: change here if you want it more/less eager
      let target = snapAnchorY;
      if (delta > threshold) target = snapAnchorY + vh();
      else if (delta < -threshold) target = snapAnchorY - vh();
      if (Math.abs(target - y) > 1) {
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    }, 120);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();
