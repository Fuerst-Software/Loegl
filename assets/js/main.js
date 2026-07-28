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
    id: 'BOSCH-301',
    title: 'Bosch MUM5 Küchenmaschine Serie 4',
    brand: 'Bosch',
    category: 'elektro bosch',
    price: '299,90 €',
    stock: 4,
    active: true,
    img: 'assets/products/bosch_mum5.jpg',
    desc: 'Die Bosch MUM5 ist der vielseitige Allrounder in der modernen Küche. Dank 3D PlanetaryMixing verbleiben keine Teigreste am Schüsselrand.',
    specs: 'Leistung: 1000 Watt | Schüssel: 3,9L Edelstahl'
  },
  {
    id: 'MIELE-401',
    title: 'Miele Complete C3 PowerLine Staubsauger',
    brand: 'Miele',
    category: 'elektro miele',
    price: '289,00 €',
    stock: 5,
    active: true,
    img: 'assets/products/miele_c3.jpg',
    desc: 'Spitzenklasse in der Bodenpflege: Der Miele Complete C3 besticht durch extrem hohe Saugleistung und hygienischen AirClean Filter.',
    specs: 'Motor: PowerLine 890W | Filter: AirClean Plus Filter'
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
    title: 'Miele Jubiläums-Cashback Aktion',
    type: 'angebot',
    date: 'Gültig bis 15. September 2026',
    active: true,
    img: 'assets/products/miele_c3.jpg',
    desc: 'Beim Kauf eines Miele Complete C3 Bodenstaubsaugers schenken wir Ihnen 50 € Direkt-Gutschrift an der Kassa in Mattsee.',
    badge: '50 € Direkt-Gutschrift vor Ort'
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
  try { return JSON.parse(data); } catch (e) { return DEFAULT_PRODUCTS; }
}

