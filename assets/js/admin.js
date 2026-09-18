/* =========================================================
   LÖGL Haus- & Küchengeräte — Inhaber Admin Portal
   Backend: Supabase (Auth + PostgreSQL + Storage)
   Voraussetzung: supabase-js (CDN) + supabase-config.js + api.js
   sind VOR dieser Datei geladen.
   ========================================================= */

// Preis-Eingabe robust in Zahl umwandeln ("249,00 €" | "249" | "199.9" -> Number)
function parsePrice(v) {
  if (typeof v === 'number') return v;
  var s = String(v == null ? '' : v).replace(/[€\s]/g, '').trim();
  if (s.indexOf(',') >= 0) { s = s.replace(/\./g, '').replace(',', '.'); }
  var n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
// Zahl -> deutsches Eingabeformat ohne € ("249,00")
function priceInputValue(n) {
  return Number(n || 0).toLocaleString('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
// Bildpfad für Admin-Kontext (/admin/) korrigieren
function adminImgPath(img) {
  var p = img || '../assets/products/wmf_topfset.jpg';
  if (!p.startsWith('../') && !p.startsWith('http') && !p.startsWith('data:')) p = '../' + p;
  return p;
}

document.addEventListener('DOMContentLoaded', () => {

  if (!window.LoeglAPI) {
    alert('Fehler: Verbindung zum Backend nicht verfügbar. Bitte Seite neu laden.');
    return;
  }

  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');

  const adminLoginForm = document.getElementById('adminLoginForm');
  const loginUser = document.getElementById('loginUser');
  const loginPass = document.getElementById('loginPass');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');

  // aktuelle Daten (für Bearbeiten/Umschalten ohne erneutes Laden)
  let currentProducts = [];
  let currentAktionen = [];

  /* ---------------- TAB-NAVIGATION ---------------- */
  const navTabProducts = document.getElementById('navTabProducts');
  const navTabAktionen = document.getElementById('navTabAktionen');
  const navTabReservations = document.getElementById('navTabReservations');
  const tabProductsView = document.getElementById('tabProductsView');
  const tabAktionenView = document.getElementById('tabAktionenView');
  const tabReservationsView = document.getElementById('tabReservationsView');

  function activateTab(which) {
    [navTabProducts, navTabAktionen, navTabReservations].forEach(b => b && b.classList.remove('is-active'));
    if (tabProductsView) tabProductsView.style.display = 'none';
    if (tabAktionenView) tabAktionenView.style.display = 'none';
    if (tabReservationsView) tabReservationsView.style.display = 'none';
    if (which === 'products') { navTabProducts && navTabProducts.classList.add('is-active'); if (tabProductsView) tabProductsView.style.display = 'block'; renderDashboard(); }
    if (which === 'aktionen') { navTabAktionen && navTabAktionen.classList.add('is-active'); if (tabAktionenView) tabAktionenView.style.display = 'block'; renderAktionenDashboard(); }
    if (which === 'reservations') { navTabReservations && navTabReservations.classList.add('is-active'); if (tabReservationsView) tabReservationsView.style.display = 'block'; renderReservations(); }
  }
  if (navTabProducts) navTabProducts.addEventListener('click', () => activateTab('products'));
  if (navTabAktionen) navTabAktionen.addEventListener('click', () => activateTab('aktionen'));
  if (navTabReservations) navTabReservations.addEventListener('click', () => activateTab('reservations'));

  /* ---------------- SESSION / LOGIN ---------------- */
  async function checkSession() {
    let session = null;
    try { session = await LoeglAPI.getSession(); } catch (e) { session = null; }
    if (session) {
      if (loginView) loginView.style.display = 'none';
      if (dashboardView) dashboardView.style.display = 'flex';
      renderDashboard();
      renderAktionenDashboard();
      updateOpenReservationsKpi();
    } else {
      if (loginView) loginView.style.display = 'flex';
      if (dashboardView) dashboardView.style.display = 'none';
    }
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (loginError) loginError.style.display = 'none';
      const btn = adminLoginForm.querySelector('[type="submit"]');
      const prev = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = 'Anmelden …'; }
      try {
        const { error } = await LoeglAPI.signIn(loginUser.value.trim(), loginPass.value);
        if (error) throw error;
        await checkSession();
      } catch (err) {
        console.error('Login fehlgeschlagen:', err);
        if (loginError) { loginError.textContent = 'Ungültige Anmeldedaten.'; loginError.style.display = 'block'; }
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = prev; }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await LoeglAPI.signOut(); } catch (e) {}
      checkSession();
    });
  }

  /* ---------------- PRODUKTE ---------------- */
  const kpiTotal = document.getElementById('kpiTotal');
  const kpiActive = document.getElementById('kpiActive');
  const kpiInactive = document.getElementById('kpiInactive');
  const adminProductTableBody = document.getElementById('adminProductTableBody');
  const adminSearch = document.getElementById('adminSearch');

  async function renderDashboard() {
    if (!adminProductTableBody) return;
    adminProductTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:3rem;color:var(--ink-soft);">Produkte werden geladen …</td></tr>`;
    try {
      currentProducts = await LoeglAPI.getAllProducts();
    } catch (err) {
      console.error(err);
      adminProductTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:3rem;color:#c62828;">Produkte konnten nicht geladen werden.</td></tr>`;
      return;
    }
    const products = currentProducts;
    if (kpiTotal) kpiTotal.textContent = products.length;
    if (kpiActive) kpiActive.textContent = products.filter(p => p.active !== false).length;
    if (kpiInactive) kpiInactive.textContent = products.filter(p => p.active === false).length;

    const query = adminSearch ? adminSearch.value.toLowerCase().trim() : '';
    const filtered = products.filter(p => (p.title || '').toLowerCase().includes(query) || (p.brand || '').toLowerCase().includes(query));

    adminProductTableBody.innerHTML = '';
    if (filtered.length === 0) {
      adminProductTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 3rem; color: var(--ink-soft);">Keine Produkte gefunden.</td></tr>`;
      return;
    }

    filtered.forEach(prod => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="${adminImgPath(prod.img)}" alt="${prod.title}" style="width: 52px; height: 52px; object-fit: contain; background: #fff; padding: 0.3rem; border-radius: 8px; border: 1px solid var(--line); flex-shrink: 0;" />
            <div>
              <strong style="display: block; color: var(--ink); font-size: 0.98rem;">${prod.title}</strong>
              <span style="font-size: 0.76rem; color: var(--ink-soft); font-family: monospace;">${prod.sku || ''}</span>
            </div>
          </div>
        </td>
        <td>
          <strong style="color: var(--gold-dark); font-size: 0.85rem; text-transform: uppercase;">${prod.brand || ''}</strong><br />
          <span style="font-size: 0.8rem; color: var(--ink-soft);">${prod.category || ''}</span>
        </td>
        <td>${prod.salePrice
          ? `<span style="font-size:0.72rem;color:var(--ink-soft);text-decoration:line-through;display:block;font-family:var(--sans);font-variant-numeric:tabular-nums;">${prod.price}</span><strong style="font-family:var(--sans);font-variant-numeric:tabular-nums;letter-spacing:-0.01em;font-size:1.15rem;color:var(--gold-dark);">${prod.salePrice}</strong>`
          : `<strong style="font-family:var(--sans);font-variant-numeric:tabular-nums;letter-spacing:-0.01em;font-size:1.15rem;color:var(--ink);">${prod.price}</strong>`}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button class="stock-btn" onclick="adjustStock('${prod.id}', -1)">-</button>
            <span style="font-weight: 700; min-width: 24px; text-align: center; color: var(--ink);">${prod.stock}</span>
            <button class="stock-btn" onclick="adjustStock('${prod.id}', 1)">+</button>
          </div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <label class="switch">
              <input type="checkbox" ${prod.active !== false ? 'checked' : ''} onchange="toggleProductActive('${prod.id}', this.checked)" />
              <span class="slider"></span>
            </label>
            <span style="font-size: 0.82rem; font-weight: 700; color: ${prod.active !== false ? '#2e7d32' : '#e0934a'};">
              ${prod.active !== false ? 'Aktiv (Im Shop)' : 'Pausiert'}
            </span>
          </div>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button class="btn btn--ghost" style="padding: 0.45em 0.85em; font-size: 0.78rem;" onclick="editProduct('${prod.id}')">Bearbeiten</button>
            <button class="btn btn--ghost" style="padding: 0.45em 0.85em; font-size: 0.78rem; color: #c62828; border-color: rgba(198,40,40,0.25);" onclick="deleteProduct('${prod.id}')">Löschen</button>
          </div>
        </td>
      `;
      adminProductTableBody.appendChild(tr);
    });
  }

  if (adminSearch) adminSearch.addEventListener('input', renderDashboard);

  window.adjustStock = async function (id, delta) {
    const prod = currentProducts.find(p => p.id === id);
    if (!prod) return;
    const newStock = Math.max(0, (prod.stock || 0) + delta);
    try {
      await LoeglAPI.saveProduct({ id: prod.id, sku: prod.sku, title: prod.title, brand: prod.brand, category: prod.category, price: prod.priceRaw, sale_price: prod.salePriceRaw, stock: newStock, active: prod.active, img: prod.img, desc: prod.desc, specs: prod.specs });
      prod.stock = newStock;
      renderDashboard();
    } catch (err) { console.error(err); alert('Lagerbestand konnte nicht gespeichert werden.'); }
  };

  window.toggleProductActive = async function (id, state) {
    const prod = currentProducts.find(p => p.id === id);
    if (!prod) return;
    try {
      await LoeglAPI.saveProduct({ id: prod.id, sku: prod.sku, title: prod.title, brand: prod.brand, category: prod.category, price: prod.priceRaw, sale_price: prod.salePriceRaw, stock: prod.stock, active: state, img: prod.img, desc: prod.desc, specs: prod.specs });
      renderDashboard();
    } catch (err) { console.error(err); alert('Status konnte nicht gespeichert werden.'); renderDashboard(); }
  };

  window.deleteProduct = async function (id) {
    const prod = currentProducts.find(p => p.id === id);
    if (prod && confirm(`Möchten Sie das Produkt "${prod.title}" löschen?`)) {
      try { await LoeglAPI.deleteProduct(id); renderDashboard(); }
      catch (err) { console.error(err); alert('Produkt konnte nicht gelöscht werden.'); }
    }
  };

  /* ---------------- AKTIONEN ---------------- */
  const kpiAktionenTotal = document.getElementById('kpiAktionenTotal');
  const kpiAktionenActive = document.getElementById('kpiAktionenActive');
  const kpiAktionenSaisonal = document.getElementById('kpiAktionenSaisonal') || document.getElementById('kpiAktionenRueckruf');
  const adminAktionTableBody = document.getElementById('adminAktionTableBody');
  const adminAktionSearch = document.getElementById('adminAktionSearch');

  async function renderAktionenDashboard() {
    if (!adminAktionTableBody) return;
    adminAktionTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:3rem;color:var(--ink-soft);">Aktionen werden geladen …</td></tr>`;
    try {
      currentAktionen = await LoeglAPI.getAllAktionen();
    } catch (err) {
      console.error(err);
      adminAktionTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:3rem;color:#c62828;">Aktionen konnten nicht geladen werden.</td></tr>`;
      return;
    }
    const aktionen = currentAktionen;
    if (kpiAktionenTotal) kpiAktionenTotal.textContent = aktionen.length;
    if (kpiAktionenActive) kpiAktionenActive.textContent = aktionen.filter(a => a.active !== false).length;
    if (kpiAktionenSaisonal) kpiAktionenSaisonal.textContent = aktionen.filter(a => a.type === 'saisonal').length;

    const query = adminAktionSearch ? adminAktionSearch.value.toLowerCase().trim() : '';
    const filtered = aktionen.filter(a => (a.title || '').toLowerCase().includes(query) || (a.desc || '').toLowerCase().includes(query));

    adminAktionTableBody.innerHTML = '';
    if (filtered.length === 0) {
      adminAktionTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--ink-soft);">Keine Aktionen gefunden.</td></tr>`;
      return;
    }

    filtered.forEach(akt => {
      const tr = document.createElement('tr');
      let typeBadgeHtml = `<span style="font-size: 0.72rem; font-weight: 700; color: var(--gold-dark); background: var(--gold-light); padding: 0.25em 0.6em; border-radius: 4px;">Sonderangebot</span>`;
      if (akt.type === 'saisonal') {
        typeBadgeHtml = `<span style="font-size: 0.72rem; font-weight: 700; color: #1565c0; background: rgba(21, 101, 192, 0.1); padding: 0.25em 0.6em; border-radius: 4px;">Saisonales Highlight</span>`;
      }
      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="${adminImgPath(akt.img)}" alt="${akt.title}" style="width: 52px; height: 52px; object-fit: contain; background: #fff; padding: 0.3rem; border-radius: 8px; border: 1px solid var(--line); flex-shrink: 0;" />
            <div>
              <strong style="display: block; color: var(--ink); font-size: 0.98rem;">${akt.title}</strong>
            </div>
          </div>
        </td>
        <td>${typeBadgeHtml}</td>
        <td><strong style="font-size: 0.88rem; color: var(--ink);">${akt.date || ''}</strong></td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <label class="switch">
              <input type="checkbox" ${akt.active !== false ? 'checked' : ''} onchange="toggleAktionActive('${akt.id}', this.checked)" />
              <span class="slider"></span>
            </label>
            <span style="font-size: 0.82rem; font-weight: 700; color: ${akt.active !== false ? '#2e7d32' : '#e0934a'};">
              ${akt.active !== false ? 'Aktiv (Im Shop)' : 'Pausiert'}
            </span>
          </div>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button class="btn btn--ghost" style="padding: 0.45em 0.85em; font-size: 0.78rem;" onclick="editAktion('${akt.id}')">Bearbeiten</button>
            <button class="btn btn--ghost" style="padding: 0.45em 0.85em; font-size: 0.78rem; color: #c62828; border-color: rgba(198,40,40,0.25);" onclick="deleteAktion('${akt.id}')">Löschen</button>
          </div>
        </td>
      `;
      adminAktionTableBody.appendChild(tr);
    });
  }

  if (adminAktionSearch) adminAktionSearch.addEventListener('input', renderAktionenDashboard);

  window.toggleAktionActive = async function (id, state) {
    const akt = currentAktionen.find(a => a.id === id);
    if (!akt) return;
    try {
      await LoeglAPI.saveAktion({ id: akt.id, title: akt.title, type: akt.type, date: akt.date, active: state, img: akt.img, desc: akt.desc, badge: akt.badge });
      renderAktionenDashboard();
    } catch (err) { console.error(err); alert('Status konnte nicht gespeichert werden.'); renderAktionenDashboard(); }
  };

  window.deleteAktion = async function (id) {
    const akt = currentAktionen.find(a => a.id === id);
    if (akt && confirm(`Möchten Sie die Aktion "${akt.title}" wirklich löschen?`)) {
      try { await LoeglAPI.deleteAktion(id); renderAktionenDashboard(); }
      catch (err) { console.error(err); alert('Aktion konnte nicht gelöscht werden.'); }
    }
  };

  /* ---------------- PRODUKT-MODAL ---------------- */
  const productModal = document.getElementById('productModal');
  const openAddModalBtn = document.getElementById('openAddModalBtn');
  const productModalClose = document.getElementById('productModalClose');
  const productForm = document.getElementById('productForm');

  const pmId = document.getElementById('pmId');
  const pmTitle = document.getElementById('pmTitle');
  const pmBrand = document.getElementById('pmBrand');
  const pmCategory = document.getElementById('pmCategory');
  const pmPrice = document.getElementById('pmPrice');
  const pmSalePrice = document.getElementById('pmSalePrice');
  const pmStock = document.getElementById('pmStock');
  const pmImg = document.getElementById('pmImg');
  const pmFileInput = document.getElementById('pmFileInput');
  const pmThumbs = document.getElementById('pmThumbs');
  const pmDesc = document.getElementById('pmDesc');
  const pmSpecs = document.getElementById('pmSpecs');

  // Bild-Galerie-Zustand des Produkt-Formulars
  let pmImages = [];    // alle Bild-URLs (Reihenfolge)
  let pmMainImg = '';   // gewähltes Hauptbild (Titelbild)

  function renderPmThumbs() {
    if (!pmThumbs) return;
    pmThumbs.innerHTML = '';
    if (!pmImages.length) {
      pmThumbs.innerHTML = '<p style="font-size:0.78rem;color:var(--ink-soft);margin:0.6rem 0 0;">Noch keine Bilder – bitte oben auswählen.</p>';
      return;
    }
    pmImages.forEach((url) => {
      const isMain = (url === pmMainImg);
      const div = document.createElement('div');
      div.className = 'pm-thumb' + (isMain ? ' is-main' : '');
      div.innerHTML =
        (isMain ? '<span class="pm-thumb__badge">Hauptbild</span>' : '') +
        '<img src="' + adminImgPath(url) + '" alt="" />' +
        '<div class="pm-thumb__btns">' +
        '<button type="button" class="pm-thumb__btn" title="Als Hauptbild festlegen">★</button>' +
        '<button type="button" class="pm-thumb__btn pm-thumb__btn--del" title="Bild entfernen">✕</button>' +
        '</div>';
      const b = div.querySelectorAll('.pm-thumb__btn');
      b[0].addEventListener('click', () => { pmMainImg = url; renderPmThumbs(); });
      b[1].addEventListener('click', () => {
        pmImages = pmImages.filter((u) => u !== url);
        if (pmMainImg === url) pmMainImg = pmImages[0] || '';
        renderPmThumbs();
      });
      pmThumbs.appendChild(div);
    });
  }

  if (pmFileInput) {
    pmFileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      for (const file of files) {
        let ph = null;
        if (pmThumbs) { ph = document.createElement('div'); ph.className = 'pm-thumb pm-thumb--loading'; ph.textContent = 'lädt …'; pmThumbs.appendChild(ph); }
        try {
          const blob = await LoeglAPI.processImage(file, 'product');
          const url = await LoeglAPI.uploadImage(blob);
          pmImages.push(url);
          if (!pmMainImg) pmMainImg = url;
        } catch (err) {
          console.error('Bild-Upload fehlgeschlagen:', err);
          alert('Ein Bild konnte nicht hochgeladen werden: ' + (err.message || err));
        }
        if (ph) ph.remove();
        renderPmThumbs();
      }
      e.target.value = '';
    });
  }

  if (openAddModalBtn) {
    openAddModalBtn.addEventListener('click', () => {
      if (productForm) productForm.reset();
      if (pmId) pmId.value = '';
      pmImages = [];
      pmMainImg = '';
      renderPmThumbs();
      if (productModal) productModal.classList.add('is-open');
    });
  }
  if (productModalClose) productModalClose.addEventListener('click', () => { if (productModal) productModal.classList.remove('is-open'); });

  window.editProduct = function (id) {
    const prod = currentProducts.find(p => p.id === id);
    if (prod && productModal) {
      if (pmId) pmId.value = prod.id;
      if (pmTitle) pmTitle.value = prod.title;
      if (pmBrand) pmBrand.value = prod.brand;
      if (pmCategory) pmCategory.value = (prod.category || '').split(' ')[0] || 'haushalt';
      if (pmPrice) pmPrice.value = priceInputValue(prod.priceRaw);
      if (pmSalePrice) pmSalePrice.value = (prod.salePriceRaw != null) ? priceInputValue(prod.salePriceRaw) : '';
      if (pmStock) pmStock.value = prod.stock;
      if (pmDesc) pmDesc.value = prod.desc || '';
      if (pmSpecs) pmSpecs.value = prod.specs || '';
      pmImages = (prod.images && prod.images.length) ? prod.images.slice() : (prod.img ? [prod.img] : []);
      pmMainImg = prod.img || pmImages[0] || '';
      renderPmThumbs();
      productModal.classList.add('is-open');
    }
  };

  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = productForm.querySelector('[type="submit"]');
      const prev = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = 'Speichern …'; }
      try {
        const imgVal = pmMainImg || pmImages[0] || 'assets/products/wmf_topfset.jpg';

        const idVal = pmId.value;
        const existing = idVal ? currentProducts.find(p => p.id === idVal) : null;
        await LoeglAPI.saveProduct({
          id: idVal || undefined,
          sku: existing ? existing.sku : null,
          title: pmTitle.value.trim(),
          brand: pmBrand.value.trim(),
          category: `${pmCategory.value} ${pmBrand.value.toLowerCase().replace(/\s+/g, '')}`,
          price: parsePrice(pmPrice.value),
          sale_price: pmSalePrice.value.trim() ? parsePrice(pmSalePrice.value) : null,
          stock: parseInt(pmStock.value) || 0,
          active: existing ? existing.active : true,
          img: imgVal,
          images: pmImages.length ? pmImages : (imgVal ? [imgVal] : []),
          desc: pmDesc.value.trim(),
          specs: pmSpecs.value.trim()
        });
        if (productModal) productModal.classList.remove('is-open');
        renderDashboard();
      } catch (err) {
        console.error('Produkt speichern fehlgeschlagen:', err);
        alert('Das Produkt konnte nicht gespeichert werden: ' + (err.message || err));
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = prev; }
      }
    });
  }

  /* ---------------- AKTION-MODAL ---------------- */
  const aktionModal = document.getElementById('aktionModal');
  const openAddAktionModalBtn = document.getElementById('openAddAktionModalBtn');
  const aktionModalClose = document.getElementById('aktionModalClose');
  const aktionForm = document.getElementById('aktionForm');

  const amId = document.getElementById('amId');
  const amTitle = document.getElementById('amTitle');
  const amType = document.getElementById('amType');
  const amDate = document.getElementById('amDate');
  const amImg = document.getElementById('amImg');
  const amFileInput = document.getElementById('amFileInput');
  const amImagePreview = document.getElementById('amImagePreview');
  const amDesc = document.getElementById('amDesc');
  const amBadge = document.getElementById('amBadge');
  let amProcessedBlob = null;

  if (amFileInput) {
    amFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      amProcessedBlob = null;
      if (amImagePreview) amImagePreview.style.opacity = '0.5';
      try {
        const blob = await LoeglAPI.processImage(file, 'aktion');
        amProcessedBlob = blob;
        if (amImagePreview) amImagePreview.src = URL.createObjectURL(blob);
      } catch (err) {
        console.error('Bildaufbereitung fehlgeschlagen:', err);
        amProcessedBlob = file;
        const reader = new FileReader();
        reader.onload = (evt) => { if (amImagePreview) amImagePreview.src = evt.target.result; };
        reader.readAsDataURL(file);
      } finally {
        if (amImagePreview) amImagePreview.style.opacity = '1';
      }
    });
  }

  if (openAddAktionModalBtn) {
    openAddAktionModalBtn.addEventListener('click', () => {
      if (aktionForm) aktionForm.reset();
      if (amId) amId.value = '';
      if (amImg) amImg.value = '';
      amProcessedBlob = null;
      if (amImagePreview) amImagePreview.src = '../assets/products/wmf_topfset.jpg';
      if (aktionModal) aktionModal.classList.add('is-open');
    });
  }
  if (aktionModalClose) aktionModalClose.addEventListener('click', () => { if (aktionModal) aktionModal.classList.remove('is-open'); });

  window.editAktion = function (id) {
    const akt = currentAktionen.find(a => a.id === id);
    if (akt && aktionModal) {
      amProcessedBlob = null;
      if (amId) amId.value = akt.id;
      if (amTitle) amTitle.value = akt.title;
      if (amType) amType.value = akt.type;
      if (amDate) amDate.value = akt.date || '';
      if (amImg) amImg.value = akt.img || '';
      if (amDesc) amDesc.value = akt.desc || '';
      if (amBadge) amBadge.value = akt.badge || '';
      if (amImagePreview) amImagePreview.src = adminImgPath(akt.img);
      aktionModal.classList.add('is-open');
    }
  };

  if (aktionForm) {
    aktionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = aktionForm.querySelector('[type="submit"]');
      const prev = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = 'Speichern …'; }
      try {
        let imgVal = (amImg.value || '').trim();
        if (imgVal.startsWith('../assets/')) imgVal = imgVal.replace('../assets/', 'assets/');
        if (amProcessedBlob) { imgVal = await LoeglAPI.uploadImage(amProcessedBlob); }
        if (!imgVal) imgVal = 'assets/products/wmf_topfset.jpg';

        const cleanBadge = (amBadge.value || '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        const idVal = amId.value;
        const existing = idVal ? currentAktionen.find(a => a.id === idVal) : null;
        await LoeglAPI.saveAktion({
          id: idVal || undefined,
          title: amTitle.value.trim(),
          type: amType.value,
          date: amDate.value.trim(),
          active: existing ? existing.active : true,
          img: imgVal,
          desc: amDesc.value.trim(),
          badge: cleanBadge
        });
        if (aktionModal) aktionModal.classList.remove('is-open');
        renderAktionenDashboard();
      } catch (err) {
        console.error('Aktion speichern fehlgeschlagen:', err);
        alert('Die Aktion konnte nicht gespeichert werden: ' + (err.message || err));
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = prev; }
      }
    });
  }

  /* ---------------- RESERVIERUNGEN ---------------- */
  const reservationsBody = document.getElementById('reservationsBody');
  const resFilterBtns = Array.from(document.querySelectorAll('#resFilters .res-filter'));
  let resFilter = 'all';
  resFilterBtns.forEach(btn => btn.addEventListener('click', () => {
    resFilter = btn.dataset.status;
    resFilterBtns.forEach(b => b.classList.toggle('is-active', b === btn));
    renderReservations();
  }));

  async function renderReservations() {
    if (!reservationsBody) return;
    reservationsBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:3rem;color:var(--ink-soft);">Reservierungen werden geladen …</td></tr>`;
    let list;
    try { list = await LoeglAPI.getReservations(); }
    catch (err) { console.error(err); reservationsBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:3rem;color:#c62828;">Reservierungen konnten nicht geladen werden.</td></tr>`; return; }

    // Zähler je Status an den Filter-Buttons
    const counts = { all: list.length, offen: 0, abgeholt: 0, storniert: 0 };
    list.forEach(r => { if (counts[r.status] != null) counts[r.status]++; });
    const labels = { all: 'Alle', offen: 'Offen', abgeholt: 'Abgeholt', storniert: 'Storniert' };
    resFilterBtns.forEach(btn => {
      const s = btn.dataset.status;
      btn.textContent = (labels[s] || s) + ' (' + (counts[s] != null ? counts[s] : 0) + ')';
    });

    const filtered = (resFilter === 'all') ? list : list.filter(r => r.status === resFilter);
    if (!filtered.length) {
      reservationsBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:3rem;color:var(--ink-soft);">${list.length ? 'Keine Reservierungen mit diesem Status.' : 'Noch keine Reservierungen.'}</td></tr>`;
      return;
    }
    const statusColor = { offen: '#e0934a', abgeholt: '#2e7d32', storniert: '#c62828' };
    reservationsBody.innerHTML = '';
    filtered.forEach(r => {
      const d = new Date(r.created_at);
      const dateStr = d.toLocaleString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span style="font-size:0.85rem;color:var(--ink);font-weight:600;">${dateStr}</span></td>
        <td><strong style="color:var(--ink);">${r.product_title || '—'}</strong></td>
        <td>
          <strong style="color:var(--ink);font-size:0.98rem;">${r.customer_name}</strong><br>
          <a href="tel:${r.customer_phone}" style="font-size:0.8rem;color:var(--ink-soft);">${r.customer_phone}</a>
          ${r.customer_email ? `<br><a href="mailto:${r.customer_email}" style="font-size:0.8rem;color:var(--ink-soft);">${r.customer_email}</a>` : ''}
        </td>
        <td><span style="font-size:0.78rem;font-weight:700;color:${statusColor[r.status] || 'var(--ink-soft)'};text-transform:uppercase;">${r.status}</span></td>
        <td style="text-align:right;">
          <div style="display:flex;gap:0.4rem;justify-content:flex-end;flex-wrap:wrap;">
            <button class="btn btn--ghost" style="padding:0.4em 0.7em;font-size:0.74rem;" onclick="setReservationStatus('${r.id}','abgeholt')">Abgeholt</button>
            <button class="btn btn--ghost" style="padding:0.4em 0.7em;font-size:0.74rem;" onclick="setReservationStatus('${r.id}','offen')">Offen</button>
            <button class="btn btn--ghost" style="padding:0.4em 0.7em;font-size:0.74rem;color:#c62828;border-color:rgba(198,40,40,0.25);" onclick="setReservationStatus('${r.id}','storniert')">Stornieren</button>
          </div>
        </td>
      `;
      reservationsBody.appendChild(tr);
    });
  }

  window.setReservationStatus = async function (id, status) {
    try { await LoeglAPI.setReservationStatus(id, status); renderReservations(); updateOpenReservationsKpi(); }
    catch (err) { console.error(err); alert('Status konnte nicht geändert werden.'); }
  };

  async function updateOpenReservationsKpi() {
    const el = document.getElementById('kpiOpenRes');
    if (!el) return;
    try {
      const list = await LoeglAPI.getReservations();
      el.textContent = list.filter(r => r.status === 'offen').length + ' Stk.';
    } catch (e) { el.textContent = '–'; }
  }

  // Init
  checkSession();
});
