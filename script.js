// ---------- Promo countdown timer ----------
function initTimer(){
  const el = document.querySelector('[data-timer]');
  if(!el) return;
  let remaining = 4*3600 + 38*60; // 04:38:00 demo countdown
  function tick(){
    if(remaining <= 0){ remaining = 6*3600; } // loop demo timer
    const h = Math.floor(remaining/3600);
    const m = Math.floor((remaining%3600)/60);
    const s = remaining%60;
    const pad = n => String(n).padStart(2,'0');
    el.textContent = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    remaining--;
  }
  tick();
  setInterval(tick, 1000);
}

// ---------- Mobile menu ----------
function initMobileMenu(){
  const btn = document.querySelector('[data-hamburger]');
  const nav = document.querySelector('[data-mobile-nav]');
  if(!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    nav.style.display = open ? 'flex' : 'none';
  });
}

// ---------- Catalog filters ----------
function initFilters(){
  const chips = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-card]');
  if(!chips.length || !cards.length) return;

  const state = { type: 'all', color: 'all', price: 'all' };

  function applyFilters(){
    let visible = 0;
    cards.forEach(card => {
      const type = card.dataset.type;
      const color = card.dataset.color;
      const price = Number(card.dataset.price);
      let ok = true;
      if(state.type !== 'all' && type !== state.type) ok = false;
      if(state.color !== 'all' && color !== state.color) ok = false;
      if(state.price === 'low' && price > 10000) ok = false;
      if(state.price === 'mid' && (price <= 10000 || price > 16000)) ok = false;
      if(state.price === 'high' && price <= 16000) ok = false;
      card.style.display = ok ? '' : 'none';
      if(ok) visible++;
    });
    const emptyMsg = document.querySelector('[data-empty]');
    if(emptyMsg) emptyMsg.style.display = visible === 0 ? 'block' : 'none';
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.filter;
      const value = chip.dataset.value;
      document.querySelectorAll(`[data-filter="${group}"]`).forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state[group] = value;
      applyFilters();
    });
  });
}

// ---------- Cart / favorites badge (in-memory only) ----------
function initCartActions(){
  let cartCount = 0;
  const cartBadge = document.querySelector('[data-cart-count]');
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      cartCount++;
      if(cartBadge){
        cartBadge.textContent = cartCount;
        cartBadge.style.display = 'flex';
      }
      const original = btn.textContent;
      btn.textContent = 'Добавлено';
      setTimeout(() => { btn.textContent = original; }, 1400);
    });
  });
  document.querySelectorAll('[data-fav]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      btn.style.color = btn.classList.contains('active') ? 'var(--accent)' : '';
    });
  });
}

// ---------- Lead / question form submission ----------
// Sends to mmasterufa@gmail.com via FormSubmit (no backend needed).
// NOTE: the first submission after deploying triggers a one-time
// "confirm this inbox" email from FormSubmit — click it once to activate.
function initForms(){
  document.querySelectorAll('[data-lead-form]').forEach(form => {
    const action = form.getAttribute('action');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const msg = form.querySelector('[data-form-msg]');
      const errMsg = form.querySelector('[data-form-error]');
      const btn = form.querySelector('button[type="submit"]');
      if(errMsg) errMsg.classList.remove('show');
      if(msg) msg.classList.remove('show');
      if(btn) btn.disabled = true;

      if(!action){
        // No backend configured on this form — local confirmation only
        if(msg) msg.classList.add('show');
        setTimeout(() => { form.reset(); if(btn) btn.disabled = false; }, 300);
        return;
      }

      try{
        const res = await fetch(action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        if(!res.ok) throw new Error('request failed');
        if(msg) msg.classList.add('show');
        form.reset();
      } catch(err){
        if(errMsg) errMsg.classList.add('show');
      } finally {
        if(btn) btn.disabled = false;
      }
    });
  });
}

// ---------- Product gallery (product.html) ----------
function initGallery(){
  const main = document.querySelector('[data-gallery-main]');
  const thumbs = document.querySelectorAll('[data-thumb]');
  if(!main || !thumbs.length) return;
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const media = thumb.querySelector('img, svg');
      main.innerHTML = media ? media.outerHTML : '';
    });
  });
}

// ---------- Product option swatches (color/size) ----------
function initSwatches(){
  const main = document.querySelector('[data-gallery-main]');
  document.querySelectorAll('[data-swatch-group]').forEach(group => {
    const swatches = group.querySelectorAll('.swatch');
    swatches.forEach(sw => {
      sw.addEventListener('click', () => {
        swatches.forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        const img = sw.dataset.image;
        if(img && main){
          main.innerHTML = `<img src="${img}" alt="${sw.textContent.trim()}">`;
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTimer();
  initMobileMenu();
  initFilters();
  initCartActions();
  initForms();
  initGallery();
  initSwatches();
});