function getShopAktionen() {
  const data = localStorage.getItem('loegl_aktionen');
  if (!data) {
    localStorage.setItem('loegl_aktionen', JSON.stringify(DEFAULT_AKTIONEN));
    return DEFAULT_AKTIONEN;
  }
  try { return JSON.parse(data); } catch (e) { return DEFAULT_AKTIONEN; }
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
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !burger.contains(e.target) && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
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
  const productGrid = document.getElementById('productGrid');
  const catalogFilters = document.getElementById('catalogFilters');

  function renderPublicProducts() {
    if (!productGrid) return;
    const allProducts = getShopProducts();
    const activeProducts = allProducts.filter(p => p.active !== false);

    productGrid.innerHTML = '';
    if (activeProducts.length === 0) {
      productGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;"><p style="color: var(--ink-soft); font-size: 1.1rem;">Derzeit sind keine Artikel im Click &amp; Collect Shop freigeschaltet.</p></div>`;
    } else {
      activeProducts.forEach(prod => {
        const article = document.createElement('article');
        article.className = 'prod-card prod-card--compact reveal is-in';
        article.dataset.category = prod.category || 'haushalt';

        const inStock = (prod.stock || 0) > 0;
        const stockBadge = inStock
          ? `<span style="font-size: 0.68rem; font-weight: 700; color: #2e7d32; background: rgba(46, 125, 50, 0.1); padding: 0.25em 0.6em; border-radius: 4px;">● Auf Lager</span>`
          : `<span style="font-size: 0.68rem; font-weight: 700; color: #c62828; background: rgba(198, 40, 40, 0.1); padding: 0.25em 0.6em; border-radius: 4px;">● Ausverkauft</span>`;

        const reserveBtnHtml = inStock
          ? `<button type="button" class="btn btn--primary reserve-btn" style="padding: 0.55em 0.4em; font-size: 0.78rem;"
              data-id="${prod.id}" data-title="${prod.title}" data-brand="${prod.brand}" data-price="${prod.price}" data-img="${prod.img}">
              <span>Reservieren</span>
            </button>`
          : `<button type="button" class="btn btn--ghost" style="padding: 0.55em 0.4em; font-size: 0.78rem; opacity: 0.5; cursor: not-allowed;" disabled>
              <span>Ausverkauft</span>
            </button>`;

        article.innerHTML = `
          <div class="prod-card__img">
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
              <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 0.8rem;">
                <span style="font-size: 0.72rem; color: var(--ink-soft);">UVP Preis</span>
                <strong style="font-family: var(--serif); font-size: 1.4rem; color: var(--ink);">${prod.price}</strong>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;">
                <button type="button" class="btn btn--ghost info-btn" style="padding: 0.55em 0.4em; font-size: 0.78rem;"
                  data-id="${prod.id}" data-title="${prod.title}" data-brand="${prod.brand}" data-price="${prod.price}" data-img="${prod.img}" data-desc="${prod.desc || ''}" data-specs="${prod.specs || ''}">
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

  function renderPublicAktionen() {
    if (!aktionenGrid) return;

    const allAktionen = getShopAktionen();
    const activeAktionen = allAktionen.filter(a => a.active !== false);

    aktionenGrid.innerHTML = '';

    if (activeAktionen.length === 0) {
      aktionenGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
          <p style="color: var(--ink-soft); font-size: 1.05rem;">Derzeit sind keine Aktionen geschaltet.</p>
        </div>
      `;
      return;
    }

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

  function openReservationModal(prodData) {
    currentTargetProduct = prodData;
    if (ccProductImg) ccProductImg.src = prodData.img;
    if (ccProductTitle) ccProductTitle.textContent = prodData.title;
    if (ccProductBrand) ccProductBrand.textContent = prodData.brand;
    if (ccProductPrice) ccProductPrice.textContent = prodData.price;

    if (ccForm) ccForm.reset();
    if (ccStepForm) ccStepForm.style.display = 'block';
    if (ccStepSuccess) ccStepSuccess.style.display = 'none';

    if (productInfoModal) productInfoModal.classList.remove('is-open');
    if (ccModal) ccModal.classList.add('is-open');
  }

  function openInfoModal(prodData) {
    currentTargetProduct = prodData;
    if (infoModalImg) infoModalImg.src = prodData.img;
    if (infoModalBrand) infoModalBrand.textContent = prodData.brand;
    if (infoModalTitle) infoModalTitle.textContent = prodData.title;
    if (infoModalPrice) infoModalPrice.textContent = prodData.price;
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
        img: infoBtn.dataset.img,
        desc: infoBtn.dataset.desc,
        specs: infoBtn.dataset.specs
      };
      openInfoModal(prodData);
      return;
    }

    if (e.target === ccModal) ccModal.classList.remove('is-open');
    if (e.target === productInfoModal) productInfoModal.classList.remove('is-open');
  });

  if (infoModalReserveBtn) {
    infoModalReserveBtn.addEventListener('click', () => {
      if (currentTargetProduct) openReservationModal(currentTargetProduct);
    });
  }

  if (ccModalClose) ccModalClose.addEventListener('click', () => ccModal.classList.remove('is-open'));
  if (productInfoClose) productInfoClose.addEventListener('click', () => productInfoModal.classList.remove('is-open'));
  if (ccFinishBtn) ccFinishBtn.addEventListener('click', () => ccModal.classList.remove('is-open'));

  if (ccForm) {
    ccForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('ccName').value.trim();

      // Decrement stock in localStorage if product ID is known
      if (currentTargetProduct && currentTargetProduct.id) {
        const allProducts = getShopProducts();
        const prod = allProducts.find(p => p.id === currentTargetProduct.id);
        if (prod && prod.stock > 0) {
          prod.stock = prod.stock - 1;
          localStorage.setItem('loegl_products', JSON.stringify(allProducts));
          renderPublicProducts();
        }
      }

      const randomCode = 'LÖGL-CC-' + Math.floor(10000 + Math.random() * 90000);
      document.getElementById('succName').textContent = name;
      document.getElementById('succCode').textContent = randomCode;
      document.getElementById('succTitle').textContent = currentTargetProduct ? currentTargetProduct.title : 'Gewählter Artikel';

      ccStepForm.style.display = 'none';
      ccStepSuccess.style.display = 'block';
    });
  }

  // Copyright Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
