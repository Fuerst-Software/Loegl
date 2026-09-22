/* =========================================================
   LÖGL Haus- & Küchengeräte — Mattsee am See (seit 1914)
   Interactive Features, Public Catalog & Dynamic Aktionen Engine
   (Zero Emojis - 100% SVG Vector Icons - Pure Aktionen Engine)
   ========================================================= */

const DEFAULT_PRODUCTS = [
  {
    id: 'WMF-101',
    title: 'WMF Gourmet Plus Topf-Set 4-teilig',
    brand: 'WMF',
    category: 'haushalt wmf',
    price: '249,00 €',
    stock: 6,
    active: true,
    img: 'assets/products/wmf_topfset.jpg',
    desc: 'Das WMF Gourmet Plus Topfset vereint höchste Verarbeitungsqualität mit zeitloser Eleganz. Gefertigt aus rostfreiem Cromargan® Edelstahl 18/10 mit TransTherm®-Allherdboden.',
    specs: 'Material: Cromargan® Edelstahl 18/10 | Inhalt: 3x Fleischtopf, 1x Bratentopf'
  },
  {
    id: 'ROWENTA-301',
    title: 'Rowenta Silence Force Elektro-Staubsauger',
    brand: 'Rowenta',
    category: 'elektro rowenta',
    price: '199,90 €',
    stock: 4,
    active: true,
    img: 'assets/stock/sortiment-elektro.jpg',
    desc: 'Extrem leise und leistungsstark: Der Rowenta Silence Force vereint erstklassige Reinigungsleistung auf allen Böden mit flüsterleisem Betrieb.',
    specs: 'Leistung: 750 Watt | Lautstärke: 57 dB(A) | Aktionsradius: 12 Meter'
  },
  {
    id: 'RIESS-601',
    title: 'Riess Classic Emaille-Kasserolle 20cm',
    brand: 'Riess',
    category: 'haushalt riess',
    price: '54,90 €',
    stock: 8,
    active: true,
    img: 'assets/products/riess_emaille.jpg',
    desc: 'Traditionelles Emaille-Geschirr aus dem Mostviertel in Österreich. Ideal für schonendes Kochen, Braten und Servieren.',
    specs: 'Material: Porzellan-Emaille auf Stahlkern | Durchmesser: 20 cm'
  },
  {
    id: 'KAISER-501',
    title: 'Kaiser Inspiration Springform 26cm',
    brand: 'Kaiser',
    category: 'backen kaiser',
    price: '29,95 €',
    stock: 12,
    active: true,
    img: 'assets/products/kaiser_form.jpg',
    desc: 'Hochwertige Backform für feinste Kuchen und Torten. Der auslaufsichere Rand verhindert ein Überlaufen im Backofen.',
    specs: 'Durchmesser: 26 cm | Beschichtung: KeraVis 2-fach Antihaft'
  }
];

const DEFAULT_AKTIONEN = [
  {
    id: 'AKT-1',
    title: 'WMF Alt-gegen-Neu Eintauschaktion',
    type: 'angebot',
    date: 'Gültig bis 31. August 2026',
    active: true,
    img: 'assets/products/wmf_topfset.jpg',
    desc: 'Bringen Sie Ihr altes Kochgeschirr (egal welcher Marke) zu uns ins Fachgeschäft nach Mattsee und sichern Sie sich sofort 20% Eintausch-Rabatt auf ein neues WMF Topfset!',
    badge: '-20% Eintausch-Rabatt auf WMF Topfsets'
  },
  {
    id: 'AKT-2',
    title: 'Rowenta & Krups Elektro-Aktionswochen',
    type: 'angebot',
    date: 'Gültig bis 15. September 2026',
    active: true,
    img: 'assets/stock/sortiment-elektro.jpg',
    desc: 'Beim Kauf eines ausgewählten Rowenta oder Krups Elektrogeräts schenken wir Ihnen 30 € Direkt-Gutschrift an der Kassa in Mattsee.',
    badge: '30 € Direkt-Gutschrift vor Ort'
  },
  {
    id: 'AKT-4',
    title: 'Sommer-Kochgeschirr Aktionswochen',
    type: 'saisonal',
    date: 'Gültig solange der Vorrat reicht',
    active: true,
    img: 'assets/products/riess_emaille.jpg',
    desc: 'Zu jeder Riess Emaille Kasserolle oder WMF Gourmet-Pfanne erhalten Sie ein hochwertiges 3-teiliges Edelstahl-Silikon Küchenhelfer-Set gratis dazu.',
    badge: 'Gratis Küchenhelfer-Set dazu'
  }
];

