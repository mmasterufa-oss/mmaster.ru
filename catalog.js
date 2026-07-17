// ============================================================
// Каталог «Мебельный Мастер» — рендер из data/products.js
// Работает и через file://, и на реальном хостинге (без fetch/AJAX).
// ============================================================

const ICONS = {
  'desk-shelf': `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="60" width="160" height="10" rx="2"/><line x1="34" y1="70" x2="34" y2="160"/><line x1="166" y1="70" x2="166" y2="160"/><rect x="26" y="86" width="58" height="38" rx="2"/><line x1="55" y1="86" x2="55" y2="124"/></svg>`,
  'desk': `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="70" width="140" height="10" rx="2"/><line x1="44" y1="80" x2="44" y2="150"/><line x1="156" y1="80" x2="156" y2="150"/><rect x="120" y="94" width="34" height="56" rx="2"/></svg>`,
  'dining': `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="76" width="160" height="10" rx="2"/><line x1="34" y1="86" x2="34" y2="154"/><line x1="166" y1="86" x2="166" y2="154"/><line x1="100" y1="86" x2="100" y2="154" stroke-dasharray="1 8"/></svg>`,
  'divider': `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="42" y="24" width="116" height="152" rx="3"/><line x1="42" y1="56" x2="158" y2="56"/><line x1="42" y1="88" x2="158" y2="88"/><line x1="42" y1="120" x2="158" y2="120"/><line x1="42" y1="152" x2="158" y2="152"/></svg>`,
  'cabinet': `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="50" y="34" width="100" height="140" rx="4"/><line x1="50" y1="70" x2="150" y2="70"/><line x1="50" y1="106" x2="150" y2="106"/><line x1="50" y1="142" x2="150" y2="142"/></svg>`,
  'dresser': `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="40" y="46" width="120" height="120" rx="4"/><line x1="40" y1="82" x2="160" y2="82"/><line x1="40" y1="118" x2="160" y2="118"/><line x1="100" y1="46" x2="100" y2="166" stroke-dasharray="1 8"/></svg>`,
  'tvunit': `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="86" width="140" height="54" rx="4"/><line x1="30" y1="113" x2="170" y2="113"/></svg>`,
};

function iconSvg(id){
  return ICONS[id] || ICONS['desk'];
}

function fmtPrice(n){
  return n.toLocaleString('ru-RU') + ' ₽';
}

function discountPct(price, oldPrice){
  if(!oldPrice || oldPrice <= price) return null;
  return Math.round((1 - price / oldPrice) * 100);
}

function marketplaceLinks(variant){
  const links = [];
  if(variant.artikulOzon){
    links.push({ mp:'ozon', label:'Ozon', color:'#005BFF', url:`https://www.ozon.ru/product/${variant.artikulOzon}/` });
  }
  if(variant.artikulWB){
    links.push({ mp:'wb', label:'WB', color:'#CB11AB', url:`https://www.wildberries.ru/catalog/${variant.artikulWB}/detail.aspx` });
  }
  if(variant.ymUrl){
    links.push({ mp:'ym', label:'Я.Маркет', color:'#FFCC00', url: variant.ymUrl });
  }
  return links;
}

function mpLinksHtml(variant, extraStyle){
  const links = marketplaceLinks(variant);
  if(!links.length) return '';
  return `<div class="card-marketplaces"${extraStyle ? ` style="${extraStyle}"` : ''}>` +
    links.map(l => `<a href="${l.url}" class="mp-link" data-mp="${l.mp}" target="_blank" rel="noopener"><span class="mp-dot" style="background:${l.color}"></span>${l.label}</a>`).join('') +
  `</div>`;
}

function categoryName(id){
  const c = CATEGORIES.find(c => c.id === id);
  return c ? c.name : id;
}

