// home.js — pulls content/info.json and renders an infinite-loop hero scroll.
// One of the hero images is overlaid with the cafe info block (one solid
// white background under all three lines, no per-line boxes).
 
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
 
  const overlayHTML = `
    <div class="info-overlay">
      <span>${info.hours || ''}</span>
      <span>${info.address || ''}</span>
      <span>${info.instagram_handle || ''}</span>
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
 
  renderBlock(true);
  renderBlock(false);
  renderBlock(false);
 
  let appending = false;
  function maybeAppend() {
    if (appending) return;
    const distFromBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
    if (distFromBottom < window.innerHeight * 1.5) {
      appending = true;
      renderBlock(false);
      if (scroll.children.length > images.length * 50) {
        const first = scroll.firstElementChild;
        const removedH = first ? first.getBoundingClientRect().height * images.length : 0;
        for (let i = 0; i < images.length && scroll.firstElementChild; i++) {
          scroll.removeChild(scroll.firstElementChild);
        }
        window.scrollTo({ top: window.scrollY - removedH, behavior: 'auto' });
      }
      requestAnimationFrame(() => { appending = false; });
    }
  }
 
  window.addEventListener('scroll', maybeAppend, { passive: true });
  window.addEventListener('resize', maybeAppend);
  setTimeout(maybeAppend, 300);
  setTimeout(maybeAppend, 1200);
})();