function getShopProducts() {
  const data = localStorage.getItem('loegl_products');
  if (!data) {
    localStorage.setItem('loegl_products', JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  try {
    let prods = JSON.parse(data);
    // Purge removed partner brands
    prods = prods.filter(p => !['bosch', 'miele', 'alfi'].includes((p.brand || '').toLowerCase()));
    localStorage.setItem('loegl_products', JSON.stringify(prods));
    return prods;
  } catch (e) { return DEFAULT_PRODUCTS; }
}

function getShopAktionen() {
  const data = localStorage.getItem('loegl_aktionen');
  if (!data) {
    localStorage.setItem('loegl_aktionen', JSON.stringify(DEFAULT_AKTIONEN));
    return DEFAULT_AKTIONEN;
  }
  try {
    let akt = JSON.parse(data);
    akt = akt.filter(a => !['miele', 'bosch', 'alfi'].some(b => (a.title || '').toLowerCase().includes(b)));
    localStorage.setItem('loegl_aktionen', JSON.stringify(akt));
    return akt;
  } catch (e) { return DEFAULT_AKTIONEN; }
}

/* Preisdarstellung: UVP klein & durchgestrichen oben, Aktionspreis groß & hervorgehoben (Blickfang).
   Klare, gut lesbare Schrift (Plus Jakarta Sans) mit tabellarischen Ziffern. */
var LOEGL_NUM = 'font-family:var(--price);font-variant-numeric:tabular-nums;letter-spacing:0.01em;white-space:nowrap;';
function loeglPriceStack(uvp, sale, bigSize) {
  bigSize = bigSize || '1.5rem';
  if (sale && String(sale).trim()) {
    return '<span style="' + LOEGL_NUM + 'font-size:0.72rem;font-weight:500;color:var(--ink-soft);text-decoration:line-through;display:block;line-height:1.2;">UVP ' + uvp + '</span>'
         + '<strong style="' + LOEGL_NUM + 'font-weight:600;font-size:' + bigSize + ';color:var(--gold-dark);display:block;line-height:1.25;">' + sale + '</strong>';
  }
  return '<strong style="' + LOEGL_NUM + 'font-weight:600;font-size:' + bigSize + ';color:var(--ink);">' + uvp + '</strong>';
}
function loeglPriceInline(uvp, sale) {
  if (sale && String(sale).trim()) {
    return '<span style="' + LOEGL_NUM + 'text-decoration:line-through;color:var(--ink-soft);font-weight:500;font-size:0.78em;">' + uvp + '</span> <strong style="' + LOEGL_NUM + 'font-weight:600;color:var(--gold-dark);">' + sale + '</strong>';
  }
  return '<span style="' + LOEGL_NUM + 'font-weight:600;">' + uvp + '</span>';
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     0. Scroll Reveal Observer
     --------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-in'));
  }

  setTimeout(() => {
    document.querySelectorAll('.hero .reveal, .subhero .reveal').forEach(el => el.classList.add('is-in'));
  }, 100);

  /* ---------------------------------------------------------
     0b. Hero Slideshow (Diashow)
     --------------------------------------------------------- */
  (function initSlideshow() {
    const box = document.getElementById('heroSlideshow');
    if (!box) return;

    const slides = Array.from(box.querySelectorAll('.slide'));
    if (slides.length < 2) return;

    const dotsWrap = box.querySelector('.slideshow__dots');
    const prevBtn = box.querySelector('.slideshow__arrow--prev');
    const nextBtn = box.querySelector('.slideshow__arrow--next');
    const INTERVAL = 3000;

    let current = slides.findIndex(s => s.classList.contains('is-active'));
    if (current < 0) current = 0;
    let timer = null;

    // Build navigation dots
    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slideshow__dot' + (i === current ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Bild ${i + 1} von ${slides.length}`);
      dot.addEventListener('click', () => { goTo(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      stop(); // guard against stacking multiple intervals
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;
      timer = setInterval(next, INTERVAL);
    }
    function restart() { stop(); start(); }

    if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });

    // Pause on hover / focus, resume on leave
    box.addEventListener('mouseenter', stop);
    box.addEventListener('mouseleave', start);
    box.addEventListener('focusin', stop);
    box.addEventListener('focusout', start);

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else restart();
    });

    start();
  })();

  /* ---------------------------------------------------------
     1. Live Opening Hours Calculator
     --------------------------------------------------------- */
  function updateLiveStatus() {
    const badge = document.getElementById('liveStatusBadge');
    if (!badge) return;

    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const mins = now.getMinutes();
    const timeVal = hours * 60 + mins;

    let isOpen = false;
    let statusText = 'Derzeit geschlossen';

    if (day >= 1 && day <= 5 && day !== 3) {
      if ((timeVal >= 540 && timeVal < 720) || (timeVal >= 870 && timeVal < 1080)) {
        isOpen = true;
        statusText = timeVal < 720 ? 'Heute geöffnet bis 12:00 Uhr' : 'Heute geöffnet bis 18:00 Uhr';
      } else if (timeVal < 540) {
        statusText = 'Öffnet heute um 09:00 Uhr';
      } else if (timeVal >= 720 && timeVal < 870) {
        statusText = 'Mittagspause · Öffnet um 14:30 Uhr';
      } else {
        statusText = 'Geschlossen · Öffnet morgen 09:00 Uhr';
      }
    } else if (day === 3) {
      if (timeVal >= 540 && timeVal < 720) {
        isOpen = true;
        statusText = 'Heute geöffnet bis 12:00 Uhr';
      } else if (timeVal < 540) {
        statusText = 'Öffnet heute um 09:00 Uhr';
      } else {
        statusText = 'Geschlossen · Öffnet morgen 09:00 Uhr';
      }
    } else if (day === 6) {
      if (timeVal >= 540 && timeVal < 750) {
        isOpen = true;
        statusText = 'Heute geöffnet bis 12:30 Uhr';
      } else if (timeVal < 540) {
        statusText = 'Öffnet heute um 09:00 Uhr';
      } else {
        statusText = 'Geschlossen · Öffnet Montag 09:00 Uhr';
      }
    } else {
      statusText = 'Sonntag geschlossen · Öffnet Montag 09:00 Uhr';
    }

    if (isOpen) {
      badge.className = 'status-badge status-badge--open';
      badge.innerHTML = `<span class="status-badge__dot"></span><span>${statusText}</span>`;
    } else {
      badge.className = 'status-badge status-badge--closed';
      badge.innerHTML = `<span class="status-badge__dot"></span><span>${statusText}</span>`;
    }

    const table = document.getElementById('hoursTable');
    if (table) {
      const rows = table.querySelectorAll('tr');
      rows.forEach(r => r.classList.remove('is-today'));
      if (day >= 1 && day <= 5 && day !== 3 && rows[0]) rows[0].classList.add('is-today');
      if (day === 3 && rows[1]) rows[1].classList.add('is-today');
      if (day === 6 && rows[2]) rows[2].classList.add('is-today');
    }
  }

  updateLiveStatus();

  /* ---------------------------------------------------------
     2. Mobile Navigation Menu
     --------------------------------------------------------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !burger.contains(e.target) && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });

    // Close nav on nav link click
    nav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------
     3. Header Sticky Shadow & Scroll To Top
     --------------------------------------------------------- */
  const header = document.getElementById('header');
  const toTop = document.getElementById('toTop');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 40;
    if (header) header.classList.toggle('is-stuck', scrolled);
    if (toTop) toTop.classList.toggle('is-visible', window.scrollY > 400);
  });

  /* ---------------------------------------------------------
     4. Dynamic Click & Collect Catalog Renderer
     --------------------------------------------------------- */
  let shopProductsById = {};
  let deepLinkDone = false;   // Reservierung per ?produkt=<id> nur einmal automatisch öffnen
  const productGrid = document.getElementById('productGrid');
  const catalogFilters = document.getElementById('catalogFilters');

  // Öffnet – von der Aktionen-Seite verlinkt – direkt die Reservierung des Produkts
  function maybeOpenDeepLinkReservation() {
    if (deepLinkDone) return;
    let pid = null;
    try { pid = new URLSearchParams(window.location.search).get('produkt'); } catch (e) { return; }
    if (!pid) return;
    deepLinkDone = true;
    const prod = shopProductsById[pid];
    if (!prod) return;
    // URL bereinigen, damit ein Reload die Reservierung nicht erneut öffnet
    try { history.replaceState(null, '', window.location.pathname); } catch (e) {}
    if ((prod.stock || 0) <= 0) return;
    if (productGrid) productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    openReservationModal({ id: prod.id, title: prod.title, brand: prod.brand, price: prod.price, sale: prod.salePrice, img: prod.img });
  }

  async function renderPublicProducts() {
    if (!productGrid || !window.LoeglAPI) return;
    productGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;"><p style="color: var(--ink-soft); font-size: 1.05rem;">Produkte werden geladen …</p></div>`;

    let activeProducts;
    try {
      activeProducts = await LoeglAPI.getProducts();
    } catch (err) {
      console.error('Produkte laden fehlgeschlagen:', err);
      productGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;"><p style="color: #c62828; font-size: 1.05rem;">Die Produkte konnten gerade nicht geladen werden. Bitte später erneut versuchen.</p></div>`;
      return;
    }

    shopProductsById = {};
    activeProducts.forEach(p => { shopProductsById[p.id] = p; });

    productGrid.innerHTML = '';
    if (activeProducts.length === 0) {
      productGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;"><p style="color: var(--ink-soft); font-size: 1.1rem;">Derzeit sind keine Artikel im Click &amp; Collect Shop freigeschaltet.</p></div>`;
    } else {
      activeProducts.forEach(prod => {
        const article = document.createElement('article');
        article.className = 'prod-card prod-card--compact reveal is-in';
        article.dataset.category = prod.category || 'haushalt';
        article.dataset.id = prod.id;

        const inStock = (prod.stock || 0) > 0;
        const stockBadge = inStock
          ? `<span style="font-size: 0.68rem; font-weight: 700; color: #2e7d32; background: rgba(46, 125, 50, 0.1); padding: 0.25em 0.6em; border-radius: 4px;">● Auf Lager</span>`
          : `<span style="font-size: 0.68rem; font-weight: 700; color: #c62828; background: rgba(198, 40, 40, 0.1); padding: 0.25em 0.6em; border-radius: 4px;">● Ausverkauft</span>`;

        const reserveBtnHtml = inStock
          ? `<button type="button" class="btn btn--primary reserve-btn" style="padding: 0.55em 0.4em; font-size: 0.78rem;"
              data-id="${prod.id}" data-title="${prod.title}" data-brand="${prod.brand}" data-price="${prod.price}" data-sale="${prod.salePrice || ''}" data-img="${prod.img}">
              <span>Reservieren</span>
            </button>`
          : `<button type="button" class="btn btn--ghost" style="padding: 0.55em 0.4em; font-size: 0.78rem; opacity: 0.5; cursor: not-allowed;" disabled>
              <span>Ausverkauft</span>
            </button>`;

        article.innerHTML = `
          <div class="prod-card__img" style="cursor: pointer;" title="Für Details & weitere Bilder klicken">
            <img src="${prod.img}" alt="${prod.title}" />
          </div>
          <div class="prod-card__body">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <span class="prod-card__tag">${prod.brand}</span>
              ${stockBadge}
            </div>
            <h3 class="prod-card__title">${prod.title}</h3>
            <p class="prod-card__desc">${prod.desc || ''}</p>
            <div style="margin-top: auto; padding-top: 0.8rem; border-top: 1px solid var(--line);">
              <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 0.8rem; gap: 0.5rem;">
                <span style="font-size: 0.72rem; color: var(--ink-soft);">${prod.salePrice ? 'Aktionspreis' : 'Preis'}</span>
                <div style="text-align: right;">${loeglPriceStack(prod.price, prod.salePrice, '1.3rem')}</div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;">
                <button type="button" class="btn btn--ghost info-btn" style="padding: 0.55em 0.4em; font-size: 0.78rem;"
                  data-id="${prod.id}" data-title="${prod.title}" data-brand="${prod.brand}" data-price="${prod.price}" data-sale="${prod.salePrice || ''}" data-img="${prod.img}" data-desc="${prod.desc || ''}" data-specs="${prod.specs || ''}">
                  <span>Mehr Infos</span>
                </button>
                ${reserveBtnHtml}
              </div>
            </div>
          </div>
        `;
        productGrid.appendChild(article);
      });
    }

    maybeOpenDeepLinkReservation();
  }

  if (catalogFilters) {
    const filterBtns = catalogFilters.querySelectorAll('.sortiment-tab');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.dataset.filter;
        const cards = document.querySelectorAll('#productGrid .prod-card');
        cards.forEach(card => {
          const cat = card.dataset.category || '';
          if (filter === 'all' || cat.includes(filter)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  renderPublicProducts();

  /* ---------------------------------------------------------
     5. Dynamic Aktionen Page Renderer
     --------------------------------------------------------- */
  const aktionenGrid = document.getElementById('aktionenGrid');
  const aktionenFilters = document.getElementById('aktionenFilters');
  let aktionsProdukteById = {};   // für die Detailansicht (inkl. weiterer Bilder)

  // Kachel für ein Aktionsprodukt (Shop-Artikel, der im Aktionen-Bereich erscheint).
  // Führt per Button direkt zur Reservierung des Produkts im Click & Collect Shop.
  function buildAktionsproduktCard(prod) {
    const card = document.createElement('article');
    card.className = 'card reveal is-in';
    card.dataset.type = 'angebot';
    card.dataset.aktProdId = prod.id;
    card.setAttribute('style', 'border: 1px solid var(--line-gold);');

    const inStock = (prod.stock || 0) > 0;
    const cta = inStock
      ? `<a href="click-and-collect.html?produkt=${prod.id}" class="btn btn--primary" style="font-size: 0.8rem; padding: 0.65em 0.5em; text-align: center;">
           <span>Reservieren</span>
         </a>`
      : `<span class="btn btn--ghost" style="font-size: 0.8rem; padding: 0.65em 0.5em; opacity: 0.55; pointer-events: none;"><span>Ausverkauft</span></span>`;

    card.innerHTML = `
      <div class="card__media--banner" style="cursor: pointer;" title="Details ansehen">
        <img src="${prod.img}" alt="${prod.title}" />
      </div>
      <div class="card__body" style="padding: 1.8rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem; flex-wrap: wrap; gap: 0.5rem;">
          <span style="font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.35em 0.8em; border-radius: 20px; display: inline-flex; align-items: center; gap: 0.4rem; color: var(--gold-dark); background: var(--gold-light);">
            <svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <span>Aktionsangebot</span>
          </span>
          ${prod.aktionValidText ? `<span style="font-size: 0.8rem; font-weight: 600; color: var(--ink-soft);">${prod.aktionValidText}</span>` : ''}
        </div>

        <h3 class="card__title" style="font-size: 1.5rem; margin-bottom: ${prod.aktionShowDesc ? '0.6rem' : '0.9rem'}; color: var(--ink);">${prod.title}</h3>
        ${prod.aktionShowDesc && prod.desc ? `<p class="card__text" style="font-size: 0.95rem; color: var(--ink-soft); line-height: 1.6; margin-bottom: 1.1rem;">${prod.desc}</p>` : ''}

        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; margin-bottom: 1.3rem; flex-wrap: wrap;">
          <span style="font-size: 0.72rem; color: var(--ink-soft);">${prod.salePrice ? 'Aktionspreis' : 'Preis'}</span>
          <div style="text-align: right;">${loeglPriceStack(prod.price, prod.salePrice, '1.5rem')}</div>
        </div>

        ${prod.aktionBadge ? `
          <div style="background: var(--paper-3); border-left: 3px solid var(--gold-dark); padding: 0.7rem 0.9rem; border-radius: 0 8px 8px 0; font-size: 0.85rem; font-weight: 600; color: var(--ink); margin-bottom: 1.4rem; display: flex; align-items: center; gap: 0.5rem;">
            <svg class="icon icon--gold" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${prod.aktionBadge}</span>
          </div>
        ` : ''}

        <div style="margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
          <button type="button" class="btn btn--ghost aktprod-details" style="font-size: 0.8rem; padding: 0.65em 0.5em;"><span>Mehr Infos</span></button>
          ${cta}
        </div>
      </div>
    `;
    return card;
  }

  async function renderPublicAktionen() {
    if (!aktionenGrid || !window.LoeglAPI) return;
    aktionenGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;"><p style="color: var(--ink-soft); font-size: 1.05rem;">Aktionen werden geladen …</p></div>`;

    let activeAktionen, aktionsProdukte = [];
    try {
      activeAktionen = await LoeglAPI.getAktionen();
    } catch (err) {
      console.error('Aktionen laden fehlgeschlagen:', err);
      aktionenGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;"><p style="color: #c62828; font-size: 1.05rem;">Die Aktionen konnten gerade nicht geladen werden.</p></div>`;
      return;
    }
    // Aktionsprodukte separat & ausfallsicher laden (funktioniert auch, falls die
    // DB-Spalten noch nicht angelegt sind – dann bleibt die Liste einfach leer).
    try {
      if (LoeglAPI.getAktionsprodukte) aktionsProdukte = await LoeglAPI.getAktionsprodukte() || [];
    } catch (err) {
      console.warn('Aktionsprodukte konnten nicht geladen werden (evtl. DB-Migration ausstehend):', err);
      aktionsProdukte = [];
    }

    aktionenGrid.innerHTML = '';

    if (activeAktionen.length === 0 && aktionsProdukte.length === 0) {
      aktionenGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
          <p style="color: var(--ink-soft); font-size: 1.05rem;">Derzeit sind keine Aktionen geschaltet.</p>
        </div>
      `;
      return;
    }

    // Zuerst die reservierbaren Aktionsprodukte (mit Detailansicht + Reservierung)
    aktionsProdukteById = {};
    aktionsProdukte.forEach(prod => {
      aktionsProdukteById[prod.id] = prod;
      aktionenGrid.appendChild(buildAktionsproduktCard(prod));
    });

    activeAktionen.forEach(akt => {
      const card = document.createElement('article');
      card.className = 'card reveal is-in';
      card.dataset.type = akt.type;

      let borderStyle = 'border: 1px solid var(--line);';
      let badgeTag = 'Sonderangebot';
      let badgeClass = 'color: var(--gold-dark); background: var(--gold-light);';
      let iconSvg = `<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;

      if (akt.type === 'saisonal') {
        badgeTag = 'Saisonales Highlight';
        badgeClass = 'color: #fff; background: #1565c0;';
        iconSvg = `<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      }

      card.setAttribute('style', borderStyle);

      let cleanBadgeText = (akt.badge || '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

      card.innerHTML = `
        <div class="card__media--banner">
          <img src="${akt.img}" alt="${akt.title}" />
        </div>
        <div class="card__body" style="padding: 1.8rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem; flex-wrap: wrap; gap: 0.5rem;">
            <span style="font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.35em 0.8em; border-radius: 20px; display: inline-flex; align-items: center; gap: 0.4rem; ${badgeClass}">
              ${iconSvg}
              <span>${badgeTag}</span>
            </span>
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--ink-soft);">${akt.date}</span>
          </div>

          <h3 class="card__title" style="font-size: 1.5rem; margin-bottom: 0.6rem; color: var(--ink);">${akt.title}</h3>
          <p class="card__text" style="font-size: 0.95rem; color: var(--ink-soft); line-height: 1.6; margin-bottom: 1.2rem;">${akt.desc}</p>

          ${cleanBadgeText ? `
            <div style="background: var(--paper-3); border-left: 3px solid var(--gold-dark); padding: 0.7rem 0.9rem; border-radius: 0 8px 8px 0; font-size: 0.85rem; font-weight: 600; color: var(--ink); margin-bottom: 1.4rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg class="icon icon--gold" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>${cleanBadgeText}</span>
            </div>
          ` : ''}

          <div style="margin-top: auto;">
            <a href="kontakt.html" class="btn btn--ghost" style="font-size: 0.82rem; padding: 0.6em 1.1em;">
              <span>Mehr erfahren / Anfragen</span>
              <svg class="icon icon--arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        </div>
      `;

      aktionenGrid.appendChild(card);
    });
  }

  if (aktionenFilters) {
    const filterBtns = aktionenFilters.querySelectorAll('.sortiment-tab');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.dataset.filter;
        const cards = document.querySelectorAll('#aktionenGrid .card');
        cards.forEach(card => {
          if (filter === 'all' || card.dataset.type === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  renderPublicAktionen();

  /* ---------------------------------------------------------
     6. Click & Collect Reservation & Info Modals
     --------------------------------------------------------- */
  const ccModal = document.getElementById('ccModal');
  const ccModalClose = document.getElementById('ccModalClose');
  const ccForm = document.getElementById('ccForm');
  const ccStepForm = document.getElementById('ccStepForm');
  const ccStepSuccess = document.getElementById('ccStepSuccess');
  const ccFinishBtn = document.getElementById('ccFinishBtn');

  const ccProductImg = document.getElementById('ccProductImg');
  const ccProductTitle = document.getElementById('ccProductTitle');
  const ccProductBrand = document.getElementById('ccProductBrand');
  const ccProductPrice = document.getElementById('ccProductPrice');

  const productInfoModal = document.getElementById('productInfoModal');
  const productInfoClose = document.getElementById('productInfoClose');
  const infoModalImg = document.getElementById('infoModalImg');
  const infoModalBrand = document.getElementById('infoModalBrand');
  const infoModalTitle = document.getElementById('infoModalTitle');
  const infoModalPrice = document.getElementById('infoModalPrice');
  const infoModalDesc = document.getElementById('infoModalDesc');
  const infoModalSpecs = document.getElementById('infoModalSpecs');
  const infoModalReserveBtn = document.getElementById('infoModalReserveBtn');

  let currentTargetProduct = null;

  /* ---- Produkt-Detail-Galerie + Bild-Lightbox ---- */
  const infoGalleryMain = document.getElementById('infoGalleryMain');
  const infoThumbs = document.getElementById('infoThumbs');
  const infoPrev = document.getElementById('infoPrev');
  const infoNext = document.getElementById('infoNext');
  const productLightbox = document.getElementById('productLightbox');
  const plImg = document.getElementById('plImg');
  const plPrev = document.getElementById('plPrev');
  const plNext = document.getElementById('plNext');
  const plClose = document.getElementById('plClose');
  const plCounter = document.getElementById('plCounter');

  let infoImages = [];
  let infoIndex = 0;

  function renderInfoGallery() {
    if (!infoModalImg) return;
    if (!infoImages.length) { infoModalImg.removeAttribute('src'); if (infoThumbs) infoThumbs.innerHTML = ''; return; }
    if (infoIndex < 0 || infoIndex >= infoImages.length) infoIndex = 0;
    infoModalImg.src = infoImages[infoIndex];
    const multi = infoImages.length > 1;
    if (infoPrev) infoPrev.style.display = multi ? '' : 'none';
    if (infoNext) infoNext.style.display = multi ? '' : 'none';
    if (infoThumbs) {
      infoThumbs.innerHTML = '';
      if (multi) {
        infoImages.forEach((url, i) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'pg__thumb' + (i === infoIndex ? ' is-active' : '');
          b.innerHTML = '<img src="' + url + '" alt="" />';
          b.addEventListener('click', () => { infoIndex = i; renderInfoGallery(); });
          infoThumbs.appendChild(b);
        });
      }
    }
  }
  function infoGoTo(delta) {
    if (infoImages.length < 2) return;
    infoIndex = (infoIndex + delta + infoImages.length) % infoImages.length;
    renderInfoGallery();
  }
  if (infoPrev) infoPrev.addEventListener('click', (e) => { e.stopPropagation(); infoGoTo(-1); });
  if (infoNext) infoNext.addEventListener('click', (e) => { e.stopPropagation(); infoGoTo(1); });
  if (infoGalleryMain) {
    infoGalleryMain.addEventListener('click', (e) => {
      if (e.target.closest('.pg__arrow')) return;
      openProductLightbox(infoImages, infoIndex);
    });
    let sx = 0;
    infoGalleryMain.addEventListener('touchstart', (e) => { sx = e.changedTouches[0].clientX; }, { passive: true });
    infoGalleryMain.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) infoGoTo(dx < 0 ? 1 : -1); }, { passive: true });
  }

  let plImages = [];
  let plIndex = 0;
  let plTimer = null;
  function plShow() {
    if (!plImages.length || !plImg) return;
    plImg.src = plImages[plIndex];
    const multi = plImages.length > 1;
    if (plCounter) { plCounter.textContent = (plIndex + 1) + ' / ' + plImages.length; plCounter.style.display = multi ? '' : 'none'; }
    if (plPrev) plPrev.style.display = multi ? '' : 'none';
    if (plNext) plNext.style.display = multi ? '' : 'none';
  }
  function openProductLightbox(images, start) {
    if (!productLightbox || !images || !images.length) return;
    clearTimeout(plTimer);
    plImages = images.slice();
    plIndex = start || 0;
    plShow();
    productLightbox.hidden = false;
    document.body.classList.add('glightbox-open');
    void productLightbox.offsetWidth;
    productLightbox.classList.add('is-open');
  }
  function plGo(delta) { if (plImages.length < 2) return; plIndex = (plIndex + delta + plImages.length) % plImages.length; plShow(); }
  function closeProductLightbox() {
    if (!productLightbox) return;
    productLightbox.classList.remove('is-open');
    document.body.classList.remove('glightbox-open');
    plTimer = setTimeout(() => { productLightbox.hidden = true; }, 300);
  }
  if (plPrev) plPrev.addEventListener('click', () => plGo(-1));
  if (plNext) plNext.addEventListener('click', () => plGo(1));
  if (plClose) plClose.addEventListener('click', closeProductLightbox);
  if (productLightbox) {
    productLightbox.addEventListener('click', (e) => { if (e.target === productLightbox) closeProductLightbox(); });
    let px = 0;
    productLightbox.addEventListener('touchstart', (e) => { px = e.changedTouches[0].clientX; }, { passive: true });
    productLightbox.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - px; if (Math.abs(dx) > 50) plGo(dx < 0 ? 1 : -1); }, { passive: true });
    document.addEventListener('keydown', (e) => {
      if (productLightbox.hidden) return;
      if (e.key === 'Escape') closeProductLightbox();
      else if (e.key === 'ArrowLeft') plGo(-1);
      else if (e.key === 'ArrowRight') plGo(1);
    });
  }

  function openReservationModal(prodData) {
    currentTargetProduct = prodData;
    if (ccProductImg) ccProductImg.src = prodData.img;
    if (ccProductTitle) ccProductTitle.textContent = prodData.title;
    if (ccProductBrand) ccProductBrand.textContent = prodData.brand;
    if (ccProductPrice) ccProductPrice.innerHTML = loeglPriceInline(prodData.price, prodData.sale);

    if (ccForm) ccForm.reset();
    if (ccStepForm) ccStepForm.style.display = 'block';
    if (ccStepSuccess) ccStepSuccess.style.display = 'none';

    if (productInfoModal) productInfoModal.classList.remove('is-open');
    if (ccModal) ccModal.classList.add('is-open');
  }

  function openInfoModal(prodData) {
    currentTargetProduct = prodData;
    infoImages = (prodData.images && prodData.images.length) ? prodData.images : (prodData.img ? [prodData.img] : []);
    infoIndex = 0;
    renderInfoGallery();
    if (infoModalBrand) infoModalBrand.textContent = prodData.brand;
    if (infoModalTitle) infoModalTitle.textContent = prodData.title;
    if (infoModalPrice) infoModalPrice.innerHTML = loeglPriceStack(prodData.price, prodData.sale, '1.6rem');
    if (infoModalDesc) infoModalDesc.textContent = prodData.desc || 'Keine ausführliche Beschreibung verfügbar.';
    if (infoModalSpecs) infoModalSpecs.textContent = prodData.specs || 'Keine zusätzlichen Spezifikationen.';

    if (productInfoModal) productInfoModal.classList.add('is-open');
  }

  // Delegated clicks for reserve-btn, info-btn, and modal backdrops
  document.addEventListener('click', (e) => {
    const reserveBtn = e.target.closest('.reserve-btn');
    if (reserveBtn) {
      const prodData = {
        id: reserveBtn.dataset.id,
        title: reserveBtn.dataset.title,
        brand: reserveBtn.dataset.brand,
        price: reserveBtn.dataset.price,
        sale: reserveBtn.dataset.sale,
        img: reserveBtn.dataset.img
      };
      openReservationModal(prodData);
      return;
    }

    const infoBtn = e.target.closest('.info-btn');
    if (infoBtn) {
      const prodData = {
        id: infoBtn.dataset.id || '',
        title: infoBtn.dataset.title,
        brand: infoBtn.dataset.brand,
        price: infoBtn.dataset.price,
        sale: infoBtn.dataset.sale,
        img: infoBtn.dataset.img,
        desc: infoBtn.dataset.desc,
        specs: infoBtn.dataset.specs
      };
      const prodFull = shopProductsById[prodData.id];
      prodData.images = (prodFull && prodFull.images && prodFull.images.length) ? prodFull.images : (prodData.img ? [prodData.img] : []);
      openInfoModal(prodData);
      return;
    }

    // Klick irgendwo auf eine Aktionsprodukt-Kachel (Aktionen-Seite) -> Detailansicht.
    // Ausnahme: der "Reservieren"-Link (a) führt normal in den Shop.
    const aktCard = e.target.closest('.card[data-akt-prod-id]');
    if (aktCard && !e.target.closest('a')) {
      openInfoModalForProduct(aktionsProdukteById[aktCard.dataset.aktProdId]);
      return;
    }

    // Klick irgendwo auf eine Shop-Produktkachel (nicht auf einen Button) -> Detailansicht
    const shopCard = e.target.closest('.prod-card--compact');
    if (shopCard && shopCard.dataset.id && !e.target.closest('button') && !e.target.closest('a')) {
      openInfoModalForProduct(shopProductsById[shopCard.dataset.id]);
      return;
    }

    if (e.target === ccModal) ccModal.classList.remove('is-open');
    if (e.target === productInfoModal) productInfoModal.classList.remove('is-open');
  });

  // Öffnet die Detailansicht für ein Produktobjekt (normProduct-Form, inkl. weiterer Bilder)
  function openInfoModalForProduct(p) {
    if (!p) return;
    openInfoModal({
      id: p.id, title: p.title, brand: p.brand,
      price: p.price, sale: p.salePrice, img: p.img,
      desc: p.desc, specs: p.specs,
      images: (p.images && p.images.length) ? p.images : (p.img ? [p.img] : [])
    });
  }

  if (infoModalReserveBtn) {
    infoModalReserveBtn.addEventListener('click', () => {
      if (!currentTargetProduct) return;
      // Auf der Shop-Seite gibt es das Reservierungs-Modal -> direkt öffnen.
      // Auf der Aktionen-Seite fehlt es -> zum Shop mit vorausgewähltem Produkt.
      if (ccModal) openReservationModal(currentTargetProduct);
      else window.location.href = 'click-and-collect.html?produkt=' + encodeURIComponent(currentTargetProduct.id);
    });
  }

  if (ccModalClose) ccModalClose.addEventListener('click', () => ccModal.classList.remove('is-open'));
  if (productInfoClose) productInfoClose.addEventListener('click', () => productInfoModal.classList.remove('is-open'));
  if (ccFinishBtn) ccFinishBtn.addEventListener('click', () => ccModal.classList.remove('is-open'));

  if (ccForm) {
    ccForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('ccName').value.trim();
      const phone = document.getElementById('ccPhone').value.trim();

      if (!currentTargetProduct || !currentTargetProduct.id) return;

      const submitBtn = ccForm.querySelector('[type="submit"]');
      const prevLabel = submitBtn ? submitBtn.innerHTML : '';
      const oldErr = ccForm.querySelector('.cc-error');
      if (oldErr) oldErr.remove();
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span>Wird reserviert …</span>'; }

      try {
        const result = await LoeglAPI.createReservation(currentTargetProduct.id, name, phone);

        document.getElementById('succName').textContent = name;
        document.getElementById('succTitle').textContent = result.product_title || currentTargetProduct.title;

        ccStepForm.style.display = 'none';
        ccStepSuccess.style.display = 'block';

        // Lagerbestand im Shop aktualisieren (DB hat um 1 reduziert)
        renderPublicProducts();
      } catch (err) {
        console.error('Reservierung fehlgeschlagen:', err);
        const msg = (err && err.message && /Lager|verfügbar|gefunden/i.test(err.message))
          ? err.message
          : 'Die Reservierung hat nicht geklappt. Bitte prüfen Sie Ihre Angaben und versuchen Sie es erneut.';
        const p = document.createElement('p');
        p.className = 'cc-error';
        p.style.cssText = 'color:#c62828;font-weight:600;margin-top:1rem;font-size:0.9rem;';
        p.textContent = msg;
        ccForm.appendChild(p);
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = prevLabel; }
      }
    });
  }

  /* =========================================================
     GALERIE-LIGHTBOX (Impressionen)
     ========================================================= */
  const galleryItems = Array.from(document.querySelectorAll('.gallery__grid .gallery__item'));
  const glBox = document.getElementById('galleryLightbox');
  if (galleryItems.length && glBox) {
    const glImg = document.getElementById('glImg');
    const glCaption = document.getElementById('glCaption');
    const glCounter = document.getElementById('glCounter');
    const glClose = document.getElementById('glClose');
    const glPrev = document.getElementById('glPrev');
    const glNext = document.getElementById('glNext');

    const slides = galleryItems.map(item => {
      const img = item.querySelector('img');
      return { src: img ? img.getAttribute('src') : '', alt: img ? (img.getAttribute('alt') || '') : '' };
    });

    let currentIndex = 0;
    let closeTimer = null;

    function showSlide(i) {
      currentIndex = (i + slides.length) % slides.length;
      const slide = slides[currentIndex];
      glImg.setAttribute('src', slide.src);
      glImg.setAttribute('alt', slide.alt);
      glCaption.textContent = slide.alt;
      glCounter.textContent = (currentIndex + 1) + ' / ' + slides.length;
    }

    function openLightbox(i) {
      clearTimeout(closeTimer);
      showSlide(i);
      glBox.hidden = false;
      document.body.classList.add('glightbox-open');
      // force reflow, then trigger fade/scale transition (robust even when tab isn't compositing)
      void glBox.offsetWidth;
      glBox.classList.add('is-open');
      glClose.focus();
    }

    function closeLightbox() {
      glBox.classList.remove('is-open');
      document.body.classList.remove('glightbox-open');
      closeTimer = setTimeout(() => { glBox.hidden = true; }, 300);
    }

    galleryItems.forEach((item, i) => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      const img = item.querySelector('img');
      item.setAttribute('aria-label', 'Bild vergrößern: ' + (img ? (img.getAttribute('alt') || 'Impression') : 'Impression'));
      item.addEventListener('click', () => openLightbox(i));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
    });

    glClose.addEventListener('click', closeLightbox);
    glPrev.addEventListener('click', () => showSlide(currentIndex - 1));
    glNext.addEventListener('click', () => showSlide(currentIndex + 1));
    // Click on backdrop (outside image/controls) closes
    glBox.addEventListener('click', (e) => { if (e.target === glBox) closeLightbox(); });

    document.addEventListener('keydown', (e) => {
      if (glBox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showSlide(currentIndex - 1);
      else if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
    });

    // Touch-Swipe (Mobil)
    let touchStartX = 0;
    glBox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    glBox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) showSlide(currentIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  // Copyright Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