// ---------- INDEX PAGE: category nav + grid ----------
function renderCatalog(){
  const nav = document.querySelector('[data-category-nav]');
  const grid = document.querySelector('[data-product-grid]');
  if(!nav || !grid) return;

  const topLevel = CATEGORIES.filter(c => !c.parent);

  nav.innerHTML = `<button class="category-tab active" data-cat="all">Все категории</button>` +
    topLevel.map(c => `<button class="category-tab" data-cat="${c.id}">${c.name}</button>`).join('');

  let subnav = document.querySelector('[data-subcategory-nav]');
  if(!subnav){
    subnav = document.createElement('div');
    subnav.className = 'category-nav category-subnav';
    subnav.setAttribute('data-subcategory-nav', '');
    subnav.style.display = 'none';
    nav.after(subnav);
  }

  function cardHtml(p){
    const v = p.variants[0];
    const disc = discountPct(v.price, v.oldPrice);
    const minPrice = Math.min(...p.variants.map(v => v.price));
    const priceLabel = p.variants.length > 1 ? `от ${fmtPrice(minPrice)}` : fmtPrice(v.price);
    return `
      <article class="card" data-card data-cat="${p.category}">
        <div class="card-media">
          <div class="icon-placeholder">
            ${iconSvg(p.icon)}
            <span class="icon-placeholder-note">фото уточняется</span>
          </div>
          ${disc ? `<span class="card-badges"><span class="badge badge-price">−${disc}%</span></span>` : ''}
        </div>
        <div class="card-body">
          <span class="card-cat">${categoryName(p.category)}</span>
          <h3 class="card-title"><a href="product.html?id=${p.id}">${p.name}${p.variants.length > 1 ? ` <span style="color:var(--ink-soft);font-weight:400">· ${p.variants.length} цвета</span>` : ''}</a></h3>
          <div class="card-price-row">
            <span class="card-price">${priceLabel}</span>
            ${v.oldPrice ? `<span class="card-price-old">${fmtPrice(v.oldPrice)}</span>` : ''}
          </div>
          <div class="card-actions">
            <a href="product.html?id=${p.id}" class="btn btn-secondary btn-sm btn-block">Подробнее</a>
          </div>
          ${mpLinksHtml(v)}
        </div>
      </article>`;
  }

  grid.innerHTML = PRODUCTS.map(cardHtml).join('');

  let emptyMsg = document.querySelector('[data-empty-msg]');
  if(!emptyMsg){
    emptyMsg = document.createElement('p');
    emptyMsg.setAttribute('data-empty-msg', '');
    emptyMsg.style.cssText = 'display:none;color:var(--ink-soft);padding:40px 0;text-align:center;';
    grid.after(emptyMsg);
  }

  function applyFilter(cat){
    const children = CATEGORIES.filter(c => c.parent === cat).map(c => c.id);
    const matchIds = cat === 'all' ? null : [cat, ...children];
    let visible = 0;
    grid.querySelectorAll('[data-card]').forEach(card => {
      const show = !matchIds || matchIds.includes(card.dataset.cat);
      card.style.display = show ? '' : 'none';
      if(show) visible++;
    });
    if(visible === 0 && cat !== 'all'){
      emptyMsg.textContent = `В категории «${categoryName(cat)}» пока нет товаров — скоро добавим.`;
      emptyMsg.style.display = 'block';
    } else {
      emptyMsg.style.display = 'none';
    }
  }

  nav.addEventListener('click', e => {
    const btn = e.target.closest('.category-tab');
    if(!btn) return;
    nav.querySelectorAll('.category-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;

    const children = CATEGORIES.filter(c => c.parent === cat);
    if(children.length){
      subnav.innerHTML = `<button class="category-tab sub active" data-cat="${cat}">Все · ${categoryName(cat)}</button>` +
        children.map(c => `<button class="category-tab sub" data-cat="${c.id}">${c.name}</button>`).join('');
      subnav.style.display = 'flex';
    } else {
      subnav.style.display = 'none';
      subnav.innerHTML = '';
    }

    applyFilter(cat);
  });

  subnav.addEventListener('click', e => {
    const btn = e.target.closest('.category-tab');
    if(!btn) return;
    subnav.querySelectorAll('.category-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.cat);
  });
}

// ---------- PRODUCT PAGE: variant switching ----------
function renderProductPage(){
  const root = document.querySelector('[data-product-root]');
  if(!root) return;

  const params = new URLSearchParams(location.search);
  const id = params.get('id') || (typeof PRODUCTS !== 'undefined' ? PRODUCTS[0].id : null);
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  let variantIndex = 0;

  function render(){
    const v = product.variants[variantIndex];
    const disc = discountPct(v.price, v.oldPrice);

    document.title = `${product.name}, ${v.color} — Мебельный Мастер`;

    root.innerHTML = `
      <div class="product-grid">
        <div class="gallery">
          <div class="gallery-main" data-gallery-main>
            <div class="icon-placeholder">
              ${iconSvg(product.icon)}
              <span class="icon-placeholder-note">фото уточняется</span>
            </div>
          </div>
        </div>
        <div class="product-info">
          <div class="product-info-eyebrow">${categoryName(product.category)} · арт. Ozon ${v.artikulOzon || '—'}</div>
          <h1 class="product-title">${product.name}, ${v.color}</h1>
          <div class="product-meta-row">
            <span>Размер ${v.dims} см</span>
          </div>

          <div class="product-price-block">
            <span class="product-price">${fmtPrice(v.price)}</span>
            ${v.oldPrice ? `<span class="product-price-old">${fmtPrice(v.oldPrice)}</span>` : ''}
            ${disc ? `<span class="product-discount">−${disc}%</span>` : ''}
          </div>

          ${product.variants.length > 1 ? `
          <div class="option-block">
            <span class="option-label">Цвет: ${v.color}</span>
            <div class="option-swatches" data-variant-switch>
              ${product.variants.map((vv, i) => `<button class="swatch ${i === variantIndex ? 'active' : ''}" data-variant-index="${i}">${vv.color}</button>`).join('')}
            </div>
          </div>` : ''}

          <div class="product-cta-row">
            <a href="index.html#lead" class="btn btn-primary">Оставить заявку</a>
          </div>

          ${mpLinksHtml(v, 'margin-bottom:26px;')}
          ${!marketplaceLinks(v).length ? `<p style="font-size:.85rem;color:var(--ink-soft);margin-bottom:26px;">Ссылки на маркетплейсы для этого варианта уточняются.</p>` : ''}

          <table class="spec-table">
            <tr><td>Категория</td><td>${categoryName(product.category)}</td></tr>
            <tr><td>Цвет</td><td>${v.color}</td></tr>
            <tr><td>Габариты</td><td>${v.dims} см</td></tr>
            <tr><td>Артикул Ozon</td><td>${v.artikulOzon || '—'}</td></tr>
            <tr><td>Артикул WB</td><td>${v.artikulWB || '—'}</td></tr>
            <tr><td>Страна производства</td><td>Россия</td></tr>
          </table>
        </div>
      </div>

      <div class="desc-block">
        <span class="section-eyebrow">Описание</span>
        <h2 style="margin-bottom:20px;">О товаре «${product.name}»</h2>
        <p>Корпусная мебель из ЛДСП собственного производства. Различные варианты отделки и размеров — в переключателе цвета выше. Актуальную цену и наличие уточняйте на карточке маркетплейса по ссылке.</p>
      </div>

      <section>
        <div class="section-head">
          <div>
            <span class="section-eyebrow">Похожие товары</span>
            <h2>Другие товары категории «${categoryName(product.category)}»</h2>
          </div>
        </div>
        <div class="carousel-track" data-related></div>
      </section>
    `;

    const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 6);
    const relatedTrack = root.querySelector('[data-related]');
    if(relatedTrack){
      relatedTrack.innerHTML = related.map(p => {
        const rv = p.variants[0];
        return `
        <article class="card">
          <div class="card-media"><div class="icon-placeholder">${iconSvg(p.icon)}<span class="icon-placeholder-note">фото уточняется</span></div></div>
          <div class="card-body">
            <span class="card-cat">${categoryName(p.category)}</span>
            <h3 class="card-title"><a href="product.html?id=${p.id}">${p.name}</a></h3>
            <div class="card-price-row"><span class="card-price">${fmtPrice(rv.price)}</span>${rv.oldPrice ? `<span class="card-price-old">${fmtPrice(rv.oldPrice)}</span>` : ''}</div>
            ${mpLinksHtml(rv)}
          </div>
        </article>`;
      }).join('') || '<p style="color:var(--ink-soft)">Пока нет других товаров в этой категории.</p>';
    }

    const switcher = root.querySelector('[data-variant-switch]');
    if(switcher){
      switcher.addEventListener('click', e => {
        const btn = e.target.closest('[data-variant-index]');
        if(!btn) return;
        variantIndex = Number(btn.dataset.variantIndex);
        render();
      });
    }
  }

  render();
}

document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  renderProductPage();
});
